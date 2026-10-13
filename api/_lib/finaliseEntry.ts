// api/_lib/finaliseEntry.ts — server only. Never imported from src/.
// Everything that happens once an entry is confirmed (paid in Stripe, or free), shared by
// api/stripe-webhook.ts and the free path in api/create-entry.ts so both behave the same.
//
// The entry is already saved as `paid` before this runs. Nothing here may throw: a failed
// email must never turn a confirmed entry into an error (or a Stripe retry loop).
// Logs never include an email address or an API key.

import { Resend } from 'resend'
import { entryConfirmationHtml, entryConfirmationSubject, organiserNotification } from './entryEmails.js'

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

function resendDeps(): FinaliseEntryDeps {
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
  }
}

export async function finaliseEntry(p: FinaliseEntryParams, deps: FinaliseEntryDeps = resendDeps()): Promise<void> {
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
}
