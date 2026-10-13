// api/_lib/marketing.ts — server only. Never imported from src/.
// Decides whether a submission may go to Brevo and which lists it joins.
// Marketing consent is separate from gdpr-consent: only the exact value 'yes' counts.

export const NEWSLETTER_LIST = 'Newsletter'
export const YOUTH_GUARDIAN_LIST = 'Guardians: youth-weightlifting'

const REGISTER_PREFIX = 'register-'

export function hasMarketingConsent(fields: Record<string, string | undefined>): boolean {
  return fields['marketing-consent'] === 'yes'
}

/** `register-<programme id>` -> Newsletter plus `Programme: <programme id>`; anything else -> Newsletter only. */
export function listsForRegistration(formName: string): string[] {
  const programme = formName.startsWith(REGISTER_PREFIX) ? formName.slice(REGISTER_PREFIX.length).trim() : ''
  return programme ? [NEWSLETTER_LIST, `Programme: ${programme}`] : [NEWSLETTER_LIST]
}

/** Newsletter, the event's own list and, when the Events sheet names one, its programme list. */
export function listsForEvent(eventId: string, programme: string | undefined): string[] {
  const lists = [NEWSLETTER_LIST, `Event: ${eventId}`]
  const p = programme?.trim()
  if (p) lists.push(`Programme: ${p}`)
  return lists
}

/** A youth enquirer's parent or guardian joins only the guardian list, never Newsletter. */
export function listsForYouthGuardian(): string[] {
  return [YOUTH_GUARDIAN_LIST]
}
