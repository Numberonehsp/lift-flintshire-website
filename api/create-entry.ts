import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'node:crypto'
import Stripe from 'stripe'
import { parseTicketTypesSheet, pickAvailableTier } from './_lib/tickets.js'
import {
  countTaken, appendPendingEntry, appendFreeEntry, findPaidEntryForEmail, fetchPaidRank, markEntryOversold,
  HOLD_MS,
} from './_lib/entriesSheet.js'
import type { PendingEntry } from './_lib/entriesSheet.js'
import { finaliseEntry, describeError } from './_lib/finaliseEntry.js'
import { hasMarketingConsent } from './_lib/marketing.js'
import { fetchEvent } from './_lib/eventLookup.js'

// The client also sends `eventTitle`; it is ignored. The title used in emails and at Stripe
// comes from the Events sheet so a caller cannot put their own text into an email.
const REQUIRED = [
  'eventId', 'tierId', 'first-name', 'last-name', 'email',
  'date-of-birth', 'emergency-name', 'emergency-phone', 'waiver-agreed', 'gdpr-consent',
] as const

const TEAM_TIER_ID = 'team'

const TEAM_REQUIRED = [
  'team-name', 'captain-liability-agreed',
  'runner1-name', 'runner1-email', 'runner2-name', 'runner2-email',
  'runner3-name', 'runner3-email', 'runner4-name', 'runner4-email',
] as const

// Unambiguous alphabet: no I, O, 0, 1.
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateEntryRef(): string {
  const bytes = randomBytes(6)
  const suffix = Array.from(bytes, b => REF_ALPHABET[b % REF_ALPHABET.length]).join('')
  return `LF${String(new Date().getFullYear()).slice(2)}-${suffix}`
}

async function fetchTicketTypes(): Promise<string[][]> {
  const sheetId = process.env.GOOGLE_SHEET_ID_PUBLIC
  const apiKey = process.env.GOOGLE_API_KEY
  if (!sheetId || !apiKey) {
    throw new Error(
      `Ticket_Types config missing: GOOGLE_SHEET_ID_PUBLIC=${sheetId ? 'set' : 'MISSING'} GOOGLE_API_KEY=${apiKey ? 'set' : 'MISSING'}`,
    )
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Ticket_Types?key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Ticket_Types fetch failed: ${response.status} ${await response.text()}`)
  }
  const json = (await response.json()) as { values?: string[][] }
  return json.values ?? []
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const f = (req.body ?? {}) as Record<string, string>
  const site = process.env.SITE_URL ?? 'https://liftflintshire.co.uk'

  // Honeypot: a hidden field people never see. Filled means a bot, which gets a plausible
  // success (same shape EventEntry redirects on) and nothing is written or emailed.
  if (typeof f.website === 'string' && f.website.trim() !== '') {
    return res.status(200).json({ url: `${site}/events/entry-confirmed` })
  }

  for (const key of REQUIRED) {
    if (!f[key]) return res.status(400).json({ error: `Missing field: ${key}` })
  }
  if (f.tierId === TEAM_TIER_ID) {
    for (const key of TEAM_REQUIRED) {
      if (!f[key]) return res.status(400).json({ error: `Missing field: ${key}` })
    }
  }

  let isFree = false
  try {
    const tiers = parseTicketTypesSheet(await fetchTicketTypes(), f.eventId)
    if (tiers.length === 0) {
      throw new Error(`No Ticket_Types rows matched eventId "${f.eventId}"`)
    }
    const taken = await countTaken(f.eventId)
    const tier = pickAvailableTier(tiers, taken)

    if (!tier) {
      return res.status(409).json({ error: 'This event is now fully booked.' })
    }
    if (tier.tierId !== f.tierId) {
      return res.status(409).json({
        error: 'That ticket type is no longer available — please refresh for current prices.',
      })
    }

    isFree = tier.pricePence === 0

    // Title from the Events sheet, never the client. A free entry fails closed if the event
    // cannot be looked up (it would otherwise send an email with no trustworthy title); a paid
    // entry falls back to the event id so checkout still works.
    let eventTitle: string
    try {
      const details = await fetchEvent(f.eventId)
      if (!details) throw new Error(`Event "${f.eventId}" not found in the Events sheet`)
      eventTitle = details.title
    } catch (lookupErr) {
      if (isFree) throw lookupErr
      console.error('create-entry: event lookup failed; using the event id as the title:', describeError(lookupErr))
      eventTitle = f.eventId
    }

    const entryRef = generateEntryRef()
    // Strictly 'yes'. Stored on the row so the webhook can add the entrant to Brevo after payment.
    const marketingConsent = hasMarketingConsent(f)

    const entry: PendingEntry = {
      eventId: f.eventId,
      tierId: tier.tierId,
      tierLabel: tier.label,
      entryRef,
      sessionId: '',
      firstName: f['first-name'],
      lastName: f['last-name'],
      email: f.email,
      phone: f.phone ?? '',
      dob: f['date-of-birth'],
      gender: f.gender ?? '',
      emergencyName: f['emergency-name'],
      emergencyPhone: f['emergency-phone'],
      medical: f['medical-details'] ?? '',
      waiverAgreed: f['waiver-agreed'],
      photoConsent: f['photo-consent'] ?? '',
      gdprConsent: f['gdpr-consent'],
      teamName: f['team-name'] ?? '',
      clubOrGym: f['club-or-gym'] ?? '',
      captainLiabilityAgreed: f['captain-liability-agreed'] ?? '',
      runners: [1, 2, 3, 4].map(n => ({
        name: f[`runner${n}-name`] ?? '',
        email: f[`runner${n}-email`] ?? '',
      })),
      marketingConsent: marketingConsent ? 'yes' : '',
    }

    // Free tier: no Stripe. The availability check above has already run, and the row is
    // written as `paid` (£0.00) so it counts against capacity like any confirmed entry.
    if (isFree) {
      // Already entered (same event, same email, case-insensitive): send them to their
      // existing confirmation instead of writing a second row or sending another email.
      const existingRef = await findPaidEntryForEmail(f.eventId, f.email)
      if (existingRef) {
        return res.status(200).json({ url: `${site}/events/entry-confirmed?ref=${encodeURIComponent(existingRef)}` })
      }

      // Fails closed: if the row can't be saved, the user sees an error and is not confirmed.
      await appendFreeEntry({ ...entry, sessionId: 'free' })

      // Two free entries at once can both pass the availability check above. Re-read A:E and,
      // if this row is beyond the tier's capacity among paid rows (sheet order), withdraw it.
      // If the re-read or the status update fails the entry stands (confirmed, possibly one
      // over capacity) so the sheet and what the entrant is told always agree.
      try {
        const placed = await fetchPaidRank(f.eventId, tier.tierId, entryRef)
        if (placed && placed.rank > tier.capacity) {
          await markEntryOversold(placed.rowNumber)
          return res.status(409).json({ error: 'This event is now fully booked.' })
        }
      } catch (rankErr) {
        console.error(`create-entry: capacity re-check failed for ${entryRef}; entry stands:`, describeError(rankErr))
      }
      try {
        await finaliseEntry({
          entryRef, eventId: f.eventId, eventTitle, tierLabel: tier.label,
          firstName: f['first-name'], lastName: f['last-name'], email: f.email, amount: '0.00',
          marketingConsent,
        })
      } catch (finaliseErr) {
        // finaliseEntry catches its own errors; this is a backstop so a saved entry is never reported as failed.
        console.error(`finaliseEntry failed for ${entryRef} (entry is saved):`, describeError(finaliseErr))
      }
      return res.status(200).json({ url: `${site}/events/entry-confirmed?ref=${entryRef}` })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Stripe receives no personal data beyond the email it needs for the receipt —
    // health and contact details stay in the private sheet.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: f.email,
      expires_at: Math.floor((Date.now() + HOLD_MS) / 1000),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: tier.pricePence,
          product_data: { name: `${eventTitle} — ${tier.label}` },
        },
      }],
      metadata: { entryRef, eventId: f.eventId, tierId: tier.tierId, eventTitle: eventTitle.slice(0, 480) },
      success_url: `${site}/events/entry-confirmed?ref=${entryRef}`,
      cancel_url: `${site}/events/${encodeURIComponent(f.eventId)}?cancelled=1`,
    })

    // Fails closed: if this throws, the user sees an error and never reaches payment.
    await appendPendingEntry({ ...entry, sessionId: session.id })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    // Not the raw error: a Sheets API error carries the request body, which holds the entrant's details.
    console.error('create-entry error:', describeError(err))
    return res.status(500).json({
      error: isFree ? 'Could not save your entry. Please try again.' : 'Could not start checkout. Please try again.',
    })
  }
}
