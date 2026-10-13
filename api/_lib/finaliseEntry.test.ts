import { describe, it, expect, vi, afterEach } from 'vitest'
import { finaliseEntry, redactEmails, describeError } from './finaliseEntry.js'
import type { FinaliseEntryDeps, EntryEmail } from './finaliseEntry.js'

const entry = {
  entryRef: 'LF26-ABCDEF',
  eventId: 'Nov_WTR',
  eventTitle: "Women's Track Run",
  tierLabel: 'Entry',
  firstName: 'Ann',
  lastName: 'Jones',
  email: 'ann@example.com',
  amount: '0.00',
  marketingConsent: false,
}

function deps(overrides: Partial<FinaliseEntryDeps> = {}): FinaliseEntryDeps & { sent: EntryEmail[] } {
  const sent: EntryEmail[] = []
  return {
    sent,
    sendEmail: vi.fn(async (msg: EntryEmail) => { sent.push(msg) }),
    lookupProgramme: vi.fn(async () => undefined),
    addContact: vi.fn(async () => {}),
    ...overrides,
  }
}

afterEach(() => vi.restoreAllMocks())

describe('redactEmails', () => {
  it('removes anything that looks like an email address', () => {
    expect(redactEmails('Invalid `to` field: ann@example.com, bob.x@y.co.uk'))
      .toBe('Invalid `to` field: [email], [email]')
  })
})

describe('describeError', () => {
  it('summarises an Error without its stack, redacting addresses', () => {
    expect(describeError(new TypeError('bad to: ann@example.com'))).toBe('TypeError: bad to: [email]')
  })
  it("summarises a plain { name, message } object like Resend's error, and nothing else", () => {
    expect(describeError({ name: 'validation_error', message: 'Invalid ann@example.com', statusCode: 422, extra: 'x' }))
      .toBe('validation_error: Invalid [email]')
    expect(describeError({ message: 'oops' })).toBe('Error: oops')
  })
  it('falls back for anything else', () => {
    expect(describeError('ann@example.com')).toBe('unknown error')
    expect(describeError({ data: 'x' })).toBe('unknown error')
    expect(describeError(null)).toBe('unknown error')
  })
})

describe('finaliseEntry emails', () => {
  it('sends the entrant confirmation and the organiser notification', async () => {
    const d = deps()
    await finaliseEntry(entry, d)
    expect(d.sent).toHaveLength(2)
    expect(d.sent[0].to).toEqual(['ann@example.com'])
    expect(d.sent[0].subject).toBe("Entry confirmed: Women's Track Run (LF26-ABCDEF)")
    expect(d.sent[0].html).toContain('Your free entry is confirmed')
    expect(d.sent[1].to).toEqual(['hello@liftflintshire.co.uk'])
    expect(d.sent[1].subject).toContain('New free entry')
  })

  it('uses paid wording for a paid entry', async () => {
    const d = deps()
    await finaliseEntry({ ...entry, amount: '81.42' }, d)
    expect(d.sent[0].html).toContain('£81.42 paid')
    expect(d.sent[1].subject).toContain('New paid entry')
  })

  it('never throws when email fails, still tries the organiser email, and logs no address', async () => {
    const errors: unknown[][] = []
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => { errors.push(args) })
    const sendEmail = vi.fn(async () => { throw new Error('Invalid `to` field: ann@example.com') })
    await expect(finaliseEntry(entry, deps({ sendEmail }))).resolves.toBeUndefined()
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(errors.length).toBeGreaterThan(0)
    expect(JSON.stringify(errors)).not.toContain('ann@example.com')
  })
})

describe('finaliseEntry Brevo', () => {
  it('adds nobody to Brevo without marketing consent', async () => {
    const d = deps()
    await finaliseEntry({ ...entry, marketingConsent: false }, d)
    expect(d.addContact).not.toHaveBeenCalled()
    expect(d.lookupProgramme).not.toHaveBeenCalled()
  })

  it('adds the entrant (only) to Newsletter, the event list and the programme list', async () => {
    const d = deps({ lookupProgramme: vi.fn(async () => 'womens-run-club') })
    await finaliseEntry({ ...entry, marketingConsent: true }, d)
    expect(d.lookupProgramme).toHaveBeenCalledWith('Nov_WTR')
    expect(d.addContact).toHaveBeenCalledTimes(1)
    expect(d.addContact).toHaveBeenCalledWith({
      email: 'ann@example.com',
      firstName: 'Ann',
      lastName: 'Jones',
      lists: ['Newsletter', 'Event: Nov_WTR', 'Programme: womens-run-club'],
      source: 'event-entry',
    })
  })

  it('leaves out a blank last name', async () => {
    const d = deps()
    await finaliseEntry({ ...entry, lastName: '', marketingConsent: true }, d)
    expect(d.addContact).toHaveBeenCalledWith({
      email: 'ann@example.com', firstName: 'Ann', lists: ['Newsletter', 'Event: Nov_WTR'], source: 'event-entry',
    })
  })

  it('still adds the contact without a programme list when the lookup fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const d = deps({ lookupProgramme: vi.fn(async () => { throw new Error('Events fetch failed: 500') }) })
    await finaliseEntry({ ...entry, marketingConsent: true }, d)
    expect(d.addContact).toHaveBeenCalledWith(expect.objectContaining({ lists: ['Newsletter', 'Event: Nov_WTR'] }))
  })

  it('never throws when Brevo fails, still sends the emails, and logs no address', async () => {
    const errors: unknown[][] = []
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => { errors.push(args) })
    const d = deps({ addContact: vi.fn(async () => { throw new Error('Brevo contact upsert failed for ann@example.com') }) })
    await expect(finaliseEntry({ ...entry, marketingConsent: true }, d)).resolves.toBeUndefined()
    expect(d.sent).toHaveLength(2)
    expect(errors.length).toBeGreaterThan(0)
    expect(JSON.stringify(errors)).not.toContain('ann@example.com')
  })

  it('skips Brevo when the entrant email is not a valid address', async () => {
    const d = deps()
    await finaliseEntry({ ...entry, email: 'not-an-email', marketingConsent: true }, d)
    expect(d.addContact).not.toHaveBeenCalled()
  })
})

describe('finaliseEntry Brevo time limit', () => {
  it('treats a Brevo request timeout as a normal non-fatal error', async () => {
    const errors: unknown[][] = []
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => { errors.push(args) })
    const d = deps({
      addContact: vi.fn(async () => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError') }),
    })
    await expect(finaliseEntry({ ...entry, marketingConsent: true }, d)).resolves.toBeUndefined()
    expect(d.sent).toHaveLength(2)
    expect(JSON.stringify(errors)).toContain('TimeoutError')
  })

  it('gives up on a hung Brevo call so a confirmed entry still gets its response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const d = deps({ addContact: vi.fn(() => new Promise<void>(() => {})) })
    await expect(finaliseEntry({ ...entry, marketingConsent: true }, d, { brevoTimeoutMs: 20 })).resolves.toBeUndefined()
    expect(d.sent).toHaveLength(2)
  })
})
