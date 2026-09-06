import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { findEntryByRef, markEntryPaid } from './_lib/entriesSheet.js'

// Stripe signature verification needs the raw body, not the parsed one.
export const config = { api: { bodyParser: false } }

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function confirmationHtml(firstName: string, eventTitle: string, tierLabel: string, ref: string, amount: string): string {
  const name = escapeHtml(firstName)
  const title = escapeHtml(eventTitle)
  const tier = escapeHtml(tierLabel)
  const reference = escapeHtml(ref)
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#376A6B;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">You're in — ${title}</h2>
        <p style="margin:4px 0 0;opacity:.85;font-size:14px">Entry reference: <strong>${reference}</strong></p>
      </div>
      <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
        <p>Hi ${name},</p>
        <p>Your entry is confirmed — <strong>${tier}</strong>, £${amount} paid.</p>
        <p>Keep your entry reference <strong>${reference}</strong> handy for event day. We'll email
        final instructions (start time, parking, what to bring) closer to the date.</p>
        <p>Any questions, just reply to this email.</p>
        <p>— Lift Flintshire CIC</p>
      </div>
      <p style="font-size:11px;color:#999;margin-top:12px">liftflintshire.co.uk</p>
    </div>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await rawBody(req),
      req.headers['stripe-signature'] as string,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const entryRef = session.metadata?.entryRef
  const eventTitle = (session.metadata?.eventTitle ?? '').trim()
  if (!entryRef) {
    console.error('checkout.session.completed with no entryRef metadata:', session.id)
    return res.status(200).json({ received: true })
  }

  // Any throw below returns 500 and Stripe retries for up to 3 days, so a confirmed
  // payment is never lost. The entrant's details are already in the sheet from create-entry.
  const entry = await findEntryByRef(entryRef)
  if (!entry) {
    console.error('No pending row found for entry ref', entryRef)
    return res.status(500).json({ error: 'Entry row missing' })
  }
  if (entry.status === 'paid') {
    return res.status(200).json({ received: true, alreadyProcessed: true })
  }

  const amount = ((session.amount_total ?? 0) / 100).toFixed(2)
  await markEntryPaid(entry.rowNumber, amount)

  const title = eventTitle || entry.eventId
  const resend = new Resend(process.env.RESEND_API_KEY!)
  try {
    await resend.emails.send({
      from: 'Lift Flintshire Events <events@liftflintshire.co.uk>',
      to: [entry.email],
      subject: `Entry confirmed: ${title} (${entry.entryRef})`,
      html: confirmationHtml(entry.firstName, title, entry.tierLabel, entry.entryRef, amount),
    })
    await resend.emails.send({
      from: 'Lift Flintshire Website <forms@liftflintshire.co.uk>',
      to: ['hello@liftflintshire.co.uk'],
      subject: `New paid entry: ${title} — ${entry.firstName} (${entry.entryRef})`,
      html: `<p>${escapeHtml(entry.firstName)} (${escapeHtml(entry.email)}) entered ${escapeHtml(title)} — ${escapeHtml(entry.tierLabel)}, £${amount}. Reference ${escapeHtml(entry.entryRef)}.</p>`,
    })
  } catch (emailErr) {
    // The entry is saved and paid; a failed email must not trigger a Stripe retry loop.
    console.error('Confirmation email failed (entry is saved):', emailErr)
  }

  return res.status(200).json({ received: true })
}
