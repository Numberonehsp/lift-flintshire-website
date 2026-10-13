// api/_lib/finaliseEntry.ts — server only. Never imported from src/.
// Everything that happens once an entry is confirmed (paid in Stripe, or free), shared by
// api/stripe-webhook.ts and the free path in api/create-entry.ts so both behave the same.
//
// The entry is already saved as `paid` before this runs. Nothing here may throw: a failed
// email must never turn a confirmed entry into an error (or a Stripe retry loop).
// Logs never include an email address or an API key.

import { Resend } from 'resend'
import { entryConfirmationHtml, entryConfirmationSubject, organiserNotification } from './entryEmails.js'
import { upsertContact } from './brevo.js'
import type { UpsertContactParams } from './brevo.js'
import { fetchEventProgramme } from './eventLookup.js'
import { listsForEvent, isValidEmail } from './marketing.js'

export interface FinaliseEntryParams {
  entryRef: string
  eventId: string
  eventTitle: string
  tierLabel: string
  firstName: string
  lastName: string
  email: string
  /** GBP, two decimals. "0.00" for a free entry. */
  amount: string
  /** True only when the stored consent was exactly 'yes'. Only this person is added to
   *  Brevo, never a team captain's teammates. */
  marketingConsent: boolean
}

export interface EntryEmail {
  from: string
  to: string[]
  subject: string
  html: string
}

export interface FinaliseEntryDeps {
  /** Sends one email; throws on failure. */
  sendEmail(msg: EntryEmail): Promise<void>
  /** The Events sheet `programme` column for this event, or undefined. */
  lookupProgramme(eventId: string): Promise<string | undefined>
  /** Adds or updates the Brevo contact; throws on failure. */
  addContact(params: UpsertContactParams): Promise<void>
}

const EMAIL_PATTERN = /[^\s@<>"'`,;:()]+@[^\s@<>"'`,;:()]+/g

/** Error text from providers can echo the recipient address; strip it before logging. */
export function redactEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, '[email]')
}

/** A log-safe one-line summary: no stack, no request config (which can hold the entrant's row), no email addresses. */
export function describeError(err: unknown): string {
  if (err instanceof Error) return redactEmails(`${err.name}: ${err.message}`)
  return 'unknown error'
}

function defaultDeps(): FinaliseEntryDeps {
  return {
    async sendEmail(msg) {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) throw new Error('RESEND_API_KEY is not set')
      const { error } = await new Resend(apiKey).emails.send(msg)
      if (error) {
        const status = 'statusCode' in error ? ` (HTTP ${String(error.statusCode)})` : ''
        throw new Error(`Resend ${error.name ?? 'error'}${status}: ${error.message ?? ''}`)
      }
    },
    lookupProgramme: fetchEventProgramme,
    addContact: upsertContact,
  }
}

export interface FinaliseEntryOptions {
  /** Overall cap on the Brevo step (programme lookup plus contact upsert). Each Brevo request
   *  already times out after 5 s (brevo.ts), but one upsert can make several requests and the
   *  programme lookup has no timeout of its own, so this keeps the whole step bounded. */
  brevoTimeoutMs?: number
}

const DEFAULT_BREVO_TIMEOUT_MS = 8000

export async function finaliseEntry(
  p: FinaliseEntryParams,
  deps: FinaliseEntryDeps = defaultDeps(),
  { brevoTimeoutMs = DEFAULT_BREVO_TIMEOUT_MS }: FinaliseEntryOptions = {},
): Promise<void> {
  const details = {
    firstName: p.firstName, eventTitle: p.eventTitle, tierLabel: p.tierLabel, ref: p.entryRef, amount: p.amount,
  }

  try {
    await deps.sendEmail({
      from: 'Lift Flintshire Events <events@liftflintshire.co.uk>',
      to: [p.email],
      subject: entryConfirmationSubject(p.eventTitle, p.entryRef),
      html: entryConfirmationHtml(details),
    })
  } catch (err) {
    console.error(`Confirmation email failed for ${p.entryRef} (entry is saved):`, describeError(err))
  }

  try {
    const notice = organiserNotification({ ...details, email: p.email })
    await deps.sendEmail({
      from: 'Lift Flintshire Website <forms@liftflintshire.co.uk>',
      to: ['hello@liftflintshire.co.uk'],
      subject: notice.subject,
      html: notice.html,
    })
  } catch (err) {
    console.error(`Organiser email failed for ${p.entryRef} (entry is saved):`, describeError(err))
  }

  if (p.marketingConsent) {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timedOut = new Promise<'timeout'>(resolve => { timer = setTimeout(() => resolve('timeout'), brevoTimeoutMs) })
    const outcome = await Promise.race([addToBrevo(p, deps), timedOut])
    clearTimeout(timer)
    if (outcome === 'timeout') {
      console.error(`Brevo step timed out for ${p.entryRef} after ${brevoTimeoutMs} ms (non-fatal, entry is saved)`)
    }
  }
}

async function addToBrevo(p: FinaliseEntryParams, deps: FinaliseEntryDeps): Promise<void> {
  const email = p.email.trim()
  if (!isValidEmail(email)) return

  let programme: string | undefined
  try {
    programme = await deps.lookupProgramme(p.eventId)
  } catch (err) {
    // Still add them to Newsletter and the event list; only the programme list is missed.
    console.warn(`Programme lookup failed for ${p.entryRef}; adding to Brevo without a programme list:`, describeError(err))
  }

  const contact: UpsertContactParams = { email, lists: listsForEvent(p.eventId, programme), source: 'event-entry' }
  const firstName = p.firstName.trim()
  const lastName = p.lastName.trim()
  if (firstName) contact.firstName = firstName
  if (lastName) contact.lastName = lastName

  try {
    await deps.addContact(contact)
  } catch (err) {
    console.error(`Brevo error for ${p.entryRef} (non-fatal, entry is saved):`, describeError(err))
  }
}
