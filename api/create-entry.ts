import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'node:crypto'
import Stripe from 'stripe'
import { parseTicketTypesSheet, pickAvailableTier } from './_lib/tickets.js'
import { countTaken, appendPendingEntry, HOLD_MS } from './_lib/entriesSheet.js'

const REQUIRED = [
  'eventId', 'eventTitle', 'tierId', 'first-name', 'last-name', 'email',
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

  const f = req.body as Record<string, string>
  for (const key of REQUIRED) {
    if (!f[key]) return res.status(400).json({ error: `Missing field: ${key}` })
  }
  if (f.tierId === TEAM_TIER_ID) {
    for (const key of TEAM_REQUIRED) {
      if (!f[key]) return res.status(400).json({ error: `Missing field: ${key}` })
    }
  }

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

    const entryRef = generateEntryRef()
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const site = process.env.SITE_URL ?? 'https://liftflintshire.co.uk'

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
          product_data: { name: `${f.eventTitle} — ${tier.label}` },
        },
      }],
      metadata: { entryRef, eventId: f.eventId, tierId: tier.tierId, eventTitle: f.eventTitle.slice(0, 480) },
      success_url: `${site}/events/entry-confirmed?ref=${entryRef}`,
      cancel_url: `${site}/events/${encodeURIComponent(f.eventId)}?cancelled=1`,
    })

    // Fails closed: if this throws, the user sees an error and never reaches payment.
    await appendPendingEntry({
      eventId: f.eventId,
      tierId: tier.tierId,
      tierLabel: tier.label,
      entryRef,
      sessionId: session.id,
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
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-entry error:', err)
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' })
  }
}
