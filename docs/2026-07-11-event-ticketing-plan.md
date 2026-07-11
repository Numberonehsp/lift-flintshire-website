# Event Registration & Ticketing on LiftFlintshire.co.uk — Plan

**Date:** 2026-07-11 · **Status:** Approved (Approach A) — decisions confirmed by Ed 2026-07-11

**Confirmed decisions:**
1. New Stripe account will be set up for the CIC (pay-on-the-day rejected).
2. Stripe fees added on top of the ticket price at checkout, not absorbed.
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
  or past — this reproduces the early-bird → standard rollover from the last event. The
  Stripe fee (~1.5% + 20p, rounded up) is added as a separate "booking fee" line item at
  checkout so the advertised price stays clean.
- **Event_Entries** (new tab, written by webhook):
  `timestamp | event_id | entry_ref | ticket_type | first_name | last_name | email | phone | dob | gender | emergency_name | emergency_phone | medical | club/notes | waiver_agreed | photo_consent | gdpr_consent | amount_paid | stripe_session_id | checked_in`
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

- `api/create-entry.ts` — validates the form, checks remaining capacity by counting
  `Event_Entries` rows for the event, creates a Stripe Checkout session (entry details in
  `metadata`), returns the redirect URL. Free events skip Stripe and write the entry
  directly.
- `api/stripe-webhook.ts` — on `checkout.session.completed`: generate entry ref (e.g.
  `LF26-0042`), append to `Event_Entries`, send participant confirmation email (Resend,
  reuse the existing HTML email style), send admin notification.
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

- Capacity: re-check inside the webhook; if oversold by a race condition, flag the row and
  email admin (refund manually via Stripe dashboard). At run-club scale this is acceptable.
- Abandoned checkouts: no row is written until payment succeeds, so no ghost entries.
- Refund policy text on the event page; refunds handled manually in Stripe.
- Sheet unavailable: webhook retries (Stripe retries failed webhooks automatically); email
  still sent, admin alerted.

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
3. Refund/transfer policy wording for the event page (needed for card-payment consumer
   rights clarity).
