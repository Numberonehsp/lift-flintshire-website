// api/_lib/brevo.ts — server only. Never imported from src/.
// Brevo REST API v3 (developers.brevo.com, checked 2026-10-13):
//   GET  /v3/contacts/lists?limit=&offset=  -> 200 { lists: [{ id, name, folderId, ... }], count }
//   POST /v3/contacts/lists { name, folderId } -> 201 { id }
//   GET  /v3/contacts/folders?limit=&offset= -> 200 { folders: [{ id, name, ... }], count }  (checked 2026-10-19;
//        limit defaults to 10, no maximum is documented, so the same page size as lists is used)
//   POST /v3/contacts/folders { name } -> 201 { id }  (checked 2026-10-19)
//   POST /v3/contacts { email, attributes, listIds, updateEnabled } -> 201 { id } (new) or 204 (updated)
//   POST /v3/contacts/doubleOptinConfirmation { email, includeListIds, templateId, redirectionUrl,
//        attributes? } -> 201 {}  (checked 2026-10-19; includeListIds, templateId and redirectionUrl
//        are required; excludeListIds and contactPixelTrackingConsent are optional and unused here)
//   Errors: 4xx { code, message }. Auth: `api-key` header.
// Never log the email address or the API key. Callers must treat a thrown error (including a
// TimeoutError after BREVO_TIMEOUT_MS) as non-fatal.

const BASE_URL = 'https://api.brevo.com/v3'
const PAGE_SIZE = 50
/** Folder new lists go in when BREVO_FOLDER_ID is not set. Matched case-insensitively. */
export const DEFAULT_FOLDER_NAME = 'Lift Flintshire website'
const INVALID_PARAMETER = 'invalid_parameter'
/** Every Brevo request is abandoned after this long; the abort rejects like any other error. */
export const BREVO_TIMEOUT_MS = 5000

export interface UpsertContactParams {
  email: string
  firstName?: string
  lastName?: string
  /** Brevo list names; missing lists are created in the folder (see resolveFolderId). */
  lists: string[]
  /** The form or page the consent came from; stored as CONSENT_SOURCE. */
  source?: string
  /** Extra Brevo attributes (uppercase names that already exist in the account). */
  attributes?: Record<string, string | number | boolean>
}

/** List name -> Brevo list id. Module-level so warm serverless invocations reuse it. */
const listCache = new Map<string, number>()
/** Folder id found or created by name. Same lifetime as listCache. */
let folderIdCache: number | undefined

export function resetListCache(): void {
  listCache.clear()
  folderIdCache = undefined
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
    signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
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

async function findFolderByName(apiKey: string, wanted: string): Promise<number | undefined> {
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = (await brevoFetch(apiKey, 'folder lookup', `/contacts/folders?limit=${PAGE_SIZE}&offset=${offset}`, {
      method: 'GET',
    })) as { folders?: { id: number; name: string }[]; count?: number } | undefined
    const folders = page?.folders ?? []
    const match = folders.find(f => typeof f.name === 'string' && f.name.trim().toLowerCase() === wanted)
    if (match) return match.id
    const total = page?.count ?? 0
    if (folders.length < PAGE_SIZE || offset + folders.length >= total) return undefined
  }
}

/**
 * Folder new lists are created in: a numeric BREVO_FOLDER_ID if set, otherwise the folder named
 * BREVO_FOLDER_NAME (default DEFAULT_FOLDER_NAME), created if it does not exist yet.
 */
async function resolveFolderId(apiKey: string): Promise<number> {
  const fromEnv = Number.parseInt(process.env.BREVO_FOLDER_ID ?? '', 10)
  if (Number.isFinite(fromEnv)) return fromEnv
  if (folderIdCache !== undefined) return folderIdCache

  const name = process.env.BREVO_FOLDER_NAME?.trim() || DEFAULT_FOLDER_NAME
  let id = await findFolderByName(apiKey, name.toLowerCase())
  if (id === undefined) {
    const created = (await brevoFetch(apiKey, 'folder creation', '/contacts/folders', {
      method: 'POST',
      body: { name },
    })) as { id?: unknown } | undefined
    if (typeof created?.id !== 'number') throw new BrevoError('folder creation', 201, 'no_id')
    id = created.id
  }
  folderIdCache = id
  return id
}

async function resolveListIds(apiKey: string, names: string[]): Promise<number[]> {
  const unique = [...new Set(names)]
  if (unique.some(n => !listCache.has(n))) {
    await loadAllLists(apiKey)
  }
  const missing = unique.filter(n => !listCache.has(n))
  if (missing.length > 0) {
    const folderId = await resolveFolderId(apiKey)
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

function consentAttributes(params: {
  source?: string
  firstName?: string
  lastName?: string
  attributes?: Record<string, string | number | boolean>
}): Record<string, string | number | boolean> {
  const attributes: Record<string, string | number | boolean> = {
    ...(params.attributes ?? {}),
    CONSENT_DATE: new Date().toISOString(),
  }
  if (params.source) attributes.CONSENT_SOURCE = params.source
  if (params.firstName) attributes.FIRSTNAME = params.firstName
  if (params.lastName) attributes.LASTNAME = params.lastName
  return attributes
}

/**
 * POST a contact-shaped body built from the resolved list ids, with the two shared retries:
 * once without attributes on `invalid_parameter`, once after reloading list ids on any other
 * 400/404. `body(listIds, attributes)` must omit `attributes` when it is undefined.
 */
async function postContact(
  apiKey: string,
  what: string,
  path: string,
  lists: string[],
  attributes: Record<string, string | number | boolean>,
  body: (listIds: number[], attributes?: Record<string, string | number | boolean>) => Record<string, unknown>,
): Promise<void> {
  let listIds = await resolveListIds(apiKey, lists)
  try {
    await brevoFetch(apiKey, what, path, { method: 'POST', body: body(listIds, attributes) })
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
      await brevoFetch(apiKey, `${what} (without attributes)`, path, { method: 'POST', body: body(listIds) })
      return
    }
    // Any other 400/404 may be a cached list id that no longer exists (a list deleted in Brevo
    // while this instance was warm). Reload the list ids and retry once; a second failure throws.
    if (err instanceof BrevoError && (err.status === 400 || err.status === 404)) {
      resetListCache()
      listIds = await resolveListIds(apiKey, lists)
      await brevoFetch(apiKey, `${what} (after list reload)`, path, {
        method: 'POST', body: body(listIds, attributes),
      })
      return
    }
    throw err
  }
}

/**
 * Add or update a contact and put it on the named lists.
 * No-op when BREVO_API_KEY is not set. Throws on any non-2xx response.
 */
export async function upsertContact(params: UpsertContactParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await postContact(apiKey, 'contact upsert', '/contacts', params.lists, consentAttributes(params),
    (listIds, attributes) => ({
      email: params.email,
      listIds,
      updateEnabled: true,
      ...(attributes ? { attributes } : {}),
    }))
}

export interface DoubleOptinParams {
  email: string
  firstName?: string
  /** Brevo list names the contact joins once they click the confirmation link. */
  lists: string[]
  /** Stored as CONSENT_SOURCE. */
  source?: string
  /** Numeric id of the Brevo double opt-in confirmation template. */
  templateId: number
  /** Where Brevo sends the person after they click the confirmation link. */
  redirectionUrl: string
}

/**
 * Ask Brevo to email a double opt-in confirmation; Brevo adds the contact to the lists only
 * after the link is clicked. Same key, timeout, retry and no-leak rules as upsertContact.
 * No-op when BREVO_API_KEY is not set. Throws on any non-2xx response.
 */
export async function requestDoubleOptin(params: DoubleOptinParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await postContact(apiKey, 'double opt-in request', '/contacts/doubleOptinConfirmation', params.lists,
    consentAttributes(params),
    (includeListIds, attributes) => ({
      email: params.email,
      includeListIds,
      templateId: params.templateId,
      redirectionUrl: params.redirectionUrl,
      ...(attributes ? { attributes } : {}),
    }))
}
