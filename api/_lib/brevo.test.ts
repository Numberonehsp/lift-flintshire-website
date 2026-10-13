import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { upsertContact, resetListCache, BREVO_TIMEOUT_MS } from './brevo.js'

type Call = { url: string; init?: RequestInit }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function method(init?: RequestInit): string {
  return (init?.method ?? 'GET').toUpperCase()
}

/** Stub fetch. `lists` is what GET /contacts/lists reports; `contact` decides the contact POST response. */
function stubBrevo(opts: {
  lists?: { id: number; name: string }[]
  nextListId?: number
  contact?: (body: Record<string, unknown>, attempt: number) => Response
} = {}) {
  const calls: Call[] = []
  const lists = opts.lists ?? []
  let nextListId = opts.nextListId ?? 100
  let contactAttempts = 0
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    const path = new URL(url).pathname
    if (path === '/v3/contacts/lists' && method(init) === 'GET') {
      const u = new URL(url)
      const limit = Number(u.searchParams.get('limit') ?? 10)
      const offset = Number(u.searchParams.get('offset') ?? 0)
      return json({ lists: lists.slice(offset, offset + limit), count: lists.length })
    }
    if (path === '/v3/contacts/lists' && method(init) === 'POST') {
      return json({ id: nextListId++ }, 201)
    }
    if (path === '/v3/contacts' && method(init) === 'POST') {
      contactAttempts++
      const body = JSON.parse(init!.body as string)
      return opts.contact ? opts.contact(body, contactAttempts) : json({ id: 21 }, 201)
    }
    return json({ code: 'document_not_found', message: 'unexpected' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, fetchMock }
}

function contactCalls(calls: Call[]): Call[] {
  return calls.filter(c => new URL(c.url).pathname === '/v3/contacts' && method(c.init) === 'POST')
}

function bodyOf(call: Call): Record<string, unknown> {
  return JSON.parse(call.init!.body as string)
}

describe('upsertContact', () => {
  const savedKey = process.env.BREVO_API_KEY
  const savedFolder = process.env.BREVO_FOLDER_ID

  beforeEach(() => {
    resetListCache()
    process.env.BREVO_API_KEY = 'test-key'
    process.env.BREVO_FOLDER_ID = '1'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    if (savedKey === undefined) delete process.env.BREVO_API_KEY
    else process.env.BREVO_API_KEY = savedKey
    if (savedFolder === undefined) delete process.env.BREVO_FOLDER_ID
    else process.env.BREVO_FOLDER_ID = savedFolder
  })

  it('creates missing lists in the folder, then upserts the contact on all of them', async () => {
    const { calls } = stubBrevo({ lists: [{ id: 7, name: 'Newsletter' }], nextListId: 9 })

    await upsertContact({
      email: 'a@example.com',
      firstName: 'Ann',
      lists: ['Newsletter', 'Event: Nov_WTR'],
    })

    const created = calls.filter(c => new URL(c.url).pathname === '/v3/contacts/lists' && method(c.init) === 'POST')
    expect(created).toHaveLength(1)
    expect(bodyOf(created[0])).toEqual({ name: 'Event: Nov_WTR', folderId: 1 })

    const [contactCall] = contactCalls(calls)
    expect(contactCall.url).toBe('https://api.brevo.com/v3/contacts')
    const body = bodyOf(contactCall)
    expect(body.email).toBe('a@example.com')
    expect((body.listIds as number[]).sort((a, b) => a - b)).toEqual([7, 9])
    expect(body.updateEnabled).toBe(true)
    expect((body.attributes as Record<string, unknown>).FIRSTNAME).toBe('Ann')

    for (const c of calls) {
      expect((c.init!.headers as Record<string, string>)['api-key']).toBe('test-key')
    }
  })

  it('sends CONSENT_DATE (ISO) and CONSENT_SOURCE attributes', async () => {
    const { calls } = stubBrevo({ lists: [{ id: 7, name: 'Newsletter' }] })

    await upsertContact({ email: 'a@example.com', lastName: 'Lee', lists: ['Newsletter'], source: 'newsletter-signup' })

    const attrs = bodyOf(contactCalls(calls)[0]).attributes as Record<string, string>
    expect(attrs.CONSENT_SOURCE).toBe('newsletter-signup')
    expect(attrs.LASTNAME).toBe('Lee')
    expect(new Date(attrs.CONSENT_DATE).toISOString()).toBe(attrs.CONSENT_DATE)
  })

  it('treats 204 (existing contact updated) as success', async () => {
    stubBrevo({
      lists: [{ id: 7, name: 'Newsletter' }],
      contact: () => new Response(null, { status: 204 }),
    })
    await expect(upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })).resolves.toBeUndefined()
  })

  it('pages through GET /contacts/lists to find a list beyond the first page', async () => {
    const lists = Array.from({ length: 60 }, (_, i) => ({ id: i + 1, name: `List ${i + 1}` }))
    const { calls } = stubBrevo({ lists })

    await upsertContact({ email: 'a@example.com', lists: ['List 55'] })

    const created = calls.filter(c => new URL(c.url).pathname === '/v3/contacts/lists' && method(c.init) === 'POST')
    expect(created).toHaveLength(0)
    expect(bodyOf(contactCalls(calls)[0]).listIds).toEqual([55])
  })

  it('caches list ids between calls until resetListCache()', async () => {
    const { calls } = stubBrevo({ lists: [{ id: 7, name: 'Newsletter' }] })
    const listGets = () => calls.filter(c => new URL(c.url).pathname === '/v3/contacts/lists' && method(c.init) === 'GET')

    await upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })
    await upsertContact({ email: 'b@example.com', lists: ['Newsletter'] })
    expect(listGets()).toHaveLength(1)

    resetListCache()
    await upsertContact({ email: 'c@example.com', lists: ['Newsletter'] })
    expect(listGets()).toHaveLength(2)
  })

  it('retries once without attributes when Brevo answers 400 invalid_parameter', async () => {
    const { calls } = stubBrevo({
      lists: [{ id: 7, name: 'Newsletter' }],
      contact: (body, attempt) =>
        attempt === 1 && body.attributes
          ? json({ code: 'invalid_parameter', message: 'Attribute CONSENT_DATE does not exist' }, 400)
          : json({ id: 21 }, 201),
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await upsertContact({ email: 'a@example.com', firstName: 'Ann', lists: ['Newsletter'], source: 'x' })

    const posts = contactCalls(calls)
    expect(posts).toHaveLength(2)
    expect(bodyOf(posts[0]).attributes).toBeDefined()
    const retry = bodyOf(posts[1])
    expect(retry.attributes).toBeUndefined()
    expect(retry.email).toBe('a@example.com')
    expect(retry.listIds).toEqual([7])
    expect(retry.updateEnabled).toBe(true)
    expect(errSpy).toHaveBeenCalledTimes(1)
    const line = errSpy.mock.calls[0].map(String).join(' ')
    expect(line).toContain('BREVO_CONSENT_ATTRS_DROPPED')
    expect(line).not.toContain('a@example.com')
    expect(line).not.toContain('Ann')
  })

  it('does not retry without attributes for a 400 with any other code', async () => {
    const { calls } = stubBrevo({
      lists: [{ id: 7, name: 'Newsletter' }],
      contact: () => json({ code: 'missing_parameter', message: 'email is missing' }, 400),
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(upsertContact({ email: 'a@example.com', lists: ['Newsletter'], source: 'x' })).rejects.toThrow(/400/)
    expect(contactCalls(calls).every(c => bodyOf(c).attributes !== undefined)).toBe(true)
  })

  it('throws on a non-2xx contact response', async () => {
    stubBrevo({
      lists: [{ id: 7, name: 'Newsletter' }],
      contact: () => json({ code: 'unauthorized', message: 'Key not found' }, 401),
    })
    await expect(upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })).rejects.toThrow(/401/)
  })

  it('throws on a non-2xx list lookup', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ code: 'unauthorized', message: 'nope' }, 401)))
    await expect(upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })).rejects.toThrow(/401/)
  })

  it('throws before creating a list when BREVO_FOLDER_ID is missing', async () => {
    delete process.env.BREVO_FOLDER_ID
    const { calls } = stubBrevo({ lists: [] })
    await expect(upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })).rejects.toThrow(/BREVO_FOLDER_ID/)
    expect(contactCalls(calls)).toHaveLength(0)
  })

  it('never logs the email address or the API key', async () => {
    stubBrevo({
      lists: [{ id: 7, name: 'Newsletter' }],
      contact: () => json({ code: 'invalid_parameter', message: 'Invalid email a@example.com' }, 400),
    })
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map(m =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    )

    let thrown: unknown
    try {
      await upsertContact({ email: 'a@example.com', lists: ['Newsletter'], source: 'x' })
    } catch (e) {
      thrown = e
    }
    expect(thrown).toBeInstanceOf(Error)

    const logged = spies.flatMap(s => s.mock.calls).map(args => args.map(a => String(a)).join(' '))
    logged.push((thrown as Error).message)
    for (const line of logged) {
      expect(line).not.toContain('a@example.com')
      expect(line).not.toContain('test-key')
    }
  })

  it('bounds every Brevo request with a 5 second abort signal', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout')
    const { calls } = stubBrevo({ lists: [], nextListId: 9 })
    await upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })
    expect(BREVO_TIMEOUT_MS).toBe(5000)
    expect(calls.length).toBeGreaterThan(1)
    for (const c of calls) expect(c.init?.signal).toBeInstanceOf(AbortSignal)
    expect(timeoutSpy).toHaveBeenCalledTimes(calls.length)
    expect(timeoutSpy.mock.calls.every(([ms]) => ms === 5000)).toBe(true)
  })

  it('rejects with an ordinary error on timeout, without retrying', async () => {
    const fetchMock = vi.fn(async () => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError') })
    vi.stubGlobal('fetch', fetchMock)
    const err = await upsertContact({ email: 'a@example.com', lists: ['Newsletter'] }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Error)
    expect((err as Error).name).toBe('TimeoutError')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does nothing when BREVO_API_KEY is not set', async () => {
    delete process.env.BREVO_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
