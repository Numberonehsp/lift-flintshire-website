import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { findEntryByRef, markEntryPaid } from './_lib/entriesSheet.js'
import { finaliseEntry, describeError } from './_lib/finaliseEntry.js'
import { hasMarketingConsent } from './_lib/marketing.js'

// Stripe signature verification needs the raw body, not the parsed one.
export const config = { api: { bodyParser: false } }

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
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
    console.error('Webhook signature verification failed:', describeError(err))
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // Any throw after verification is logged without the raw error (a Sheets error can carry the
  // entrant's row) and answered with 500, so Stripe retries for up to 3 days.
  try {
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

    // The entry is saved and paid. Emails and the Brevo opt-in are best-effort:
    // finaliseEntry never throws, so a failure here cannot trigger a Stripe retry loop.
    try {
      await finaliseEntry({
        entryRef: entry.entryRef,
        eventId: entry.eventId,
        eventTitle: eventTitle || entry.eventId,
        tierLabel: entry.tierLabel,
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        amount,
        // Only the entrant who ticked the box; teammates' emails on a team row are never sent.
        marketingConsent: hasMarketingConsent({ 'marketing-consent': entry.marketingConsent }),
      })
    } catch (finaliseErr) {
      console.error(`finaliseEntry failed for ${entry.entryRef} (entry is saved):`, describeError(finaliseErr))
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('stripe-webhook error:', describeError(err))
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
