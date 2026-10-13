// api/_lib/marketing.ts — server only. Never imported from src/.
// Decides whether a submission may go to Brevo and which lists it joins.
// Marketing consent is separate from gdpr-consent: only the exact value 'yes' counts.

export const NEWSLETTER_LIST = 'Newsletter'
export const YOUTH_GUARDIAN_LIST = 'Guardians: youth-weightlifting'

const REGISTER_PREFIX = 'register-'

export function hasMarketingConsent(fields: Record<string, string | undefined>): boolean {
  return fields['marketing-consent'] === 'yes'
}

/** The only programme ids that get a `Programme: <id>` list. Anything else (a made-up form
 *  name, a typo in the Events sheet) never creates a Brevo list. */
export const PROGRAMME_IDS: ReadonlySet<string> = new Set([
  'couch-to-5k', 'womens-run-club', 'run-club', 'stay-strong', 'weightlifting',
])

/** `register-<known programme id>` -> Newsletter plus `Programme: <id>`; anything else -> null (no Brevo call). */
export function listsForRegistration(formName: string): string[] | null {
  if (!formName.startsWith(REGISTER_PREFIX)) return null
  const programme = formName.slice(REGISTER_PREFIX.length).trim()
  return PROGRAMME_IDS.has(programme) ? [NEWSLETTER_LIST, `Programme: ${programme}`] : null
}

/** Newsletter, the event's own list and, when the Events sheet names a known programme, its programme list. */
export function listsForEvent(eventId: string, programme: string | undefined): string[] {
  const lists = [NEWSLETTER_LIST, `Event: ${eventId}`]
  const p = programme?.trim()
  if (p) {
    if (PROGRAMME_IDS.has(p)) lists.push(`Programme: ${p}`)
    else console.warn('Events sheet programme is not a known programme id; skipping the programme list')
  }
  return lists
}

/** A youth enquirer's parent or guardian joins only the guardian list, never Newsletter. */
export function listsForYouthGuardian(): string[] {
  return [YOUTH_GUARDIAN_LIST]
}

export const YOUTH_ENQUIRY_FORM = 'enquiry-youth-strength-conditioning'

// Deliberately simple: one @, no spaces, a dot in the domain. Brevo does its own checks.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254

export function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(value)
}

export interface BrevoContact {
  email: string
  firstName?: string
  lastName?: string
  lists: string[]
}

/**
 * Who (if anyone) a form submission adds to Brevo, and on which lists.
 * - No `marketing-consent === 'yes'` -> null.
 * - Youth enquiry -> the parent or guardian's email only, guardian list only. Never the
 *   young person's name, school year or the guardian's name.
 * - `register-<known programme>` -> the registrant (or guardian) email and name, Newsletter plus programme list.
 * - Anything else (contact, other enquiries, questionnaires) -> null.
 */
export function brevoContactForSubmission(
  formName: string,
  fields: Record<string, string | undefined>,
): BrevoContact | null {
  if (!hasMarketingConsent(fields)) return null

  if (formName === YOUTH_ENQUIRY_FORM) {
    const email = fields['guardian-email']?.trim() ?? ''
    return isValidEmail(email) ? { email, lists: listsForYouthGuardian() } : null
  }

  if (formName.startsWith(REGISTER_PREFIX)) {
    const email = (fields['guardian-email'] ?? fields['email'])?.trim() ?? ''
    if (!isValidEmail(email)) return null
    const lists = listsForRegistration(formName)
    if (!lists) return null
    const contact: BrevoContact = { email, lists }
    const firstName = fields['first-name']?.trim()
    const lastName = fields['last-name']?.trim()
    if (firstName) contact.firstName = firstName
    if (lastName) contact.lastName = lastName
    return contact
  }

  return null
}
