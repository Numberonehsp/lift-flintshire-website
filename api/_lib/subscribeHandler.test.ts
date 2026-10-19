// Lives in api/_lib so Vercel does not deploy it as a function (every other file in api/ is one).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from '../subscribe.js'
import { resetListCache } from './brevo.js'

const ENV_KEYS = ['BREVO_API_KEY', 'BREVO_FOLDER_ID', 'BREVO_DOI_TEMPLATE_ID', 'SITE_URL'] as const
const EMAIL = 'news@example.com'

function fakeRes() {
  const res = { statusCode: 0, body: undefined as unknown, headers: {} as Record<string, string> }
  const api = {
    status(code: number) { res.statusCode = code; return api },
    json(body: unknown) { res.body = body; return api },
    setHeader(k: string, v: string) { res.headers[k] = v; return api },
  }
  return { res, api: api as unknown as VercelResponse }
}

function req(body: unknown): VercelRequest {
  return { method: 'POST', headers: {}, body } as unknown as VercelRequest
}

/** Stub Brevo: Newsletter list exists as id 7; contact and DOI posts answer with the given statuses. */
function stubBrevo(opts: { contactStatus?: number; doiStatus?: number } = {}) {
  const calls: { path: string; body?: Record<string, unknown> }[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    const body = init?.body ? JSON.parse(init.body as string) : undefined
    calls.push({ path, body })
    const json = (b: unknown, status: number) =>
      new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } })
    if (path === '/v3/contacts/lists') return json({ lists: [{ id: 7, name: 'Newsletter' }], count: 1 }, 200)
    if (path === '/v3/contacts') {
      const s = opts.contactStatus ?? 201
      return s < 300 ? json({ id: 1 }, s) : json({ code: 'internal_error', message: EMAIL }, s)
    }
    if (path === '/v3/contacts/doubleOptinConfirmation') {
      const s = opts.doiStatus ?? 201
      return s < 300 ? json({}, s) : json({ code: 'internal_error', message: EMAIL }, s)
    }
    return json({ code: 'document_not_found' }, 404)
  }))
  return calls
}

describe('POST /api/subscribe', () => {
  const saved = Object.fromEntries(ENV_KEYS.map(k => [k, process.env[k]]))
  const valid = { email: EMAIL, 'marketing-consent': 'yes', website: '' }

  beforeEach(() => {
    resetListCache()
    for (const k of ENV_KEYS) delete process.env[k]
    process.env.BREVO_API_KEY = 'test-key'
    process.env.BREVO_FOLDER_ID = '1'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k]
    }
  })

  it('without BREVO_DOI_TEMPLATE_ID adds the contact directly (unchanged behaviour)', async () => {
    const calls = stubBrevo()
    const { res, api } = fakeRes()

    await handler(req(valid), api)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true })
    expect(calls.map(c => c.path)).toContain('/v3/contacts')
    expect(calls.map(c => c.path)).not.toContain('/v3/contacts/doubleOptinConfirmation')
  })

  it('with BREVO_DOI_TEMPLATE_ID sends the double opt-in request and tells the form to ask for confirmation', async () => {
    process.env.BREVO_DOI_TEMPLATE_ID = '12'
    process.env.SITE_URL = 'https://preview.example.com'
    const calls = stubBrevo()
    const { res, api } = fakeRes()

    await handler(req(valid), api)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true, confirmEmail: true })
    expect(calls.map(c => c.path)).not.toContain('/v3/contacts')
    const doi = calls.find(c => c.path === '/v3/contacts/doubleOptinConfirmation')!
    expect(doi.body).toMatchObject({
      email: EMAIL,
      includeListIds: [7],
      templateId: 12,
      redirectionUrl: 'https://preview.example.com/newsletter?confirmed=1',
      attributes: { CONSENT_SOURCE: 'newsletter-signup' },
    })
  })

  it('treats an invalid BREVO_DOI_TEMPLATE_ID as unset', async () => {
    process.env.BREVO_DOI_TEMPLATE_ID = 'abc'
    const calls = stubBrevo()
    const { res, api } = fakeRes()

    await handler(req(valid), api)

    expect(res.body).toEqual({ success: true })
    expect(calls.map(c => c.path)).toContain('/v3/contacts')
  })

  it('returns the generic error when the DOI request fails, without logging the email', async () => {
    process.env.BREVO_DOI_TEMPLATE_ID = '12'
    stubBrevo({ doiStatus: 500 })
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { res, api } = fakeRes()

    await handler(req(valid), api)

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Sorry, we could not sign you up just now. Please try again later.' })
    expect(errors).toHaveBeenCalled()
    for (const call of errors.mock.calls) {
      const line = call.join(' ')
      expect(line).not.toContain(EMAIL)
      expect(line).not.toContain('test-key')
    }
  })

  it('a honeypot hit gets a plain success and no Brevo call, even with DOI on', async () => {
    process.env.BREVO_DOI_TEMPLATE_ID = '12'
    const calls = stubBrevo()
    const { res, api } = fakeRes()

    await handler(req({ ...valid, website: 'spam' }), api)

    expect(res.body).toEqual({ success: true })
    expect(calls).toHaveLength(0)
  })
})
