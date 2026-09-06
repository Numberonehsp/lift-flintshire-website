# Event Ticketing (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Self-hosted event ticketing on liftflintshire.co.uk — tiered ticket types with early-bird rollover, Stripe Checkout payment, entrant details in a private Google Sheet, confirmation emails via Resend.

**Architecture:** Static Vite/React SPA on Vercel plus three serverless functions in `api/`. The public content sheet gains a `Ticket_Types` tab (prices and capacities only — safe to be world-readable). Entrant personal and health data goes to a **separate private spreadsheet** (`PRIVATE_SHEET_ID`), reachable only by the service account. `create-entry` writes a `pending` row and starts Stripe Checkout; the webhook flips it to `paid`. Stripe never receives personal data — only an entry reference.

**Tech Stack:** React 19 + react-router v7, Tailwind v3, TypeScript strict (`verbatimModuleSyntax` — type-only imports MUST use `import type`), `stripe`, `googleapis`, `resend`, `vitest` (new).

**Spec:** `docs/2026-07-11-event-ticketing-plan.md` (revised 2026-09-05)

---

## Two rules that override convenience

1. **Nothing under `api/` may import from `src/`, ever.** On 26 Aug 2026 that pattern
   crashed the serverless function with `FUNCTION_INVOCATION_FAILED` and broke every form
   on the site (commit `e8572dc`). Server-side shared code lives in `api/_lib/`. The tier
   logic is therefore deliberately duplicated between `api/_lib/tickets.ts` and
   `src/lib/tickets.ts`; Task 3 adds a test that fails if the two drift apart. Do not
   "DRY this up" by reaching across the boundary.
2. **Money is in pence server-side. `price_gbp` in the sheet is the final price the buyer
   pays**, inclusive of Stripe's fee. There is no separate booking fee — adding one when
   card is the only payment method is a prohibited surcharge under UK law.

## File map

| File | Responsibility |
|---|---|
| `api/_lib/tickets.ts` (create) | Pure tier logic for the server. Mirror of `src/lib/tickets.ts`. |
| `api/_lib/entriesSheet.ts` (create) | Private-sheet I/O: column order, counting, append, mark paid. |
| `api/event-availability.ts` (create) | Public GET: taken-count per tier. Reads `A:D` only. |
| `api/create-entry.ts` (create) | POST entry form → validate tier → Stripe session → pending row. |
| `api/stripe-webhook.ts` (create) | Payment confirmed → mark paid → send emails. |
| `src/lib/tickets.ts` (create) | Client copy of the tier logic. Mirror of `api/_lib/tickets.ts`. |
| `src/lib/tickets.test.ts` (create) | Vitest tests, including the mirror-drift guard. |
| `src/hooks/useTicketAvailability.ts` (create) | Client: Ticket_Types + availability → tier statuses. |
| `src/pages/Events.tsx`, `EventDetail.tsx`, `EventEntry.tsx`, `EntryConfirmed.tsx` (create) | The four pages. |
| `src/App.tsx` (modify) | Routes. |
| `src/components/layout/Header.tsx` (modify) | Nav link. |
| `package.json` (modify) | Add `stripe`, `vitest`; `test` script. |

## Manual setup (do before Task 4)

1. **Public content sheet** (`VITE_GOOGLE_SHEET_ID` = `1y9dde38zP9rinh1pBU7ki3sHVZXf7eOrJ-oEidp67i0`) — `Ticket_Types` tab, header row: `event_id | tier_id | label | price_gbp | capacity | sort_order`. Already created by Ed.
2. **Private spreadsheet** "LF Ticketing — Entries" — already created and shared as Editor
   with the service account's `client_email`. **Consolidated 2026-09-06:** this is now the
   *one* private spreadsheet for all personal data, not ticketing-only — `PRIVATE_SHEET_ID`
   also holds the `Registrations` and `Feedback` tabs moved there when the public-sheet
   exposure was fixed (see `HANDOFF.md`). Add an `Event_Entries` tab; its header row is
   written automatically on first use.
3. **Vercel env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PRIVATE_SHEET_ID`
   (already set), `SITE_URL=https://liftflintshire.co.uk`, plus non-prefixed
   `GOOGLE_SHEET_ID_PUBLIC` and `GOOGLE_API_KEY` mirroring the two `VITE_` values (server
   code cannot rely on `VITE_`-prefixed vars being present at runtime).
4. Register the webhook in the Stripe dashboard → `https://liftflintshire.co.uk/api/stripe-webhook`.

## Column order for `Event_Entries` (A–V)

Counting columns come first so the public availability endpoint reads `A:D` and never
loads personal data.

`A timestamp | B event_id | C tier_id | D status | E entry_ref | F tier_label | G amount_paid | H stripe_session_id | I paid_at | J checked_in | K first_name | L last_name | M email | N phone | O dob | P gender | Q emergency_name | R emergency_phone | S medical | T waiver_agreed | U photo_consent | V gdpr_consent`

---

### Task 0: Prove `api/_lib/` bundles on Vercel (de-risking spike)

Everything else depends on a server function being able to import from `api/_lib/`. Verify
it on a real preview deployment **before** building on it. Vercel does not route files
whose path contains an underscore-prefixed segment, but this repo has been burned by
bundling assumptions before.

**Files:** Create: `api/_lib/ping.ts`, `api/spike-ping.ts` (both deleted at the end)

- [ ] **Step 1: Create the helper**

```ts
// api/_lib/ping.ts
export function pong(): string {
  return 'pong-from-_lib'
}
```

- [ ] **Step 2: Create the endpoint that imports it**

```ts
// api/spike-ping.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { pong } from './_lib/ping'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ ok: true, message: pong() })
}
```

- [ ] **Step 3: Deploy to a preview URL**

```bash
git checkout -b spike/api-lib-bundling && git add api/ && git commit -m "spike: verify api/_lib bundling" && git push -u origin spike/api-lib-bundling
```

Open the Vercel preview URL for that branch.

- [ ] **Step 4: Verify both behaviours**

Run against the preview domain:

```bash
curl -s https://<preview-domain>/api/spike-ping
```

Expected: `{"ok":true,"message":"pong-from-_lib"}` — proves the import bundles.

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<preview-domain>/api/_lib/ping
```

Expected: `404` — proves `_lib` is not exposed as a public endpoint.

- [ ] **Step 5: Record the result and clean up**

If both pass, delete the spike files, return to `main`, and continue with the plan:

```bash
git rm api/spike-ping.ts api/_lib/ping.ts && git commit -m "spike: remove after verifying api/_lib bundling" && git checkout main
```

**If Step 4 fails** (non-200 on the endpoint, or the JSON missing), STOP and report to Ed. The fallback is to inline the ~40 lines of tier logic directly into each of `api/create-entry.ts` and `api/event-availability.ts`, exactly as `api/submit-form.ts` duplicates its date helpers today. Every later task still works; only the import lines change.

### Task 1: Test infrastructure

**Files:** Modify: `package.json`

- [ ] **Step 1:** `npm install -D vitest`
- [ ] **Step 2:** Add to `"scripts"`: `"test": "vitest run"`
- [ ] **Step 3:** Run `npm run test`. Expected: exits reporting no test files found (no crash).
- [ ] **Step 4:** Commit

```bash
git add package.json package-lock.json && git commit -m "chore: add vitest"
```

### Task 2: Tier logic — parsing

**Files:** Create: `src/lib/tickets.ts`, `src/lib/tickets.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/tickets.test.ts
import { describe, it, expect } from 'vitest'
import { parseTicketTypesSheet } from './tickets'

const HEADER = ['event_id', 'tier_id', 'label', 'price_gbp', 'capacity', 'sort_order']
export const ROWS = [
  HEADER,
  ['run-2026', 'standard', 'Standard Entry', '101.73', '999', '2'],
  ['run-2026', 'early-bird', 'Early Bird Entry', '81.42', '10', '1'],
  ['other-event', 'single', 'Entry', '15', '50', '1'],
]

describe('parseTicketTypesSheet', () => {
  it('returns only the given event, sorted by sort_order, prices in pence', () => {
    expect(parseTicketTypesSheet(ROWS, 'run-2026')).toEqual([
      { eventId: 'run-2026', tierId: 'early-bird', label: 'Early Bird Entry', pricePence: 8142, capacity: 10, sortOrder: 1 },
      { eventId: 'run-2026', tierId: 'standard', label: 'Standard Entry', pricePence: 10173, capacity: 999, sortOrder: 2 },
    ])
  })

  it('returns an empty array for an unknown event or an empty sheet', () => {
    expect(parseTicketTypesSheet(ROWS, 'nope')).toEqual([])
    expect(parseTicketTypesSheet([], 'run-2026')).toEqual([])
  })

  it('skips rows missing a price or capacity', () => {
    expect(parseTicketTypesSheet([HEADER, ['run-2026', 'x', 'X', '', '10', '1']], 'run-2026')).toEqual([])
    expect(parseTicketTypesSheet([HEADER, ['run-2026', 'y', 'Y', '10', '', '1']], 'run-2026')).toEqual([])
  })
})
```

- [ ] **Step 2:** Run `npx vitest run src/lib/tickets.test.ts` → FAIL, cannot resolve `./tickets`
- [ ] **Step 3: Implement**

```ts
// src/lib/tickets.ts
// MIRROR: this file must stay byte-identical to api/_lib/tickets.ts below the header
// comment. Vercel functions cannot import from src/ (see commit e8572dc), so the logic is
// duplicated on purpose. src/lib/tickets.test.ts fails if the two drift apart.

export interface TicketTier {
  eventId: string
  tierId: string
  label: string
  pricePence: number
  capacity: number
  sortOrder: number
}

/** tierId -> number of places taken (paid, or pending and still held) */
export type TakenCounts = Record<string, number>

export type TierAvailability = 'available' | 'sold_out' | 'not_yet'

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

export function pickAvailableTier(tiers: TicketTier[], taken: TakenCounts): TicketTier | null {
  for (const tier of tiers) {
    if ((taken[tier.tierId] ?? 0) < tier.capacity) return tier
  }
  return null
}

export function tierStatuses(
  tiers: TicketTier[],
  taken: TakenCounts,
): { tier: TicketTier; status: TierAvailability }[] {
  const current = pickAvailableTier(tiers, taken)
  return tiers.map(tier => ({
    tier,
    status:
      tier.tierId === current?.tierId ? 'available'
      : (taken[tier.tierId] ?? 0) >= tier.capacity ? 'sold_out'
      : 'not_yet',
  }))
}
```

- [ ] **Step 4:** Run `npx vitest run src/lib/tickets.test.ts` → parsing tests PASS
- [ ] **Step 5:** Commit

```bash
git add src/lib && git commit -m "feat: ticket tier parsing"
```

### Task 3: Tier rollover + the mirror file and its drift guard

**Files:** Modify: `src/lib/tickets.test.ts` · Create: `api/_lib/tickets.ts`

- [ ] **Step 1: Add the failing tests**

```ts
// append to src/lib/tickets.test.ts
import { readFileSync } from 'node:fs'
import { pickAvailableTier, tierStatuses } from './tickets'

const tiers = parseTicketTypesSheet(ROWS, 'run-2026')

describe('pickAvailableTier — early-bird rollover', () => {
  it('offers early bird while it is under capacity', () => {
    expect(pickAvailableTier(tiers, {})?.tierId).toBe('early-bird')
    expect(pickAvailableTier(tiers, { 'early-bird': 9 })?.tierId).toBe('early-bird')
  })

  it('rolls over to standard once early bird is full', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 10 })?.tierId).toBe('standard')
  })

  it('returns null when every tier is full', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 10, standard: 999 })).toBeNull()
  })
})

describe('tierStatuses', () => {
  it('marks the current tier available and later tiers not_yet', () => {
    expect(tierStatuses(tiers, { 'early-bird': 3 }).map(s => s.status)).toEqual(['available', 'not_yet'])
  })

  it('marks a full earlier tier sold_out and promotes the next one', () => {
    expect(tierStatuses(tiers, { 'early-bird': 10 }).map(s => s.status)).toEqual(['sold_out', 'available'])
  })

  it('marks everything sold_out when nothing is left', () => {
    expect(tierStatuses(tiers, { 'early-bird': 10, standard: 999 }).map(s => s.status)).toEqual(['sold_out', 'sold_out'])
  })
})

// Guards the deliberate duplication forced by the api/ <- src/ import ban (commit e8572dc).
describe('api/_lib/tickets.ts mirror', () => {
  const body = (src: string) => src.slice(src.indexOf('export interface TicketTier'))

  it('is identical to src/lib/tickets.ts below the header comment', () => {
    const client = readFileSync('src/lib/tickets.ts', 'utf8')
    const server = readFileSync('api/_lib/tickets.ts', 'utf8')
    expect(body(server)).toBe(body(client))
  })
})
```

- [ ] **Step 2:** Run `npx vitest run` → rollover tests FAIL (stubs absent), mirror test FAILS (no such file)
- [ ] **Step 3:** `pickAvailableTier` and `tierStatuses` were already written in Task 2, so only the mirror is missing. Create it by copying the client file and swapping the header comment:

```bash
{ printf '// MIRROR of src/lib/tickets.ts — server-side copy.\n// api/ cannot import from src/ (commit e8572dc: FUNCTION_INVOCATION_FAILED broke every\n// form on the site). Edit src/lib/tickets.ts, then re-copy the body here; the mirror test\n// in src/lib/tickets.test.ts fails if they drift.\n\n'; sed -n '/^export interface TicketTier/,$p' src/lib/tickets.ts; } > api/_lib/tickets.ts
```

- [ ] **Step 4:** Run `npx vitest run` → ALL PASS
- [ ] **Step 5:** Commit

```bash
git add src/lib api/_lib && git commit -m "feat: tier rollover logic with mirrored server copy"
```

### Task 4: Private entries sheet helper

**Files:** Create: `api/_lib/entriesSheet.ts`

Thin I/O wrapper following the same pattern as `api/submit-form.ts`; exercised end-to-end in Tasks 5–10.

- [ ] **Step 1: Implement**

```ts
// api/_lib/entriesSheet.ts — server only. Never imported from src/.
import { google } from 'googleapis'
import type { TakenCounts } from './tickets'

export const ENTRIES_TAB = 'Event_Entries'

/** Column order is load-bearing: A–D are the only columns the public availability
 *  endpoint reads, so no personal or health data is loaded into a public function. */
export const ENTRY_COLUMNS = [
  'Timestamp', 'Event ID', 'Tier ID', 'Status', 'Entry Ref', 'Tier Label',
  'Amount Paid (GBP)', 'Stripe Session ID', 'Paid At', 'Checked In',
  'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Gender',
  'Emergency Contact', 'Emergency Phone', 'Medical Details',
  'Waiver Agreed', 'Photo Consent', 'GDPR Consent',
]

/** A pending row holds its place for this long, matching the Stripe session expiry. */
export const HOLD_MS = 30 * 60 * 1000

function sheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

const sheetId = () => process.env.PRIVATE_SHEET_ID!

async function ensureHeaderRow(): Promise<void> {
  const api = sheets()
  const existing = await api.spreadsheets.values.get({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A1:A1`,
  })
  if (!existing.data.values?.length) {
    await api.spreadsheets.values.append({
      spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A1`,
      valueInputOption: 'RAW', requestBody: { values: [ENTRY_COLUMNS] },
    })
  }
}

/** Reads ONLY columns A–D (timestamp, event, tier, status). No personal data. */
export async function countTaken(eventId: string, now = Date.now()): Promise<TakenCounts> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A:D`,
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  const counts: TakenCounts = {}
  for (const [timestamp, rowEvent, tierId, status] of rows.slice(1)) {
    if (rowEvent !== eventId || !tierId) continue
    const held = status === 'paid'
      || (status === 'pending' && now - Date.parse(timestamp) < HOLD_MS)
    if (held) counts[tierId] = (counts[tierId] ?? 0) + 1
  }
  return counts
}

export interface PendingEntry {
  eventId: string
  tierId: string
  tierLabel: string
  entryRef: string
  sessionId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  gender: string
  emergencyName: string
  emergencyPhone: string
  medical: string
  waiverAgreed: string
  photoConsent: string
  gdprConsent: string
}

export async function appendPendingEntry(e: PendingEntry): Promise<void> {
  await ensureHeaderRow()
  await sheets().spreadsheets.values.append({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        new Date().toISOString(), e.eventId, e.tierId, 'pending', e.entryRef, e.tierLabel,
        '', e.sessionId, '', '',
        e.firstName, e.lastName, e.email, e.phone, e.dob, e.gender,
        e.emergencyName, e.emergencyPhone, e.medical,
        e.waiverAgreed, e.photoConsent, e.gdprConsent,
      ]],
    },
  })
}

export interface EntryRow {
  rowNumber: number
  status: string
  entryRef: string
  tierLabel: string
  firstName: string
  email: string
  eventId: string
}

/** Finds a row by entry ref. Reads the full row (server-side only). */
export async function findEntryByRef(entryRef: string): Promise<EntryRow | null> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A:V`,
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  const index = rows.findIndex((r, i) => i > 0 && r[4] === entryRef)
  if (index === -1) return null
  const row = rows[index]
  return {
    rowNumber: index + 1, // sheet rows are 1-based
    status: row[3] ?? '',
    entryRef: row[4] ?? '',
    tierLabel: row[5] ?? '',
    firstName: row[10] ?? '',
    email: row[12] ?? '',
    eventId: row[1] ?? '',
  }
}

export async function markEntryPaid(rowNumber: number, amountGbp: string): Promise<void> {
  await sheets().spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId(),
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `${ENTRIES_TAB}!D${rowNumber}`, values: [['paid']] },
        { range: `${ENTRIES_TAB}!G${rowNumber}`, values: [[amountGbp]] },
        { range: `${ENTRIES_TAB}!I${rowNumber}`, values: [[new Date().toISOString()]] },
      ],
    },
  })
}
```

- [ ] **Step 2:** Run `npx tsc -b` → no errors
- [ ] **Step 3:** Commit

```bash
git add api/_lib/entriesSheet.ts && git commit -m "feat: private entries sheet helper"
```

### Task 5: `api/event-availability.ts`

**Files:** Create: `api/event-availability.ts`

- [ ] **Step 1: Implement**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { countTaken } from './_lib/entriesSheet'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const eventId = String(req.query.eventId ?? '')
  if (!eventId) return res.status(400).json({ error: 'eventId required' })

  try {
    const taken = await countTaken(eventId)
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ taken })
  } catch (err) {
    console.error('availability error:', err)
    return res.status(500).json({ error: 'Unavailable' })
  }
}
```

- [ ] **Step 2:** `npx tsc -b` → no errors
- [ ] **Step 3:** Verify against the empty sheet (needs `vercel dev`, or check after deploy):

```bash
curl -s "http://localhost:3000/api/event-availability?eventId=run-2026"
```

Expected: `{"taken":{}}`

- [ ] **Step 4:** Commit

```bash
git add api/event-availability.ts && git commit -m "feat: event availability endpoint"
```

### Task 6: `api/create-entry.ts`

**Files:** Create: `api/create-entry.ts` · Modify: `package.json`

- [ ] **Step 1:** `npm install stripe`
- [ ] **Step 2: Implement**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'node:crypto'
import Stripe from 'stripe'
import { parseTicketTypesSheet, pickAvailableTier } from './_lib/tickets'
import { countTaken, appendPendingEntry, HOLD_MS } from './_lib/entriesSheet'

const REQUIRED = [
  'eventId', 'eventTitle', 'tierId', 'first-name', 'last-name', 'email',
  'date-of-birth', 'emergency-name', 'emergency-phone', 'waiver-agreed', 'gdpr-consent',
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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Ticket_Types?key=${apiKey}`
  const json = (await (await fetch(url)).json()) as { values?: string[][] }
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
      metadata: { entryRef, eventId: f.eventId, tierId: tier.tierId },
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
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-entry error:', err)
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' })
  }
}
```

- [ ] **Step 3:** `npx tsc -b` → no errors
- [ ] **Step 4:** Commit

```bash
git add api/create-entry.ts package.json package-lock.json && git commit -m "feat: create-entry endpoint with pending row and Stripe checkout"
```

### Task 7: `api/stripe-webhook.ts`

**Files:** Create: `api/stripe-webhook.ts`

- [ ] **Step 1: Implement**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { findEntryByRef, markEntryPaid } from './_lib/entriesSheet'

// Stripe signature verification needs the raw body, not the parsed one.
export const config = { api: { bodyParser: false } }

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

function confirmationHtml(firstName: string, eventTitle: string, tierLabel: string, ref: string, amount: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#376A6B;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">You're in — ${eventTitle}</h2>
        <p style="margin:4px 0 0;opacity:.85;font-size:14px">Entry reference: <strong>${ref}</strong></p>
      </div>
      <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
        <p>Hi ${firstName},</p>
        <p>Your entry is confirmed — <strong>${tierLabel}</strong>, £${amount} paid.</p>
        <p>Keep your entry reference <strong>${ref}</strong> handy for event day. We'll email
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
      html: `<p>${entry.firstName} (${entry.email}) entered ${title} — ${entry.tierLabel}, £${amount}. Reference ${entry.entryRef}.</p>`,
    })
  } catch (emailErr) {
    // The entry is saved and paid; a failed email must not trigger a Stripe retry loop.
    console.error('Confirmation email failed (entry is saved):', emailErr)
  }

  return res.status(200).json({ received: true })
}
```

- [ ] **Step 2:** Add `eventTitle` to the Checkout metadata so the email can name the event. In `api/create-entry.ts`, change the metadata line to:

```ts
      metadata: { entryRef, eventId: f.eventId, tierId: tier.tierId, eventTitle: f.eventTitle.slice(0, 480) },
```

- [ ] **Step 3:** `npx tsc -b` → no errors
- [ ] **Step 4:** Verify locally with the Stripe CLI in test mode:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Complete a real test checkout through the UI in Task 10 rather than `stripe trigger` — the triggered fixture has no `entryRef`, and should log "no entryRef metadata" and return 200.

- [ ] **Step 5:** Commit

```bash
git add api/stripe-webhook.ts api/create-entry.ts && git commit -m "feat: stripe webhook marks entry paid and sends confirmations"
```

### Task 8: Availability hook

**Files:** Create: `src/hooks/useTicketAvailability.ts`

- [ ] **Step 1: Implement**

```ts
import { useState, useEffect } from 'react'
import { parseTicketTypesSheet, tierStatuses } from '../lib/tickets'
import type { TicketTier, TakenCounts, TierAvailability } from '../lib/tickets'

export interface TierStatus {
  tier: TicketTier
  status: TierAvailability
}

export function useTicketAvailability(eventId: string | undefined) {
  const [statuses, setStatuses] = useState<TierStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

    Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Ticket_Types?key=${apiKey}`)
        .then(r => r.json())
        .catch(() => ({ values: [] as string[][] })),
      fetch(`/api/event-availability?eventId=${encodeURIComponent(eventId)}`)
        .then(r => r.json())
        .catch(() => ({ taken: {} as TakenCounts })),
    ])
      .then(([typesJson, availJson]) => {
        if (cancelled) return
        const tiers = parseTicketTypesSheet(typesJson.values ?? [], eventId)
        setStatuses(tierStatuses(tiers, (availJson.taken ?? {}) as TakenCounts))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [eventId])

  return { statuses, loading }
}
```

- [ ] **Step 2:** `npx tsc -b && npm run lint` → clean
- [ ] **Step 3:** Commit

```bash
git add src/hooks/useTicketAvailability.ts && git commit -m "feat: ticket availability hook"
```

### Task 9: Events listing and detail pages

**Files:** Create: `src/pages/Events.tsx`, `src/pages/EventDetail.tsx` · Modify: `src/App.tsx`, `src/components/layout/Header.tsx`

Read `src/pages/ProgrammesEvents.tsx` first and follow its visual conventions. Use the existing `SectionWrapper`, `Card`, `Badge`, `Button` and `Seo` components — `Seo` takes `{ title, description, path }` (see `src/components/Seo.tsx`), and `Button` takes `variant`/`size`/`href`. Events come from `useContentSheets().events`. Dates must be built as `new Date(date + 'T00:00:00')` to avoid the UTC off-by-one bug noted in HANDOFF.md.

- [ ] **Step 1: `Events.tsx`** — upcoming events (date >= today) as cards showing title, formatted date, location and "From £<lowest tier price>", each linking to `/events/${id}`. Past events in a dimmed "Previous events" section below. Empty state: "No events on sale right now — follow us for the next one." Include:

```tsx
<Seo
  title="Events — Lift Flintshire CIC"
  description="Upcoming community running events from Lift Flintshire CIC in Flintshire, North Wales."
  path="/events"
/>
```

- [ ] **Step 2: `EventDetail.tsx`** — `useParams()` for the id; find the event in `useContentSheets().events`. Handle loading, and a not-found state with a link back to `/events`. Render the event hero (title, date, time, location, description), then a ticket panel driven by `useTicketAvailability(id)`:
  - one row per tier: label and £price (`(pricePence / 100).toFixed(2)`);
  - `available` → highlighted card plus an "Enter now" `Button` linking to `/events/${id}/enter`;
  - `sold_out` → muted row with a "Sold out" `Badge`;
  - `not_yet` → muted row reading "Available once earlier tickets sell out";
  - no available tier → "This event is fully booked" notice instead of the button;
  - `?cancelled=1` in the query string → amber notice: "Checkout cancelled — your place was not reserved."
  - Below the panel, a short refund-policy line (wording from Ed, per spec prerequisite 3).

- [ ] **Step 3:** Add the routes to `src/App.tsx`, importing all four pages (Task 10 creates the last two; add all routes now and let TypeScript fail until then, or add these two first and the rest in Task 10):

```tsx
<Route path="/events" element={<Events />} />
<Route path="/events/:id" element={<EventDetail />} />
```

Add an "Events" link to the nav in `src/components/layout/Header.tsx`, matching the existing link pattern.

- [ ] **Step 4:** Verify. Add a test row to the `Events` and `Ticket_Types` tabs, then:

```bash
npm run dev
```

Visit `/events` and `/events/<id>`: the listing renders, the early-bird tier shows as available and standard as "not yet". Then `npx tsc -b && npm run lint` → clean.

- [ ] **Step 5:** Commit

```bash
git add src/ && git commit -m "feat: events listing and detail pages"
```

### Task 10: Entry form and confirmation page

**Files:** Create: `src/pages/EventEntry.tsx`, `src/pages/EntryConfirmed.tsx` · Modify: `src/App.tsx`

- [ ] **Step 1: `EventEntry.tsx`** — resolve the event via `useContentSheets` and the current tier via `useTicketAvailability`. If no tier is available, show the fully-booked message and a link back rather than a form. Copy the `inputClass` / `labelClass` constants and the waiver wording from `src/components/forms/RegistrationForm.tsx`, writing the fields inline — do not try to bend that 531-line shared component into this shape.

  Fields (matching the `REQUIRED` list in `api/create-entry.ts` exactly): `first-name`*, `last-name`*, `email`*, `phone`, `date-of-birth`*, `gender` (select), `emergency-name`*, `emergency-phone`*, `medical-details` (textarea, "Leave blank if none"), `waiver-agreed`* (checkbox with the full waiver text), `photo-consent` (checkbox), `gdpr-consent`* (checkbox linking to `/privacy`).

  Show a price summary: tier label and the single all-in price, with the line "Price includes all card and booking fees — no extras at checkout."

  On submit, POST JSON to `/api/create-entry` with the form fields plus `eventId`, `eventTitle` and `tierId`; on `{ url }` set `window.location.href = url`. On a 409 show the returned error with a "refresh" link; on any other failure show a generic retry message. Disable the button while submitting, labelled "Redirecting to secure payment…".

- [ ] **Step 2: `EntryConfirmed.tsx`** — success page. Read `?ref=` from the query string and show it prominently: "Entry confirmed — your reference is **LF26-XXXXXX**." Explain that a confirmation email is on its way (worth checking spam), and link back to `/events`. No Stripe lookup: the webhook and the email are the source of truth.

- [ ] **Step 3:** Ensure both routes are present in `src/App.tsx`:

```tsx
<Route path="/events/:id/enter" element={<EventEntry />} />
<Route path="/events/entry-confirmed" element={<EntryConfirmed />} />
```

- [ ] **Step 4:** Full end-to-end verification with Stripe **test-mode** keys, `vercel dev`, and `stripe listen --forward-to localhost:3000/api/stripe-webhook`:
  1. Submit the entry form → a `pending` row appears in the private sheet.
  2. Pay with test card `4242 4242 4242 4242` → redirected to `/events/entry-confirmed?ref=…`.
  3. The webhook fires → the row flips to `paid` with the amount and paid-at set.
  4. Both emails arrive (participant confirmation and the admin notification).
  5. Re-send the same webhook event from the Stripe CLI → returns 200, the row is unchanged, and no second email is sent.
  6. Set the early-bird capacity to 1 in the sheet and reload the detail page → early bird shows sold out and standard becomes available.

- [ ] **Step 5:**

```bash
npm run lint && npx tsc -b && npm run test
```

Expected: lint clean, no type errors, all tests pass.

- [ ] **Step 6:** Commit

```bash
git add src/ && git commit -m "feat: event entry form and confirmation page"
```

### Task 11: Documentation and go-live

**Files:** Modify: `HANDOFF.md`

- [ ] **Step 1:** Add an "Event Ticketing" section to `HANDOFF.md` covering: the two-spreadsheet split and why (public prices vs private entrant data); the env var list; how the tier rollover works and how to add a new event; the `api/` ← `src/` import ban and the mirrored `tickets.ts` files; the pending/paid row lifecycle and the 30-minute hold; how to export the participant report (private sheet → File → Download → CSV); and how to refund (Stripe dashboard, then annotate the sheet row).
- [ ] **Step 2:** Document the pricing rule prominently: **`price_gbp` is the all-in price the buyer pays.** To net £100, enter `101.73` — `(price + 0.20) ÷ 0.985`. Never add a separate card or booking fee: that is a prohibited surcharge under the Consumer Rights (Payment Surcharges) Regulations 2012 when card is the only payment method.
- [ ] **Step 3:** Go-live checklist to work through with Ed: Stripe account verified → live keys in Vercel → live-mode webhook endpoint registered → one real low-value ticket purchased and then refunded end-to-end → early-bird and standard rows entered with real capacities → event `status` set to open.
- [ ] **Step 4:** Commit

```bash
git add HANDOFF.md && git commit -m "docs: event ticketing handoff notes"
```

---

## Out of scope (Phase 2 — separate plan)

QR code in the confirmation email plus a PIN-protected marshal check-in page; "email all entrants" broadcast function; scheduled reminder emails; promo codes; waitlist.

## Self-review

- **Spec coverage:** sheet tabs (manual setup + Task 4), tier rollover (T2/T3), all-in pricing (T2 fixtures, T10 copy, T11 docs), checkout (T6), webhook, entry ref and emails (T7), pages (T9/T10), reports and refunds (T11), data protection (T4 column order, T5 `A:D` read, T6 metadata limited to a reference).
- **The three review findings are each addressed by a concrete task:** cross-boundary imports by Task 0 plus the Task 3 mirror guard; the surcharge by the price model throughout; personal data in Stripe and the racy entry ref by the pending-row flow in Tasks 4, 6 and 7.
- **Type consistency:** `TicketTier`, `TakenCounts` and `TierAvailability` are defined once and mirrored verbatim; `taken` is the field name in the API response, the hook and the logic; `ENTRY_COLUMNS` order matches `appendPendingEntry`, `countTaken` (A–D) and `findEntryByRef` (indices 1, 3, 4, 5, 10, 12).
- **Invariant:** a place is only ever *held* by a pending row for 30 minutes and only *taken* permanently once Stripe confirms payment, so an abandoned checkout can never permanently consume capacity.
