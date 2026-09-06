# Lift Flintshire CIC — Project Handoff

## Project
Website for Lift Flintshire CIC, a not-for-profit community fitness organisation in Flintshire, North Wales. Live at **liftflintshire.co.uk**, deployed on **Vercel** (confirmed via response headers 2026-07-11 — `server: Vercel` on apex and www), auto-deploys from GitHub (`Numberonehsp/lift-flintshire-website`). `netlify.toml` is a leftover from the earlier Netlify deployment and is unused; `vercel.json` holds the SPA rewrite (everything except `/api/*` → `index.html`).

---

## Tech Stack
- Vite + React 18 + TypeScript (strict, `verbatimModuleSyntax` — always use `import type` for type-only imports)
- Tailwind CSS v3 with custom tokens: `teal` #376A6B, `ink` #111111, `bg` #FAFAF8
- React Router v6 + ScrollToTop on route change
- Forms submit to `/api/submit-form` (Vercel serverless function: Resend email + Google Sheets append). The `data-netlify` attributes still in the JSX are dead leftovers from the Netlify era. `Contact.tsx` was briefly broken after the Vercel move (still POSTing to `/`, old Netlify Forms style) — fixed in `bb98f20`.
- Google Sheets API v4 (public fetch via `VITE_GOOGLE_SHEET_ID` + `VITE_GOOGLE_API_KEY`)
- Recharts for Impact Dashboard
- react-helmet-async for SEO

---

## Key Files
| File | Purpose |
|------|---------|
| `src/hooks/useGoogleSheets.ts` | Fetches Sheet1 (impact data) + Summary tab (hero stats). Falls back to mock data. |
| `src/hooks/useContentSheets.ts` | Fetches Events + Programme_Sessions + Registrations tabs. Falls back to static data. |
| `src/data/events.ts` | Static fallback events (used until Google Sheet is populated) |
| `src/data/programmes.ts` | Static programme content — includes Couch to 5K and Women's Run Club |
| `src/data/mockData.ts` | Mock impact rows for dev/fallback |
| `src/pages/Home.tsx` | Hero stats driven by `useGoogleSheets` (heroStats field) |
| `src/pages/ProgrammesEvents.tsx` | Sessions overridden by `useContentSheets`, events fully live from sheet |
| `src/pages/RegisterCouchTo5k.tsx` | C25K registration page with full waiver + Netlify Form submission |
| `src/pages/RegisterWomensRunClub.tsx` | Women's Run Club registration page (monthly, first Saturday) |
| `src/pages/Questionnaire.tsx` | Post-programme feedback form with star ratings and wellbeing impact |
| `src/components/forms/RegistrationForm.tsx` | Shared waiver component (GDPR, photo consent, injury declaration, initials) |
| `public/images/` | run-club-1.jpeg, run-club-2.jpeg (only programme with photos; others use ImagePlaceholder) |
| `public/logo-white.png` | White logo on black background — rendered with `mix-blend-mode: screen` |

---

## Google Sheets — two spreadsheets, not one

There are **two separate Google Sheets**, and which one a tab belongs in is a real
security boundary, not a filing preference:

- **Public content sheet** (`VITE_GOOGLE_SHEET_ID`, read client-side with `VITE_GOOGLE_API_KEY`).
  Fetched directly from every visitor's browser, so it has to be shared "anyone with the
  link" for the API key to work at all — **anything in this sheet is effectively public**,
  whether or not the site's own code happens to display it. Tabs: `Summary` (homepage hero
  stats), `Events`, `Programme_Sessions`, `Ticket_Types` (event ticketing).
- **Private data sheet** (`PRIVATE_SHEET_ID`, written server-side only, from `api/`
  functions using `GOOGLE_SERVICE_ACCOUNT_KEY`). Shared *only* with the service account —
  never "anyone with the link". Tabs: `Registrations`, `Feedback`, and (once built)
  `Event_Entries`. This is where any personal or health data belongs.

**Public sheet tabs:**

**Summary** — drives hero stats on homepage
| Value | Label |
|-------|-------|
| 1,200+ | Participants supported |
| ... | ... |

**Events** — columns: `id | title | date (YYYY-MM-DD) | time | location | price | description | programme | bookingLink`

**Programme_Sessions** — columns: `programme_id | day | time | location | cost`
- One row per session day (e.g. Stay Strong Tuesday and Thursday = 2 rows both with `stay-strong`)
- Valid programme_ids: `stay-strong`, `run-club`, `weightlifting`, `couch-to-5k`, `womens-run-club`

**Private sheet tabs**, written by `api/submit-form.ts`:

**Registrations** — one row per form submission (names, DOB, guardian/emergency contacts,
medical details). Columns are `SHEET_COLUMNS` in `api/submit-form.ts`.

**Feedback** — one row per questionnaire submission. Columns are `FEEDBACK_SHEET_COLUMNS`
in `api/submit-form.ts`.

### Incident — personal data was exposed in the public sheet (fixed 2026-09-06)

`Registrations` and `Feedback` used to live in the **public** content sheet. Since
`f896f38` (May 2026) every registration — full names, dates of birth, guardian names and
phone numbers, medical conditions, for programmes including under-18 participants — was
written to a tab inside the sheet that has to be publicly link-shared for the site's own
`Events`/`Programme_Sessions` fetches to work. Compounding it, `useContentSheets.ts` also
fetched that `Registrations` tab client-side (in full, no column restriction) to feed a
`registrations` summary that, on inspection, **no page ever rendered** — dead code that
was itself exposing the data further.

Fixed by:
1. Moving `Registrations` and `Feedback` to the private spreadsheet
   (`PRIVATE_SHEET_ID`) — `api/submit-form.ts`'s `appendToSheet` now writes there instead
   of `VITE_GOOGLE_SHEET_ID`.
2. Deleting the dead client-side fetch and `parseRegistrationsSheet` from
   `useContentSheets.ts` entirely, rather than just repointing it.
3. Manually migrating the historical rows and deleting the `Registrations`/`Feedback` tabs
   from the public sheet (see below) — moving future writes isn't enough on its own; the
   old data sitting in the public sheet was still exposed until removed.

**If you ever add a field or a new form that collects anything personal, it must write to
`PRIVATE_SHEET_ID`, never to `VITE_GOOGLE_SHEET_ID`.** The tell: if a value is fetched
using `VITE_GOOGLE_API_KEY` from client-side code, assume anyone on the internet can read
it directly, regardless of whether the site's own UI shows it.

---

## Event Ticketing

Self-hosted replacement for TicketsCandy. Design doc:
`docs/2026-07-11-event-ticketing-plan.md`. Implementation plan:
`docs/superpowers/plans/2026-07-11-event-ticketing.md`. Status as of this writing: code
complete on branch `feature/ticketing-entries-sheet` (Tasks 1–10), not yet merged to
`main` — blocked on Stripe test/live keys.

**Pricing rule — read this before adding an event.** `Ticket_Types.price_gbp` is the
**all-in price the buyer pays**, inclusive of Stripe's fee. There is no separate booking
fee: adding one when card is the only payment method is a prohibited surcharge under the
Consumer Rights (Payment Surcharges) Regulations 2012 (as amended 2018). To net £100,
enter `101.73` — `(price + 0.20) ÷ 0.985`.

**`Ticket_Types` tab** (public sheet): `event_id | tier_id | label | price_gbp | capacity | sort_order`.
One row per tier, e.g.:
```
run-2026 | early-bird | Early Bird Entry | 81.42  | 10  | 1
run-2026 | standard   | Standard Entry   | 101.73 | 999 | 2
```
Tiers roll over in `sort_order`: the lowest-order tier under capacity is "available";
earlier tiers at capacity show "sold out"; later tiers show "available once earlier
tickets sell out". Logic lives in `src/lib/tickets.ts`.

**`Event_Entries` tab** (private sheet, `PRIVATE_SHEET_ID`): one row per entry attempt,
`status` `pending` → `paid`. A row is created by `api/create-entry.ts` *before* Stripe
Checkout opens (holds the tier slot for 30 minutes, matching Stripe's session expiry) and
flipped to `paid` by `api/stripe-webhook.ts` once payment confirms. Columns are ordered so
the public `api/event-availability.ts` endpoint can read only `A:D` — personal and health
data never reaches a publicly-callable function. Column reference:
`timestamp | event_id | tier_id | status | entry_ref | tier_label | amount_paid | stripe_session_id | paid_at | checked_in | first_name | last_name | email | phone | dob | gender | emergency_name | emergency_phone | medical | waiver_agreed | photo_consent | gdpr_consent`.

**`api/` cannot import from `src/`.** Same rule as the rest of this doc, re-verified for
this feature by a throwaway spike (`spike/api-lib-bundling`, deleted): shared server logic
lives in `api/_lib/`, and the tier logic is deliberately duplicated between
`api/_lib/tickets.ts` and `src/lib/tickets.ts` — `src/lib/tickets.test.ts` has a test that
fails if the two drift. **Every relative import inside `api/` needs an explicit `.js`
extension** (`from './tickets.js'`, even though the source is `.ts`) — Node's ESM loader
requires it at runtime since `package.json` has `"type": "module"`; `api/tsconfig.json`
(added alongside this feature, `moduleResolution: nodenext`) catches a missing one locally
now, where previously `api/` had no type-checking coverage at all.

**Reports & refunds**: the `Event_Entries` tab *is* the participant report — File →
Download → CSV. Refunds are manual: process in the Stripe dashboard, then edit the sheet
row (there's no automated refund flow in Phase 1).

**Env vars needed** (beyond the existing `RESEND_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_KEY`,
`PRIVATE_SHEET_ID`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, and
non-`VITE_`-prefixed `GOOGLE_SHEET_ID_PUBLIC` + `GOOGLE_API_KEY` mirroring the two
client-side values (server code can't rely on `VITE_`-prefixed vars at runtime).

**Go-live checklist**:
1. Stripe account verified for the CIC; live keys added to Vercel (Production only).
2. Webhook endpoint registered in the Stripe dashboard, live mode →
   `https://liftflintshire.co.uk/api/stripe-webhook`.
3. One real low-value ticket bought end-to-end in live mode, then refunded, before
   announcing a real event.
4. Early-bird/standard rows entered in `Ticket_Types` with real capacities; event `status`
   set to open.

**Stripe has three separate environments — cost real debugging time to learn this:**
a *sandbox* (its own dashboard section, its own keys, its own webhook endpoints), the
account's regular *test mode*, and *live mode*. A webhook endpoint created in one is
invisible to the others — `GET /v1/webhook_endpoints` from test mode will show nothing
for a sandbox-created endpoint, and a sandbox signing secret will never verify a test-mode
event. Always create the webhook endpoint in the *same* environment as the API key you're
using, and check which one you're in (dashboard header shows "Sandbox" or a mode toggle)
before debugging "webhook never fires."

**Preview deployments may not build.** This project's `main` branch is wired as the
Vercel Production branch, so every push/redeploy to `main` reads **Production**-scoped
env vars, not Preview — a var added only under Preview silently reads as missing in every
`main` deployment. Pushing a new branch is supposed to trigger a separate Preview
deployment, but didn't during this build (never appeared in the Deployments list even
after several minutes) — worth checking Vercel project Git settings if preview builds are
needed again, rather than assuming they'll just appear.

**Phase 2 (not built)**: QR code in the confirmation email + a PIN-protected marshal
check-in page; an "email all entrants" broadcast function for pre-event instructions;
scheduled reminders; promo codes; waitlist.

---

## Architecture Decisions
- **Static data as fallback**: Code always falls back to `src/data/` files if sheets are empty or env vars missing — site never breaks without the sheet.
- **Programme text stays static**: Only sessions (day/time/location/cost) and events are sheet-driven. Programme descriptions, taglines, target audience are in `programmes.ts` (requires code edit to change).
- **Logo**: `mix-blend-mode: screen` makes black background transparent on dark header. `onError` handler shows text fallback "LIFT FLINTSHIRE / Community Interest Company".
- **Event dates**: Always constructed as `new Date(date + 'T00:00:00')` to avoid UTC off-by-one timezone bug.

---

## Bugs Fixed
- **Age columns**: Added `ageUnder18` column to sheet schema; renamed `ageUnder30` → `age18to30`. SheetRow interface and parseSheetRows updated accordingly.
- **Images not copying**: macOS Finder blocks dot-files; images copy commands must run in a separate Terminal tab (not in running Vite process).
- **Existing A record conflict**: Fasthosts had `199.34.228.188` — edited in place to `75.2.60.5` rather than deleting and re-adding.

---

## Deployment
- **Vercel** (confirmed 2026-07-11 via response headers; corrected from a stale Netlify
  description that lingered here after the move). `npm run build` → `dist/`, SPA rewrite
  in `vercel.json` (`/((?!api/).*) → /index.html`). `netlify.toml` is unused.
- **Env vars**: `VITE_GOOGLE_SHEET_ID`, `VITE_GOOGLE_API_KEY` set in both `.env.local` and
  the Vercel dashboard (Production + Preview). Server-only vars (`GOOGLE_SERVICE_ACCOUNT_KEY`,
  `PRIVATE_SHEET_ID`, `RESEND_API_KEY`, and the ticketing Stripe/`GOOGLE_*_PUBLIC` vars) are
  Vercel-dashboard only — never put these in a `VITE_`-prefixed var or they ship to the browser.
- **DNS** (checked 2026-09-06, Fasthosts): apex `@` → `216.198.79.1` (Vercel anycast IP);
  `www` → Vercel-assigned CNAME. If DNS ever needs re-pointing, get the current target from
  the Vercel dashboard's Domains page rather than reusing an old IP/CNAME here — it can
  change.
- **Push**: `git push` to `Numberonehsp/lift-flintshire-website` triggers auto-deploy on Vercel.

---

## Email — hello@liftflintshire.co.uk
Using **ImprovMX** (free forwarding to personal inbox). Status at end of session:
- MX records in Fasthosts: ✅ `mx1.improvmx.com` (10) + `mx2.improvmx.com` (20)
- SPF TXT record in Fasthosts: ✅ updated to `v=spf1 mx a include:spf.improvmx.com ~all`
- ImprovMX checker: still showing old SPF — **awaiting DNS propagation (~30 min)**
- Alias not yet created in ImprovMX (next step: Aliases tab → `hello` → forward to personal email)
- Footer still shows placeholder email — **update once alias confirmed working**

---

## Membership / Booking
- User uses **GymMaster** as membership software
- Plan: replace `stripeLink` → `bookingLink` column in Events sheet and code — **not yet done**
- GymMaster booking URLs get pasted into `bookingLink` column per event, no code change needed after rename

---

## Netlify Forms
Nine forms in total (6 original + 3 new):
- `contact` — general enquiry
- `referral` — GP/agency referral
- `register-couch-to-5k` — C25K participant registration + waiver
- `register-womens-run-club` — Women's Run Club registration + waiver
- `programme-questionnaire` — post-session feedback
- Plus any existing event registration forms

All three new forms are declared as static HTML in `index.html` (required for Netlify to detect them in the SPA build). In the Netlify dashboard, configure email notifications for `register-couch-to-5k` and `register-womens-run-club` so every registration triggers an email to the organiser.

## Registration & Questionnaire URLs
- `/register/couch-to-5k` — C25K sign-up
- `/register/womens-run-club` — Women's Run Club sign-up
- `/questionnaire` — Post-session feedback (share the link in follow-up emails after each session)

## Next Steps
- [ ] Wait for ImprovMX DNS propagation, then create `hello` alias in ImprovMX Aliases tab
- [ ] Update footer email from placeholder to `hello@liftflintshire.co.uk`
- [ ] Rename `stripeLink` → `bookingLink` in code (`src/data/events.ts`, `src/hooks/useContentSheets.ts`) and Events sheet
- [ ] Populate Google Sheet tabs: Summary, Events, Programme_Sessions, Registrations
- [ ] Add real GymMaster booking links to Events sheet
- [ ] Photos for Stay Strong, Weightlifting, C25K, and Women's Run Club (currently showing placeholder)
- [x] Set up C25K session schedule — update `sessions` in `programmes.ts` with real day/time/location
- [ ] Configure Netlify email notifications for the 3 new forms (Netlify dashboard → Forms → register-couch-to-5k → Notifications)
- [ ] (Optional) Set up Zapier to auto-populate Registrations Google Sheet from Netlify form submissions
- [ ] Send `/questionnaire` link to participants after each session as a follow-up email
- [ ] Videos — user has MP4s, decide where to use (hero? programme sections?)
- [ ] About page — real team names, roles, photos (currently placeholders)
- [ ] Register site with Google Search Console
- [ ] Regenerate Google API key (was briefly exposed in a Terminal screenshot earlier in the project)

---

## Session Notes — 2026-08-03
- Added `src/data/nextSessionDates.ts` as the single source of truth for the Women's Run Club next-session date and the Couch to 5K next-cohort-start date. `programmes.ts`, `RegisterWomensRunClub.tsx`, and `RegisterCouchTo5k.tsx` all read from it now — previously the Women's Run Club date was duplicated (and could drift) between `programmes.ts` and the register page.
- Fixed Stay Strong price: £15 → £16 per month.
- Added a new programme, **Youth Strength & Conditioning** (Thursdays 11:00–12:00, Number One HSP, Years 7–13, free) — `src/pages/RegisterYouthStrengthConditioning.tsx`, route `/register/youth-strength-conditioning`, entry in `programmes.ts`, sitemap entry. Duplicated from the Girls Gym Session template (parental consent/waiver flow) since participants are minors; the shared `api/submit-form.ts` handler needed no changes since it's keyed by field name, not form name.
- User confirmed they'll continue with hardcoded date constants (not the Google Sheet `Programme_Sessions` tab) for these one-off "next date" fields, since that sheet mechanism is better suited to genuinely fixed weekly schedules — see comment in `nextSessionDates.ts`.
- **`npm run lint` now passes clean** (was 68 errors). Two causes: (1) ESLint was crawling `.claude/worktrees/` and hitting ambiguous tsconfig roots — now in `globalIgnores`; (2) three `react-hooks/set-state-in-effect` violations in `useCountUp`/`useGoogleSheets`/`useContentSheets`, all the same pattern of an effect setting state synchronously on an early-return path. Fixed by deriving during render / lazy `useState` initialisers instead, which also removes a wasted render pass each. Behaviour verified unchanged by A/B testing against the pre-change hooks.
- Note: the worktree at `.claude/worktrees/magical-pascal-edcfef` is **not** stale — it holds commit `bb98f20` fixing the Contact-form-POSTs-to-`/` bug listed above, never merged to `main`. Left untouched.
- Gotcha for future browser verification: the Impact dashboard's stat tiles use `useCountUp`, which only animates via `IntersectionObserver`. Headless preview panes can report a 0×0 viewport, so the tiles read `0` there even when the data is correct — not a bug. Confirm the underlying value via React props rather than the rendered text.
- Added a **"Jump to a programme" snapshot nav** at the top of `/programmes-events` (`ProgrammeSnapshot` in `ProgrammesEvents.tsx`), rendered inside the existing dark hero so it needs no extra section band. One card per programme showing audience badge, title, a condensed cost chip, and a "Register online" tag where direct registration exists. Cards are plain `<a href="#id">` fragment links — each programme `<section>` now carries `scroll-mt-24` so headings clear the fixed header on jump. Adding a programme to `programmes.ts` automatically adds a card; no separate list to maintain.
- `shortCost()` condenses the verbose cost strings for those chips ("4 weeks Free, then £16 per month" → "Free to start", "£9 per session, or £25 per month" → "From £9"). If cost wording changes substantially, sanity-check that helper.
- Contact page's "Register for a programme" links were stale — only listed 2 of the 3 directly-registerable programmes. Added Youth Strength & Conditioning.
- **Merged `claude/magical-pascal-edcfef` (commit `bb98f20`)**, which had been sitting unmerged in `.claude/worktrees/`. It fixes the contact form (was POSTing to Netlify's legacy `/` endpoint and silently losing every message since the Vercel migration), strips all dead Netlify attributes and hidden build forms, and updates the privacy policy to the Vercel/Resend/Google stack. Merged cleanly — only `Contact.tsx` overlapped, in a different region.
- Follow-ups closed alongside the merge: added Youth Strength & Conditioning to the privacy policy's programme list and parent/guardian data paragraph (it collects children's special-category health data, so it must be listed), and removed the dead `data-netlify` attribute the Youth form inherited from the Girls Gym template. No Netlify references remain anywhere in `src/` or `index.html`.
- **Unverified by me:** the privacy policy now asserts Lift Flintshire CIC is exempt from the ICO data protection fee under the not-for-profit exemption. Ed confirmed this. Worth re-checking if processing ever broadens beyond membership/participation admin — the exemption is narrow and the site processes special-category health data for under-18s.
- `netlify.toml` is still in the repo but is now the only Netlify remnant; safe to delete whenever.

---

## Session Notes — 2026-08-25
- Fixed a Couch to 5K copy inconsistency: `programmes.ts` and `RegisterCouchTo5k.tsx` mixed "8 weeks" and "nine weeks" and gave the session time as 18:00 with no day. Standardised everywhere to **9 weeks, coached session every Wednesday at 17:30**, next cohort starting 9 September 2026 (already correct in `nextSessionDates.ts` — that date genuinely is a Wednesday).
- Added programme-specific **registrant confirmation emails** in `api/submit-form.ts`: `CONFIRMATION_TEMPLATES` is keyed by the `programme` form field, currently covering `couch-to-5k` (Template A) and `womens-run-club` (Template B). Each pulls its next-session info live from `nextSessionDates.ts` so it can't drift from the website copy. Sent via the same Resend client as the admin notification, to `guardian-email` ?? `email`, from `forms@liftflintshire.co.uk` (the address Resend already has verified — do not switch to `hello@` without adding a Resend sender/domain verification for it). Failure to send is non-fatal, same pattern as the Sheets write.
- To add a confirmation email for another programme, add a new entry to `CONFIRMATION_TEMPLATES` keyed by that programme's `id` — no other wiring needed.

---

## Session Notes — 2026-09-06 (impeccable audit remediation)

Ran `/impeccable audit` on the live site, then applied all 8 priority fixes. `npm run lint`, `npm run build`, `npm test` all pass. Verified in a local dev server (browser pane).

**Colour / contrast (P1)**
- Added two tokens in `tailwind.config.ts`: `field` (`#8F8B7B`, 3.4:1 on white — WCAG 1.4.11 boundary for form inputs) and `danger` (`#B23B2E`, 5.9:1 — error text).
- Dark-section kicker/eyebrow text was `text-teal` (`#376A6B`, 3.09:1 on `#111` — failed AA). Swapped to `text-teal-light` (`#5A9798`, 5.68:1) on every `SectionWrapper variant="dark"` hero across all pages, the Home hero `<h1>` "Communities" span, Header logo fallback + mobile-menu active link, Footer logo fallback + Instagram hover. Light-background `text-teal` left as-is (passes).
- `StatCard` (Home hero only) label `text-ink-light` → `text-white/75`; value → `text-teal-light`.
- `Footer` fine print `text-white/40` → `text-white/60`.
- `Card` programme-card scrim strengthened (`from-ink/95 via-ink/70 to-ink/20`), description `text-white/75` → `/90`, badge text → solid white.
- `ImpactDashboard` chart palettes de-duplicated (two near-identical teals removed): programme/area/gender/age series now use distinct hues (`#8A6BB0` plum replaces the second teal). Inline `#E2E0D8` tile borders → `border border-border bg-surface`.

**Accessibility (P2)**
- `RegistrationForm`: the two health radio groups are now `<fieldset>`/`<legend>`; unset-required-radio failures show an inline `role="alert"` message (was silent); step changes announce via a visually-hidden `role="status" aria-live="polite"` region that also receives focus; submit-error `<p>` got `role="alert"`; the `<pre>` waiver is now an intro `<p>` + `<ol>`; input borders use `border-field`; radio hit area enlarged (`py-1.5` labels, 18px controls).
- Skip link: `App.tsx` renders `<a href="#main" class="skip-link">`; `.skip-link` rule in `global.css` (off-screen until `:focus`); `<main id="main" tabIndex={-1}>`.
- `Header` mobile menu: `aria-controls`, `aria-hidden` when closed, links `tabIndex={-1}` when closed (were focusable while the overlay was visually hidden), Escape-to-close, focus moves to first link on open and back to the toggle on close.
- `ImpactDashboard` charts: each has a visually-hidden `<table>` equivalent (`ChartDataTable`) and the visual bars are `aria-hidden`.

**Motion (P2)**
- `global.css`: `@media (prefers-reduced-motion: reduce)` block (kills transitions/animations, `scroll-behavior: auto`).
- `useCountUp`: reads `prefers-reduced-motion` via a lazy `useState` initialiser and renders the final number immediately when set (no effect setState — keeps lint clean).
- Chart bars animated `width` (layout property) → `transform: scaleX()` on a full-width track; stacked-bar segments no longer transition.

**Copy (P3, typeset)**
- Removed em dashes from all user-facing copy (heroes, intros, `programmes.ts`, sidebars, chart subtitles, form success text). Register page `<h1>`s reworded to "Register for X". `<title>` / `ogTitle` brand separators `—` → `·`. Not touched: code comments; a couple of dense legal bullet lists in `Privacy.tsx` / `Safeguarding.tsx` where the dashes are parenthetical definitions (left deliberately — revisit if doing a legal-copy pass).

**Cleanup (P3)**
- `<html lang="en">` → `en-GB`.
- Removed unused `recharts` from `package.json` (imported nowhere; charts are hand-rolled). `package-lock.json` not regenerated — run `npm install` to reconcile.
- Removed the duplicated colour block from `global.css :root` (kept only `--color-ink` / `--color-bg`, which the bare `html{}` rule needs); palette single-sources from `tailwind.config.ts` now.

**Not done / deferred**
- Per-route `<meta name="description">` still only updates at runtime (Helmet); crawlers get the static `index.html` description. Needs prerender/SSR — out of scope.
- Header nav has an `Events` item; `/events` route exists on this branch (`Events.tsx` etc. still untracked).
