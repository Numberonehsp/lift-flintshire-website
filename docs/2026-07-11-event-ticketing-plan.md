# Event Registration & Ticketing on LiftFlintshire.co.uk — Plan

**Date:** 2026-07-11 · **Revised:** 2026-09-05 after architecture review
· **Status:** Approved (Approach A), revised

> **2026-09-05 revision.** A review before implementation found three defects in the
> original design. See "Revision notes" at the end of this document. Summary: shared
> root-level `lib/` replaced with `api/_lib/` (the original pattern caused a production
> outage on 26 Aug); the separate booking-fee line item removed as an unlawful UK card
> surcharge and folded into the ticket price; and personal/health data moved out of Stripe
> metadata into a pending-row flow in the private sheet.

**Confirmed decisions:**
1. New Stripe account will be set up for the CIC (pay-on-the-day rejected).
2. ~~Stripe fees added on top of the ticket price at checkout, not absorbed.~~
   **Revised 2026-09-05:** fees are *included in the advertised ticket price* — a separate
   card/booking fee is banned under the Consumer Rights (Payment Surcharges) Regulations
   2012 (as amended 2018) when card is the only payment method. Same money, one price.
   To net £100, advertise £101.73 — `(price + 0.20) ÷ 0.985`.
3. Reference pricing from last event: 10 early-bird tickets at £80 (sold out), then 19
   standard at £100 — so **tiered ticket types with per-tier capacity that auto-roll from
   early bird to standard** are a core requirement, not a nice-to-have.
4. Deployment confirmed: the whole site (including `/api/*` functions) runs on **Vercel**;
   `netlify.toml` is a dead leftover. New functions go in `api/`.
5. QR-code check-in promoted from "optional" to planned Phase 2 — wanted to speed up race
   day.

## Goal

Replace TicketsCandy for future run club events with an in-house "Events" section on
liftflintshire.co.uk that handles ticket purchasing, automated participant communication,
and participant reports.

## What TicketsCandy (and similar platforms) actually provide

Researched: TicketsCandy, RunSignup, Race Roster, Let's Do This. The feature set that
matters for a small community running event boils down to:

| Capability | What it looks like on those platforms |
|---|---|
| Event page | Hero image, date/time/location, description, ticket widget |
| Ticket types | e.g. Adult 5K / Junior 5K / Spectator, each with price + capacity |
| Checkout | Card payment, order confirmation with reference number |
| Custom questions | Emergency contact, medical info, T-shirt size, age/DOB |
| Waiver | Digital agreement collected at checkout |
| Automated comms | Instant confirmation email, pre-event reminder/info email |
| Reports | Participant list export (CSV), sales totals |
| Check-in | Scanner app or searchable list on race day |
| Extras (not needed at our scale) | Promo codes, affiliates, retargeting, POS, fundraising |

**Honest note on cost:** TicketsCandy charges a 0.9% buyer-side fee; Stripe (which we would
use) charges ~1.5% + 20p per UK card transaction, also passable to the buyer. The reason to
build this is **ownership** — participant data straight into our own Google Sheet, emails
from our own domain, no third-party account, full control of the page and comms — not fee
savings.

## What we already have (big head start)

- `api/submit-form.ts` — serverless function that takes form submissions, appends rows to
  the Google Sheet (service account) and sends styled emails via Resend. This is 70% of a
  ticketing backend already.
- Google Sheets CMS with an **Events** tab (`id, title, date, time, location, price,
  description, programme, bookingLink`) already rendered on `ProgrammesEvents.tsx`.
- `RegistrationForm.tsx` — shared waiver component (GDPR, photo consent, injury
  declaration, initials) used by the C25K / Women's Run Club registration pages.
- Resend for transactional email; react-router pages; Tailwind design system.

## Approaches considered

**A. Stripe Checkout + existing Sheet/Resend pipeline (recommended)**
Event detail pages driven by the Events sheet; entry form → serverless function creates a
Stripe Checkout session → Stripe webhook on success writes the entry to an `Event_Entries`
tab and sends a confirmation email with an entry reference. No database. Pros: paid
ticketing, fits the existing stack exactly, participant data lands in the sheet we already
report from. Cons: capacity checks are "soft" (read count before checkout — fine at run
club scale); needs a Stripe account.

**B. Free registration + pay on the day / bank transfer**
Reuse the existing registration-page pattern verbatim, add capacity display and reminder
emails. Pros: 1–2 days' work, zero payment complexity. Cons: doesn't actually replace the
ticket *purchasing* part; chasing payments manually.

**C. Full platform with a database (Supabase)**
Hard capacity enforcement, QR-coded tickets, check-in scanner page, admin dashboard.
Pros: closest replica of TicketsCandy. Cons: new infrastructure, auth, significantly more
build and maintenance — overkill for a few events a year.

**Recommendation: A**, with B's registration form as its front half, and C's QR check-in as
an optional later phase.

## Design (Approach A)

### 1. Data model — Google Sheet tabs

- **Events** (existing tab, extended): add columns
  `entry_opens | entry_closes | image | status (draft/open/sold_out/closed)`
- **Ticket_Types** (new tab, one row per tier):
  `event_id | tier_id | label | price_gbp | capacity | sort_order`
  e.g. `run-2026 | early-bird | Early Bird Entry | 80 | 10 | 1` and
  `run-2026 | standard | Standard Entry | 100 | 999 | 2`. A tier is shown as available
  only when its own capacity isn't reached AND every lower `sort_order` tier is sold out
  or past — this reproduces the early-bird → standard rollover from the last event.
  `price_gbp` is the **final price the buyer pays**, already inclusive of Stripe's fee (see
  revised decision 2). One price, one line item, no surcharge.
- **Event_Entries** (new tab, in the separate private spreadsheet). Column order is
  deliberate: the columns needed to count sold tickets come first, so the public
  availability endpoint can read `A:D` and never touch personal or health data.
  `timestamp | event_id | tier_id | status | entry_ref | tier_label | amount_paid | stripe_session_id | paid_at | checked_in | first_name | last_name | email | phone | dob | gender | emergency_name | emergency_phone | medical | waiver_agreed | photo_consent | gdpr_consent`
  `status` is `pending` (checkout started) or `paid` (payment confirmed).
- The Impact Dashboard and reports read straight from `Event_Entries` — that *is* the
  participant report. Sheet → File → Download CSV replaces TicketsCandy exports.

### 2. Pages & components

- `/events` — listing page (upgrade of the events block already on Programmes & Events),
  cards from the Events tab, "Enter now" instead of external `bookingLink`.
- `/events/:id` — event detail page: hero, date/location (+ map link), description,
  ticket-type picker with price and remaining places, entry button. TicketsCandy-style
  anatomy.
- `/events/:id/enter` — entry form: participant details, emergency contact, medical
  declaration, reuse `RegistrationForm` waiver block. Submits to the new API function.
- `/events/entry-confirmed` — success page (Stripe redirects here) showing entry ref.

### 3. Serverless functions (same pattern as `api/submit-form.ts`)

Shared server-side code lives in `api/_lib/` (underscore prefix = not routed as an
endpoint). **Nothing under `api/` may import from `src/`** — that pattern crashed every
form on the site on 26 Aug 2026 (commit `e8572dc`, `FUNCTION_INVOCATION_FAILED`).

- `api/create-entry.ts` — validates the form, counts taken places, confirms the requested
  tier is the currently-available one, generates an entry ref, creates a Stripe Checkout
  session (metadata carries **only** `entryRef`/`eventId`/`tierId` — no personal data),
  then writes a `pending` row holding the participant details, and returns the redirect URL.
- `api/stripe-webhook.ts` — on `checkout.session.completed`: look up the row by entry ref,
  flip `pending` → `paid` (already-`paid` rows return 200 unchanged, so Stripe's retries are
  idempotent), record amount and paid-at, then send the participant confirmation email
  (Resend, reusing the existing HTML email style) and an admin notification.
- `api/send-event-email.ts` (phase 2) — admin-triggered "email all entrants" for the
  pre-event info/reminder email (race pack details, parking, start time), reading
  addresses from `Event_Entries`. Protected by a shared secret. This replaces
  TicketsCandy's automated comms; a true scheduled reminder can come later via a cron
  function.

### 4. Automated communication plan

1. **Instant:** confirmation email with entry ref, event details, what-to-bring (webhook).
2. **Pre-event:** final-instructions email to all entrants (admin-triggered function).
3. **Post-event:** link everyone to the existing `Questionnaire.tsx` feedback form —
   closes the loop into the Impact Dashboard, something TicketsCandy never did.

### 5. Race-day check-in (phase 2, planned)

Confirmation email includes the entry ref rendered as a QR code (generated server-side,
embedded in the email). A marshal-facing page at `/events/:id/check-in` (protected by a
shared PIN) scans the QR with the phone camera, looks the ref up in `Event_Entries`, and
marks `checked_in`. Fallback: name search on the same page.

### 6. Error handling & edge cases

- **Capacity** is a soft check, deliberately. A place counts as taken when its row is
  `paid`, or `pending` and less than 30 minutes old (Stripe sessions are set to expire in
  30 minutes, so a stale pending row releases its hold). Two people can still take the last
  early-bird place within the same instant; the cost is one extra £80 entry, refundable in
  the Stripe dashboard. Hard atomic capacity is not worth a database at this scale.
- **Abandoned checkouts** leave a `pending` row that expires after 30 minutes and is
  ignored by every count and report. They're useful signal, not junk.
- **Sheet unavailable during checkout:** `create-entry` fails closed — the user sees an
  error and no payment is taken.
- **Sheet unavailable at webhook time:** the function returns 500 and Stripe retries
  automatically (for up to 3 days), so a confirmed payment is never lost. The row already
  exists from `create-entry`, so the participant's details survive regardless.
- **Idempotency:** Stripe retries webhooks. A row already marked `paid` short-circuits to
  200 without re-sending emails.
- Refund policy text on the event page; refunds handled manually in Stripe. Events on a
  fixed date are exempt from the 14-day distance-selling cooling-off period, so a
  no-refund (or transfer-only) policy is lawful — it just has to be stated up front.

### 6a. Data protection

Entrant rows include medical/health information, which is special-category data under UK
GDPR Article 9. Two rules follow, both reflected in the design:

- It lives **only** in the private spreadsheet, shared with the service account alone —
  never in the public content sheet, and never in Stripe metadata (Stripe only ever sees an
  entry reference).
- The public `event-availability` endpoint reads columns `A:D` only, so health data is not
  loaded into a publicly-reachable function at all.

### 7. Build phases

1. **Phase 1 (core, ~3–5 sessions):** Events sheet extension, `/events` + detail + entry
   pages, `create-entry` + `stripe-webhook` functions, confirmation emails, Entries tab.
2. **Phase 2:** entrant broadcast email function, remaining-places display, QR check-in.
3. **Phase 3 (only if needed):** promo codes, waitlist, scheduled reminders.

## Prerequisites before Phase 1 can go live

1. Stripe account created for Lift Flintshire CIC and verified (CIC registration details
   + bank account needed). Keys go in Vercel env vars: `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`.
2. Webhook endpoint registered in the Stripe dashboard →
   `https://liftflintshire.co.uk/api/stripe-webhook`.
3. Refund/transfer policy wording for the event page.
4. Confirm the private entries spreadsheet is shared **only** with the service account
   (`client_email` from `GOOGLE_SERVICE_ACCOUNT_KEY`), and add `TICKETING_SHEET_ID` to
   Vercel.
5. Verify the existing server-side `GOOGLE_SHEET_ID` is *not* the public
   `VITE_GOOGLE_SHEET_ID`. If it is, the current `Registrations` tab — which already holds
   medical details for the programme sign-ups — is publicly readable and needs moving
   before anything else ships.

## Revision notes — 2026-09-05

Reviewed before implementation, two months after the design was written. Three defects
found and corrected above:

1. **Shared root `lib/` → `api/_lib/`.** The original design had one `lib/` directory
   imported by both the Vite client and the Vercel functions. On 26 Aug 2026 that exact
   pattern (an `api/` file importing from `src/`) crashed the serverless function and broke
   *every form on the site*; commit `e8572dc` fixed it by duplicating the code inside
   `api/`. Server code now lives in `api/_lib/`, the client keeps its own copy under
   `src/lib/`, and a unit test asserts the two mirrored files stay byte-identical. A
   deployment spike verifies `api/_lib/` bundles before anything is built on it.
2. **Booking fee → included in the price.** A separate fee equal to the card cost, when
   card is the only payment method, is a prohibited surcharge under the Consumer Rights
   (Payment Surcharges) Regulations 2012 as amended in 2018 — ticket booking is a named
   example in the guidance. The original formula was also arithmetically wrong, since
   Stripe charges its percentage on the total *including* the added fee.
3. **Personal data out of Stripe, entry refs made collision-safe.** The original design put
   medical details in Stripe metadata and derived entry references from the sheet's row
   count — racy under concurrent webhooks and corrupted by any deleted row. Replaced with
   the pending-row flow: details go straight to the private sheet, Stripe holds only a
   randomly-generated reference.

Considered and rejected: moving to Supabase/Postgres. It would give true atomic capacity
and proper constraints, but 29 entries at the last event doesn't justify new
infrastructure, and Sheets keeps the data directly readable and exportable by the people
running the event. Revisit if an event ever approaches several hundred entries.
