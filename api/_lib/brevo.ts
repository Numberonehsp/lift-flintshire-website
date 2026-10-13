// api/_lib/brevo.ts — server only. Never imported from src/.
// Brevo REST API v3 (developers.brevo.com, checked 2026-10-13):
//   GET  /v3/contacts/lists?limit=&offset=  -> 200 { lists: [{ id, name, folderId, ... }], count }
//   POST /v3/contacts/lists { name, folderId } -> 201 { id }
//   POST /v3/contacts { email, attributes, listIds, updateEnabled } -> 201 { id } (new) or 204 (updated)
//   Errors: 4xx { code, message }. Auth: `api-key` header.
// Never log the email address or the API key. Callers must treat a thrown error as non-fatal.

const BASE_URL = 'https://api.brevo.com/v3'
const PAGE_SIZE = 50
const INVALID_PARAMETER = 'invalid_parameter'

export interface UpsertContactParams {
  email: string
  firstName?: string
  lastName?: string
  /** Brevo list names; missing lists are created in BREVO_FOLDER_ID. */
  lists: string[]
  /** The form or page the consent came from; stored as CONSENT_SOURCE. */
  source?: string
  /** Extra Brevo attributes (uppercase names that already exist in the account). */
  attributes?: Record<string, string | number | boolean>
}

/** List name -> Brevo list id. Module-level so warm serverless invocations reuse it. */
const listCache = new Map<string, number>()

export function resetListCache(): void {
  listCache.clear()
}

class BrevoError extends Error {
  readonly status: number
  readonly code?: string
  constructor(what: string, status: number, code?: string) {
    // Only the status and Brevo's error code: the message text may echo the email address.
    super(`Brevo ${what} failed: HTTP ${status}${code ? ` (${code})` : ''}`)
    this.name = 'BrevoError'
    this.status = status
    this.code = code
  }
}

async function brevoFetch(apiKey: string, what: string, path: string, init: { method: string; body?: unknown }): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method,
    headers: {
      'api-key': apiKey,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  if (!res.ok) {
    let code: string | undefined
    try {
      const err = (await res.json()) as { code?: unknown }
      if (typeof err?.code === 'string') code = err.code
    } catch {
      // non-JSON error body; status is enough
    }
    throw new BrevoError(what, res.status, code)
  }
  if (res.status === 204) return undefined
  const text = await res.text()
  return text ? JSON.parse(text) : undefined
}

async function loadAllLists(apiKey: string): Promise<void> {
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = (await brevoFetch(apiKey, 'list lookup', `/contacts/lists?limit=${PAGE_SIZE}&offset=${offset}`, {
      method: 'GET',
    })) as { lists?: { id: number; name: string }[]; count?: number } | undefined
    const lists = page?.lists ?? []
    for (const l of lists) {
      if (!listCache.has(l.name)) listCache.set(l.name, l.id)
    }
    const total = page?.count ?? 0
    if (lists.length < PAGE_SIZE || offset + lists.length >= total) return
  }
}

async function resolveListIds(apiKey: string, names: string[]): Promise<number[]> {
  const unique = [...new Set(names)]
  if (unique.some(n => !listCache.has(n))) {
    await loadAllLists(apiKey)
  }
  const missing = unique.filter(n => !listCache.has(n))
  if (missing.length > 0) {
    const folderId = Number.parseInt(process.env.BREVO_FOLDER_ID ?? '', 10)
    if (!Number.isFinite(folderId)) {
      throw new Error('BREVO_FOLDER_ID is not set to a numeric folder id; cannot create Brevo lists')
    }
    for (const name of missing) {
      const created = (await brevoFetch(apiKey, 'list creation', '/contacts/lists', {
        method: 'POST',
        body: { name, folderId },
      })) as { id: number }
      listCache.set(name, created.id)
    }
  }
  return unique.map(n => listCache.get(n)!)
}

/**
 * Add or update a contact and put it on the named lists.
 * No-op when BREVO_API_KEY is not set. Throws on any non-2xx response.
 */
export async function upsertContact(params: UpsertContactParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  const listIds = await resolveListIds(apiKey, params.lists)

  const attributes: Record<string, string | number | boolean> = {
    ...(params.attributes ?? {}),
    CONSENT_DATE: new Date().toISOString(),
  }
  if (params.source) attributes.CONSENT_SOURCE = params.source
  if (params.firstName) attributes.FIRSTNAME = params.firstName
  if (params.lastName) attributes.LASTNAME = params.lastName

  const base = { email: params.email, listIds, updateEnabled: true }

  try {
    await brevoFetch(apiKey, 'contact upsert', '/contacts', { method: 'POST', body: { ...base, attributes } })
  } catch (err) {
    // Brevo rejects attributes that do not exist in the account yet (CONSENT_DATE / CONSENT_SOURCE
    // must be created by hand) with `invalid_parameter` ("wrong format or type", per
    // developers.brevo.com/docs/how-it-works, checked 2026-10-13). Only that code is retried,
    // once, without attributes, to keep the list membership. Fixed tag, no values.
    if (err instanceof BrevoError && err.status === 400 && err.code === INVALID_PARAMETER) {
      console.error(
        'BREVO_CONSENT_ATTRS_DROPPED: Brevo answered invalid_parameter; retrying without attributes. ' +
          'Check that CONSENT_DATE and CONSENT_SOURCE exist in Brevo.',
      )
      await brevoFetch(apiKey, 'contact upsert (without attributes)', '/contacts', { method: 'POST', body: base })
      return
    }
    throw err
  }
}
