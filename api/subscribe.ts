import type { VercelRequest, VercelResponse } from '@vercel/node'
import { upsertContact } from './_lib/brevo.js'
import { NEWSLETTER_LIST } from './_lib/marketing.js'
import { isBodyTooLarge, parseStringBody, validateSubscription } from './_lib/subscription.js'

// Newsletter sign-up. Body (JSON or urlencoded): { email, 'marketing-consent': 'yes', website: '' }.
// `website` is a honeypot: filled means a bot, which gets a 200 and nothing else.
// Error messages are deliberately generic, and the email address is never logged.

const GENERIC_INVALID = 'Please enter a valid email address and tick the box to sign up.'
const GENERIC_FAILURE = 'Sorry, we could not sign you up just now. Please try again later.'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentLength = req.headers['content-length']
  const raw: unknown = req.body
  if (isBodyTooLarge(typeof contentLength === 'string' ? contentLength : undefined, raw)) {
    return res.status(413).json({ error: GENERIC_INVALID })
  }

  const body = typeof raw === 'string' ? parseStringBody(raw) : raw
  const check = validateSubscription(body)
  if (check.kind === 'honeypot') return res.status(200).json({ success: true })
  if (check.kind === 'invalid') return res.status(400).json({ error: GENERIC_INVALID })

  // upsertContact is a silent no-op without the key; here that would tell the person they
  // signed up when nothing was saved, so fail loudly instead.
  if (!process.env.BREVO_API_KEY) {
    console.error('Newsletter sign-up: BREVO_API_KEY not set')
    return res.status(500).json({ error: GENERIC_FAILURE })
  }

  try {
    await upsertContact({ email: check.email, lists: [NEWSLETTER_LIST], source: 'newsletter-signup' })
    return res.status(200).json({ success: true })
  } catch (err) {
    // BrevoError messages carry only the HTTP status and Brevo's error code, never the email.
    console.error('Newsletter sign-up: Brevo error:', err instanceof Error ? err.message : 'unknown error')
    return res.status(500).json({ error: GENERIC_FAILURE })
  }
}
