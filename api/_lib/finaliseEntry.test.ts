import { describe, it, expect, vi, afterEach } from 'vitest'
import { finaliseEntry, redactEmails } from './finaliseEntry.js'
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
