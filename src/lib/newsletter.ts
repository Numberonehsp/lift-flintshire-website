// Client-side checks for the newsletter sign-up form. The server (api/_lib/marketing.ts)
// repeats the same simple rule; api/ and src/ cannot share code, so keep the two in step.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254

export interface NewsletterInputError {
  field: 'email' | 'consent'
  message: string
}

export function newsletterInputError(email: string, consent: boolean): NewsletterInputError | null {
  const value = email.trim()
  if (!value) return { field: 'email', message: 'Please enter your email address.' }
  if (value.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(value)) {
    return { field: 'email', message: 'Please enter a valid email address, like name@example.com.' }
  }
  if (!consent) return { field: 'consent', message: 'Please tick the box so we know you want our emails.' }
  return null
}

export const SUBSCRIBED_MESSAGE = "Thanks, you're on the list."
export const CONFIRM_EMAIL_MESSAGE = 'Check your inbox to confirm your email address.'

/** /api/subscribe answers `confirmEmail: true` when Brevo double opt-in is on. */
export function subscribeSuccessMessage(response: unknown): string {
  const confirm =
    typeof response === 'object' && response !== null && (response as { confirmEmail?: unknown }).confirmEmail === true
  return confirm ? CONFIRM_EMAIL_MESSAGE : SUBSCRIBED_MESSAGE
}
