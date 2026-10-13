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
