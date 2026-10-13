// api/_lib/subscription.ts — server only. Never imported from src/.
// Pure input checks for the newsletter sign-up endpoint (api/subscribe.ts).

import { isValidEmail } from './marketing.js'

export const MAX_SUBSCRIBE_BODY_BYTES = 2048

/** Name of the hidden field humans never fill in. */
export const HONEYPOT_FIELD = 'website'

export type SubscriptionCheck =
  | { kind: 'ok'; email: string }
  | { kind: 'invalid' }
  /** The honeypot was filled: a bot. Answer as if it worked, but do nothing. */
  | { kind: 'honeypot' }

/** True when the declared or actual body size is over the cap. */
export function isBodyTooLarge(contentLength: string | undefined, body: unknown): boolean {
  const declared = contentLength === undefined ? NaN : Number.parseInt(contentLength, 10)
  if (Number.isFinite(declared) && declared > MAX_SUBSCRIBE_BODY_BYTES) return true
  if (body === undefined || body === null) return false
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return Buffer.byteLength(text ?? '', 'utf8') > MAX_SUBSCRIBE_BODY_BYTES
}

/** Vercel parses JSON and urlencoded bodies; anything else arrives as a string. */
export function parseStringBody(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return undefined
    }
  }
  return Object.fromEntries(new URLSearchParams(trimmed))
}

export function validateSubscription(body: unknown): SubscriptionCheck {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { kind: 'invalid' }
  const fields = body as Record<string, unknown>

  const honeypot = fields[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' ? honeypot.trim() !== '' : honeypot !== undefined && honeypot !== null) {
    return { kind: 'honeypot' }
  }

  if (fields['marketing-consent'] !== 'yes') return { kind: 'invalid' }

  const email = typeof fields.email === 'string' ? fields.email.trim() : ''
  if (!isValidEmail(email)) return { kind: 'invalid' }

  return { kind: 'ok', email }
}
