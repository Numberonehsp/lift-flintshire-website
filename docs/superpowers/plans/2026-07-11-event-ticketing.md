# Event Ticketing (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Self-hosted event ticketing on liftflintshire.co.uk — tiered ticket types with early-bird rollover, Stripe Checkout payment, entries written to a private Google Sheet, confirmation emails via Resend.

**Architecture:** Static Vite/React SPA on Vercel + three new Vercel serverless functions (`api/`). Public Google Sheet gains a `Ticket_Types` tab (prices/capacities, safe to be public). Entrant personal data goes to a **separate private spreadsheet** (`TICKETING_SHEET_ID`, service-account access only); the browser learns sold counts via `api/event-availability`. No entry row exists until Stripe confirms payment via webhook.

**Tech Stack:** React 19 + react-router v7, Tailwind v3, TypeScript strict (`verbatimModuleSyntax` — use `import type`), `stripe`, `googleapis`, `resend`, `vitest` (new).

**Spec:** `docs/2026-07-11-event-ticketing-plan.md`

**Conventions that bite:** type-only imports MUST use `import type`. Money is handled in **pence** everywhere server-side. Event dates constructed as `new Date(date + 'T00:00:00')`.

---

## File map

| File | Responsibility |
|---|---|
| `lib/tickets.ts` (create) | Pure logic: ticket-type parsing, tier rollover, booking fee. Shared by client + API. |
| `lib/tickets.test.ts` (create) | Vitest tests for the above. |
| `lib/ticketingSheet.ts` (create) | Server-only Google Sheets client for the private ticketing spreadsheet. |
| `api/event-availability.ts` (create) | GET sold-counts per tier for an event. |
| `api/create-entry.ts` (create) | POST entry form → validate tier → Stripe Checkout session. |
| `api/stripe-webhook.ts` (create) | Payment confirmed → append entry row + send emails. |
| `src/hooks/useTicketAvailability.ts` (create) | Client fetch of Ticket_Types tab + availability endpoint. |
| `src/pages/Events.tsx`, `EventDetail.tsx`, `EventEntry.tsx`, `EntryConfirmed.tsx` (create) | The four new pages. |
| `src/App.tsx` (modify) | Routes. |
| `src/components/layout/Header.tsx` (modify) | Nav link to /events. |
| `package.json` (modify) | Add `stripe`, `vitest`; `test` script. |

## Google Sheet setup (manual, do first)

1. **Public content sheet** (existing `VITE_GOOGLE_SHEET_ID`): add tab `Ticket_Types` with header row:
   `event_id | tier_id | label | price_gbp | capacity | sort_order`
2. **New private spreadsheet** "LF Ticketing — Entries" shared ONLY with the service account email (editor). Tab `Event_Entries`, header row written automatically by the webhook. Note its ID → env var `TICKETING_SHEET_ID`.
3. Vercel env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TICKETING_SHEET_ID`, `SITE_URL=https://liftflintshire.co.uk` (existing: `RESEND_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_KEY`).
4. ⚠️ Verify the existing `GOOGLE_SHEET_ID` (server) used by `api/submit-form.ts` is NOT the same as the public `VITE_GOOGLE_SHEET_ID` — the Registrations tab holds personal data. If they are the same sheet, raise with Ed before continuing.

---

### Task 1: Test infrastructure (vitest)

**Files:** Modify: `package.json`

- [ ] **Step 1:** `npm install -D vitest`
- [ ] **Step 2:** Add script to `package.json` `"scripts"`: `"test": "vitest run"`
- [ ] **Step 3:** Verify: `npm run test` → "No test files found" (exit code 1 is fine at this point; vitest prints the message)
- [ ] **Step 4:** Commit: `git add package.json package-lock.json && git commit -m "chore: add vitest"`

### Task 2: Ticket domain logic — types + sheet parsing

**Files:** Create: `lib/tickets.ts`, `lib/tickets.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/tickets.test.ts
import { describe, it, expect } from 'vitest'
import { parseTicketTypesSheet, pickAvailableTier, tierStatuses, bookingFeePence } from './tickets'

const HEADER = ['event_id', 'tier_id', 'label', 'price_gbp', 'capacity', 'sort_order']
const ROWS = [
  HEADER,
  ['run-2026', 'early-bird', 'Early Bird Entry', '80', '10', '1'],
  ['run-2026', 'standard', 'Standard Entry', '100', '999', '2'],
  ['other-event', 'single', 'Entry', '15', '50', '1'],
]

describe('parseTicketTypesSheet', () => {
  it('parses rows for the given event, sorted by sort_order, prices in pence', () => {
    const tiers = parseTicketTypesSheet(ROWS, 'run-2026')
    expect(tiers).toEqual([
      { eventId: 'run-2026', tierId: 'early-bird', label: 'Early Bird Entry', pricePence: 8000, capacity: 10, sortOrder: 1 },
      { eventId: 'run-2026', tierId: 'standard', label: 'Standard Entry', pricePence: 10000, capacity: 999, sortOrder: 2 },
    ])
  })
  it('returns [] for unknown event or empty sheet', () => {
    expect(parseTicketTypesSheet(ROWS, 'nope')).toEqual([])
    expect(parseTicketTypesSheet([], 'run-2026')).toEqual([])
  })
  it('skips malformed rows (missing price or capacity)', () => {
    const bad = [HEADER, ['run-2026', 'x', 'X', '', '10', '1']]
    expect(parseTicketTypesSheet(bad, 'run-2026')).toEqual([])
  })
})
```

- [ ] **Step 2:** Run `npx vitest run lib/tickets.test.ts` → FAIL (module not found)
- [ ] **Step 3: Implement parsing (and type stubs so the file compiles)**

```ts
// lib/tickets.ts
export interface TicketTier {
  eventId: string
  tierId: string
  label: string
  pricePence: number
  capacity: number
  sortOrder: number
}

export type SoldCounts = Record<string, number> // tierId -> confirmed entries

export function parseTicketTypesSheet(values: string[][], eventId: string): TicketTier[] {
  if (!values || values.length < 2) return []
  const [, ...rows] = values
  return rows
    .filter(r => r[0] === eventId && r[1] && r[3] && r[4])
    .map(r => ({
      eventId: r[0],
      tierId: r[1],
      label: r[2] || r[1],
      pricePence: Math.round(parseFloat(r[3]) * 100),
      capacity: parseInt(r[4], 10),
      sortOrder: parseInt(r[5], 10) || 0,
    }))
    .filter(t => Number.isFinite(t.pricePence) && Number.isFinite(t.capacity))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// Implemented in Task 3:
export function pickAvailableTier(_tiers: TicketTier[], _sold: SoldCounts): TicketTier | null { return null }
export function tierStatuses(_tiers: TicketTier[], _sold: SoldCounts): { tier: TicketTier; status: 'available' | 'sold_out' | 'not_yet' }[] { return [] }
export function bookingFeePence(_pricePence: number): number { return 0 }
```

- [ ] **Step 4:** Run `npx vitest run lib/tickets.test.ts` → parse tests PASS
- [ ] **Step 5:** Commit: `git add lib/ && git commit -m "feat: ticket tier parsing"`

### Task 3: Tier rollover + booking fee logic

**Files:** Modify: `lib/tickets.ts`, `lib/tickets.test.ts`

- [ ] **Step 1: Add failing tests**

```ts
// append to lib/tickets.test.ts
const tiers = parseTicketTypesSheet(ROWS, 'run-2026')

describe('pickAvailableTier (early-bird rollover)', () => {
  it('offers early bird while under capacity', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 9 })?.tierId).toBe('early-bird')
  })
  it('rolls to standard when early bird sells out', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 10 })?.tierId).toBe('standard')
  })
  it('returns null when everything is sold out', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 10, standard: 999 })).toBeNull()
  })
})

describe('tierStatuses', () => {
  it('marks only the current tier available; later tiers not_yet; sold tiers sold_out', () => {
    expect(tierStatuses(tiers, { 'early-bird': 3 }).map(s => s.status)).toEqual(['available', 'not_yet'])
    expect(tierStatuses(tiers, { 'early-bird': 10 }).map(s => s.status)).toEqual(['sold_out', 'available'])
  })
})

describe('bookingFeePence', () => {
  it('is ceil(1.5%) + 20p', () => {
    expect(bookingFeePence(8000)).toBe(140)   // 120 + 20
    expect(bookingFeePence(10000)).toBe(170)  // 150 + 20
    expect(bookingFeePence(999)).toBe(35)     // ceil(14.985)=15 + 20
  })
})
```

- [ ] **Step 2:** Run `npx vitest run` → new tests FAIL
- [ ] **Step 3: Implement (replace the Task 2 stubs)**

```ts
export function pickAvailableTier(tiers: TicketTier[], sold: SoldCounts): TicketTier | null {
  for (const tier of tiers) {
    if ((sold[tier.tierId] ?? 0) < tier.capacity) return tier
  }
  return null
}

export function tierStatuses(tiers: TicketTier[], sold: SoldCounts) {
  const current = pickAvailableTier(tiers, sold)
  return tiers.map(tier => ({
    tier,
    status: tier === current ? ('available' as const)
      : (sold[tier.tierId] ?? 0) >= tier.capacity ? ('sold_out' as const)
      : ('not_yet' as const),
  }))
}

export function bookingFeePence(pricePence: number): number {
  return Math.ceil(pricePence * 0.015) + 20
}
```

- [ ] **Step 4:** `npx vitest run` → ALL PASS
- [ ] **Step 5:** Commit: `git commit -am "feat: tier rollover and booking fee logic"`

### Task 4: Private-sheet server helper

**Files:** Create: `lib/ticketingSheet.ts` (server-only — never import from `src/`)

No unit tests (thin I/O wrapper, same pattern as `api/submit-form.ts`); exercised in Tasks 5–7.

- [ ] **Step 1: Implement**

```ts
// lib/ticketingSheet.ts — server-only (uses GOOGLE_SERVICE_ACCOUNT_KEY)
import { google } from 'googleapis'
import type { SoldCounts } from './tickets'

export const ENTRIES_TAB = 'Event_Entries'
export const ENTRY_COLUMNS = [
  'Timestamp', 'Event ID', 'Entry Ref', 'Tier', 'First Name', 'Last Name', 'Email',
  'Phone', 'Date of Birth', 'Gender', 'Emergency Contact', 'Emergency Phone',
  'Medical Details', 'Waiver Agreed', 'Photo Consent', 'GDPR Consent',
  'Amount Paid (£)', 'Stripe Session ID', 'Checked In',
]

function sheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export async function readEntryRows(): Promise<string[][]> {
  const sheets = sheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.TICKETING_SHEET_ID!,
    range: `${ENTRIES_TAB}!A:S`,
  })
  return (res.data.values as string[][] | undefined) ?? []
}

/** Sold counts per tier for one event (row[1]=event_id, row[3]=tier). */
export function countByTier(rows: string[][], eventId: string): SoldCounts {
  const counts: SoldCounts = {}
  for (const row of rows.slice(1)) {
    if (row[1] === eventId && row[3]) counts[row[3]] = (counts[row[3]] ?? 0) + 1
  }
  return counts
}

export async function appendEntryRow(row: string[]): Promise<void> {
  const sheets = sheetsClient()
  const spreadsheetId = process.env.TICKETING_SHEET_ID!
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId, range: `${ENTRIES_TAB}!A1:A1`,
  })
  if (!existing.data.values?.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: `${ENTRIES_TAB}!A1`,
      valueInputOption: 'RAW', requestBody: { values: [ENTRY_COLUMNS] },
    })
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId, range: `${ENTRIES_TAB}!A1`,
    valueInputOption: 'RAW', requestBody: { values: [row] },
  })
}
```

- [ ] **Step 2:** `npx tsc -b` → no errors
- [ ] **Step 3:** Commit: `git add lib/ticketingSheet.ts && git commit -m "feat: private ticketing sheet helper"`

### Task 5: `api/event-availability.ts`

**Files:** Create: `api/event-availability.ts`

- [ ] **Step 1: Implement**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readEntryRows, countByTier } from '../lib/ticketingSheet'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const eventId = String(req.query.eventId ?? '')
  if (!eventId) return res.status(400).json({ error: 'eventId required' })
  try {
    const sold = countByTier(await readEntryRows(), eventId)
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ sold })
  } catch (err) {
    console.error('availability error:', err)
    return res.status(500).json({ error: 'Unavailable' })
  }
}
```

- [ ] **Step 2:** `npx tsc -b` → no errors
- [ ] **Step 3:** Manual check with `vercel dev` (or after deploy): `curl "http://localhost:3000/api/event-availability?eventId=run-2026"` → `{"sold":{}}` (empty sheet)
- [ ] **Step 4:** Commit: `git add api/event-availability.ts && git commit -m "feat: event availability endpoint"`

### Task 6: `api/create-entry.ts` (Stripe Checkout)

**Files:** Create: `api/create-entry.ts` · Modify: `package.json` (`npm install stripe`)

- [ ] **Step 1:** `npm install stripe`
- [ ] **Step 2: Implement**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { parseTicketTypesSheet, pickAvailableTier, bookingFeePence } from '../lib/tickets'
import { readEntryRows, countByTier } from '../lib/ticketingSheet'

const REQUIRED = ['eventId', 'eventTitle', 'tierId', 'first-name', 'last-name', 'email',
  'emergency-name', 'emergency-phone', 'waiver-agreed', 'gdpr-consent'] as const

async function fetchTicketTypes(): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.VITE_GOOGLE_SHEET_ID}/values/Ticket_Types?key=${process.env.VITE_GOOGLE_API_KEY}`
  const json = await (await fetch(url)).json() as { values?: string[][] }
  return json.values ?? []
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const f = req.body as Record<string, string>
  for (const key of REQUIRED) {
    if (!f[key]) return res.status(400).json({ error: `Missing field: ${key}` })
  }
  try {
    const tiers = parseTicketTypesSheet(await fetchTicketTypes(), f.eventId)
    const sold = countByTier(await readEntryRows(), f.eventId)
    const tier = pickAvailableTier(tiers, sold)
    if (!tier || tier.tierId !== f.tierId) {
      return res.status(409).json({ error: 'That ticket is no longer available. Please refresh.' })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const site = process.env.SITE_URL ?? 'https://liftflintshire.co.uk'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: f.email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: tier.pricePence,
            product_data: { name: `${f.eventTitle} — ${tier.label}` },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'gbp',
            unit_amount: bookingFeePence(tier.pricePence),
            product_data: { name: 'Booking fee' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: f.eventId, eventTitle: f.eventTitle, tierId: tier.tierId, tierLabel: tier.label,
        firstName: f['first-name'], lastName: f['last-name'], phone: f.phone ?? '',
        dob: f['date-of-birth'] ?? '', gender: f.gender ?? '',
        emergencyName: f['emergency-name'], emergencyPhone: f['emergency-phone'],
        medical: (f['medical-details'] ?? '').slice(0, 480),
        waiverAgreed: f['waiver-agreed'], photoConsent: f['photo-consent'] ?? '',
        gdprConsent: f['gdpr-consent'],
      },
      success_url: `${site}/events/entry-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/events/${encodeURIComponent(f.eventId)}?cancelled=1`,
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-entry error:', err)
    return res.status(500).json({ error: 'Could not start checkout' })
  }
}
```

Note: `VITE_GOOGLE_SHEET_ID` / `VITE_GOOGLE_API_KEY` must also be set as plain Vercel env vars (VITE_ prefix exposes them to the client build; the function reads the same values server-side).

- [ ] **Step 3:** `npx tsc -b` → no errors
- [ ] **Step 4:** Commit: `git add api/create-entry.ts package.json package-lock.json && git commit -m "feat: create-entry checkout endpoint"`

### Task 7: `api/stripe-webhook.ts` (write entry + emails)

**Files:** Create: `api/stripe-webhook.ts`

- [ ] **Step 1: Implement**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { appendEntryRow, readEntryRows } from '../lib/ticketingSheet'

export const config = { api: { bodyParser: false } }

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

function entryRef(existingRows: number): string {
  const yy = String(new Date().getFullYear()).slice(2)
  return `LF${yy}-${String(existingRows).padStart(4, '0')}` // header row makes this start at 0001
}

function confirmationHtml(m: Record<string, string>, ref: string, amount: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#376A6B;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">You're in! ${m.eventTitle}</h2>
        <p style="margin:4px 0 0;opacity:.85;font-size:14px">Entry reference: <strong>${ref}</strong></p>
      </div>
      <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
        <p>Hi ${m.firstName},</p>
        <p>Your entry is confirmed — <strong>${m.tierLabel}</strong>, £${amount} paid.</p>
        <p>Keep your entry reference <strong>${ref}</strong> handy for event day. We'll email
        final instructions (start time, parking, what to bring) closer to the event.</p>
        <p>Questions? Just reply to this email.</p>
        <p>— Lift Flintshire CIC</p>
      </div>
    </div>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await rawBody(req), req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type !== 'checkout.session.completed') return res.status(200).json({ received: true })

  const session = event.data.object as Stripe.Checkout.Session
  const m = (session.metadata ?? {}) as Record<string, string>
  const amount = ((session.amount_total ?? 0) / 100).toFixed(2)

  const rows = await readEntryRows()
  // Idempotency: Stripe retries webhooks — skip if this session is already recorded (col R = index 17)
  if (rows.some(r => r[17] === session.id)) return res.status(200).json({ received: true })
  const ref = entryRef(rows.length)

  await appendEntryRow([
    new Date().toISOString(), m.eventId, ref, m.tierLabel, m.firstName, m.lastName,
    session.customer_email ?? '', m.phone, m.dob, m.gender, m.emergencyName, m.emergencyPhone,
    m.medical, m.waiverAgreed, m.photoConsent, m.gdprConsent, amount, session.id, '',
  ])

  const resend = new Resend(process.env.RESEND_API_KEY!)
  try {
    await resend.emails.send({
      from: 'Lift Flintshire Events <events@liftflintshire.co.uk>',
      to: [session.customer_email!],
      subject: `Entry confirmed: ${m.eventTitle} (${ref})`,
      html: confirmationHtml(m, ref, amount),
    })
    await resend.emails.send({
      from: 'Lift Flintshire Website <forms@liftflintshire.co.uk>',
      to: ['hello@liftflintshire.co.uk'],
      subject: `New paid entry: ${m.eventTitle} — ${m.firstName} ${m.lastName} (${ref})`,
      html: `<p>${m.firstName} ${m.lastName} (${session.customer_email}) entered ${m.eventTitle} — ${m.tierLabel}, £${amount}. Ref ${ref}.</p>`,
    })
  } catch (emailErr) {
    console.error('Confirmation email failed (entry saved):', emailErr)
  }
  return res.status(200).json({ received: true })
}
```

Sheet failures throw → 500 → Stripe retries the webhook automatically, so no entry is lost.

- [ ] **Step 2:** `npx tsc -b` → no errors
- [ ] **Step 3:** Local test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe-webhook` + `stripe trigger checkout.session.completed` → 200, row appended, emails logged
- [ ] **Step 4:** Commit: `git add api/stripe-webhook.ts && git commit -m "feat: stripe webhook writes entry and sends confirmations"`

### Task 8: Availability hook

**Files:** Create: `src/hooks/useTicketAvailability.ts`

- [ ] **Step 1: Implement**

```ts
import { useState, useEffect } from 'react'
import { parseTicketTypesSheet, tierStatuses } from '../../lib/tickets'
import type { TicketTier, SoldCounts } from '../../lib/tickets'

export interface TierStatus {
  tier: TicketTier
  status: 'available' | 'sold_out' | 'not_yet'
}

export function useTicketAvailability(eventId: string | undefined) {
  const [statuses, setStatuses] = useState<TierStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Ticket_Types?key=${apiKey}`)
        .then(r => r.json()).catch(() => ({ values: [] })),
      fetch(`/api/event-availability?eventId=${encodeURIComponent(eventId)}`)
        .then(r => r.json()).catch(() => ({ sold: {} })),
    ])
      .then(([typesJson, availJson]) => {
        const tiers = parseTicketTypesSheet(typesJson.values ?? [], eventId)
        setStatuses(tierStatuses(tiers, (availJson.sold ?? {}) as SoldCounts))
      })
      .finally(() => setLoading(false))
  }, [eventId])

  return { statuses, loading }
}
```

- [ ] **Step 2:** `npx tsc -b` → no errors (confirms Vite/TS accepts the `../../lib` import; `lib/` is inside the project root)
- [ ] **Step 3:** Commit: `git add src/hooks/useTicketAvailability.ts && git commit -m "feat: ticket availability hook"`

### Task 9: Events listing + detail pages, routes, nav

**Files:** Create: `src/pages/Events.tsx`, `src/pages/EventDetail.tsx` · Modify: `src/App.tsx`, `src/components/layout/Header.tsx`

Follow the visual conventions of `src/pages/ProgrammesEvents.tsx` (read it first): `SectionWrapper`, `Card`, `Badge`, `Button`, `Seo` components; `font-display` headings, `text-teal`. Events come from `useContentSheets().events`.

- [ ] **Step 1: `Events.tsx`** — list upcoming events (`new Date(e.date + 'T00:00:00') >= today`), card per event with title, formatted date, location, price ("From £80"), linking to `/events/${e.id}`. Include `<Seo title="Events" description="Upcoming Lift Flintshire events" path="/events" />` (match Seo props used in existing pages). Show past events in a dimmed "Previous events" section.
- [ ] **Step 2: `EventDetail.tsx`** — `useParams()` for id, find event in `useContentSheets().events` (handle loading + not-found with a friendly message and link back). Render hero block (title, date, time, location, description), then the ticket box driven by `useTicketAvailability(id)`:
  - each tier row: label + £price; the `available` tier gets a highlighted card + "Enter now" button → `/events/${id}/enter`; `sold_out` tiers show a strikethrough "Sold out" badge; `not_yet` tiers show "Available after earlier tickets sell out".
  - all sold out → "This event is fully booked" notice.
  - `?cancelled=1` in query string → amber notice "Checkout cancelled — your place was not reserved."
- [ ] **Step 3:** Add routes in `App.tsx` (after the `/programmes-events` route):

```tsx
<Route path="/events" element={<Events />} />
<Route path="/events/:id" element={<EventDetail />} />
<Route path="/events/:id/enter" element={<EventEntry />} />
<Route path="/events/entry-confirmed" element={<EntryConfirmed />} />
```

(with matching imports; `EventEntry`/`EntryConfirmed` are created in Task 10 — add their routes there if doing tasks strictly independently). Add "Events" link to `Header.tsx` nav following its existing link pattern.
- [ ] **Step 4:** Verify: `npm run dev`, visit `/events` and `/events/<id>` with a test row in the Events + Ticket_Types tabs → listing and tier box render; `npx tsc -b` clean.
- [ ] **Step 5:** Commit: `git add src/ && git commit -m "feat: events listing and detail pages"`

### Task 10: Entry form + confirmation pages

**Files:** Create: `src/pages/EventEntry.tsx`, `src/pages/EntryConfirmed.tsx` · Modify: `src/App.tsx` (routes if not added in Task 9)

- [ ] **Step 1: `EventEntry.tsx`** — read event via `useContentSheets`, current tier via `useTicketAvailability`; if no available tier, redirect back to detail page. Form fields (reuse the `inputClass`/`labelClass` styling pattern from `src/pages/Contact.tsx` and the waiver copy/structure from `src/components/forms/RegistrationForm.tsx` — replicate the waiver section inline rather than bending the 531-line shared component to a new shape):
  - first-name*, last-name*, email*, phone, date-of-birth*, gender (select), emergency-name*, emergency-phone*, medical-details (textarea, "leave blank if none"), waiver-agreed* (checkbox + full waiver text), photo-consent (checkbox), gdpr-consent* (checkbox linking to /privacy).
  - Price summary box: tier label, £price, booking fee (from `bookingFeePence`), total.
  - Submit: POST JSON to `/api/create-entry` with all fields + `eventId`, `eventTitle`, `tierId`; on `{url}` → `window.location.href = url`; on 409 show the "no longer available" error with a refresh link; on other errors show a generic retry message. Disable button while submitting ("Redirecting to secure payment…").
- [ ] **Step 2: `EntryConfirmed.tsx`** — static success page: teal check headline "Entry confirmed!", copy: confirmation email with entry reference is on its way (check spam), link back to `/events`. No Stripe session lookup needed in Phase 1 — the email is the source of truth.
- [ ] **Step 3:** Verify full flow locally with Stripe **test mode** keys and `vercel dev`: submit form → Stripe Checkout (card `4242 4242 4242 4242`) → redirected to confirmation → webhook (via `stripe listen`) appends the row → both emails sent. Then check the sold count: early-bird capacity reached → detail page rolls to standard.
- [ ] **Step 4:** `npm run lint && npx tsc -b && npm run test` → all clean/pass
- [ ] **Step 5:** Commit: `git add src/ && git commit -m "feat: event entry form and confirmation page"`

### Task 11: Docs + go-live checklist

**Files:** Modify: `HANDOFF.md`

- [ ] **Step 1:** Add a "Event Ticketing" section to `HANDOFF.md`: the two-spreadsheet split (public Ticket_Types vs private Event_Entries), env var list, how tiers/rollover work, how to export the participant report (private sheet → File → Download CSV), how to refund (Stripe dashboard; delete/annotate the sheet row manually).
- [ ] **Step 2:** Go-live checklist (manual, with Ed): Stripe account verified → live keys in Vercel → webhook endpoint added in Stripe dashboard (live mode) → `stripe trigger` smoke test in test mode first → real £1 test event purchase in live mode, then refund it.
- [ ] **Step 3:** Commit: `git add HANDOFF.md && git commit -m "docs: event ticketing handoff notes"`

---

## Out of scope (Phase 2 — separate plan once Phase 1 is live)

QR code in confirmation email + marshal check-in page; "email all entrants" broadcast function; scheduled reminder emails; promo codes; waitlist.

## Self-review notes

- Spec coverage: sheet tabs (Task 4/manual setup), tier rollover (T3), fee-on-top (T3/T6), checkout (T6), webhook + entry ref + emails (T7), pages (T9/T10), reports (T11 docs), capacity soft-check both client (T8) and server (T6) with webhook idempotency (T7). Phase 2 items explicitly deferred.
- Types consistent: `TicketTier`/`SoldCounts` defined once in `lib/tickets.ts`; column order fixed in `ENTRY_COLUMNS` and matched by webhook row + `countByTier` indices (col 1 event, col 3 tier, col 17 session id).
- Payment-before-write invariant: no sheet row until `checkout.session.completed`, so abandoned checkouts create nothing.
