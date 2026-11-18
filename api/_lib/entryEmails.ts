// api/_lib/entryEmails.ts — server only. Never imported from src/.
// Pure wording for event entry emails, shared by paid (Stripe webhook) and free entries.

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Amounts are GBP strings with two decimals, for example "0.00" or "81.42". */
export function isFreeAmount(amount: string): boolean {
  return Number(amount) === 0
}

export interface EntryEmailDetails {
  firstName: string
  eventTitle: string
  tierLabel: string
  ref: string
  /** GBP, two decimals. "0.00" means a free entry. */
  amount: string
}

const MAX_TITLE_IN_SUBJECT = 120
const MAX_NAME_IN_SUBJECT = 60

/** Subject-safe text: CR/LF (and other line breaks) become a space, then trimmed and capped. */
export function subjectText(value: string, max: number): string {
  return value.replace(/[\r\n\u2028\u2029]+/g, ' ').trim().slice(0, max).trim()
}

/** Generic across every event (free or paid) so the wording never needs touching event to event. */
export function entryConfirmationSubject(): string {
  return 'Welcome to Lift Flintshire!'
}

export function entryConfirmationHtml({ firstName, eventTitle, tierLabel, ref, amount }: EntryEmailDetails): string {
  const name = escapeHtml(firstName)
  const title = escapeHtml(eventTitle)
  const tier = escapeHtml(tierLabel)
  const reference = escapeHtml(ref)
  const confirmedLine = isFreeAmount(amount)
    ? `<strong>${title}</strong> — ${tier}.`
    : `<strong>${title}</strong> — ${tier}, £${escapeHtml(amount)} paid.`
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#376A6B;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">Welcome to Lift Flintshire!</h2>
        <p style="margin:4px 0 0;opacity:.85;font-size:14px">
          You're in — thanks for registering your interest. We'll be in touch with info about upcoming events.
        </p>
      </div>
      <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
        <p>Hi ${name},</p>
        <p>Thanks so much for getting involved — our aim is to increase opportunities and lower the
        barriers so that anyone has the chance to move, exercise and feel more confident in North Wales.</p>
        <p>You're confirmed for ${confirmedLine} Entry reference: <strong>${reference}</strong> — keep
        it handy for event day.</p>
        <p>We'll get in touch with event news, instructions and updates about what we do, but any
        questions, just reply to this email.</p>
        <p>See you soon,<br>The Lift Flintshire CIC Team</p>
      </div>
      <p style="font-size:11px;color:#999;margin-top:12px">liftflintshire.co.uk</p>
    </div>`
}

/** The internal "new entry" email to hello@. */
export function organiserNotification(d: EntryEmailDetails & { email: string }): { subject: string; html: string } {
  const free = isFreeAmount(d.amount)
  const price = free ? 'free entry' : `£${escapeHtml(d.amount)}`
  return {
    subject: `New ${free ? 'free' : 'paid'} entry: ${subjectText(d.eventTitle, MAX_TITLE_IN_SUBJECT)} — ${subjectText(d.firstName, MAX_NAME_IN_SUBJECT)} (${d.ref})`,
    html: `<p>${escapeHtml(d.firstName)} (${escapeHtml(d.email)}) entered ${escapeHtml(d.eventTitle)} — ${escapeHtml(d.tierLabel)}, ${price}. Reference ${escapeHtml(d.ref)}.</p>`,
  }
}
