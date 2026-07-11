# Lift Flintshire CIC — Project Handoff

## Project
Website for Lift Flintshire CIC, a not-for-profit community fitness organisation in Flintshire, North Wales. Live at **liftflintshire.co.uk**, deployed on **Vercel** (confirmed via response headers 2026-07-11 — `server: Vercel` on apex and www), auto-deploys from GitHub (`Numberonehsp/lift-flintshire-website`). `netlify.toml` is a leftover from the earlier Netlify deployment and is unused; `vercel.json` holds the SPA rewrite (everything except `/api/*` → `index.html`).

---

## Tech Stack
- Vite + React 18 + TypeScript (strict, `verbatimModuleSyntax` — always use `import type` for type-only imports)
- Tailwind CSS v3 with custom tokens: `teal` #376A6B, `ink` #111111, `bg` #FAFAF8
- React Router v6 + ScrollToTop on route change
- Forms submit to `/api/submit-form` (Vercel serverless function: Resend email + Google Sheets append). The `data-netlify` attributes still in the JSX are dead leftovers from the Netlify era. **Known issue:** `src/pages/Contact.tsx` still POSTs to `/` (old Netlify Forms style) and is silently broken on Vercel — needs repointing at `/api/submit-form`.
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

## Google Sheets CMS
Four tabs to create in the existing Google Sheet:

**Summary** — drives hero stats on homepage
| Value | Label |
|-------|-------|
| 1,200+ | Participants supported |
| ... | ... |

**Events** — columns: `id | title | date (YYYY-MM-DD) | time | location | price | description | programme | bookingLink`

**Programme_Sessions** — columns: `programme_id | day | time | location | cost`
- One row per session day (e.g. Stay Strong Tuesday and Thursday = 2 rows both with `stay-strong`)
- Valid programme_ids: `stay-strong`, `run-club`, `weightlifting`, `couch-to-5k`, `womens-run-club`

**Registrations** — columns: `programme_id | programme_label | count`
- Used by the Impact Dashboard to show registration totals per programme
- Populated manually from Netlify Forms CSV export, or automatically via Zapier (see below)
- Example row: `couch-to-5k | Couch to 5K | 1` (one row per registration OR one summary row with count)
- Valid programme_ids: `couch-to-5k`, `womens-run-club`

### Automating Registrations → Google Sheet (optional)
To auto-populate the Registrations tab when someone submits a form:
1. Create a free [Zapier](https://zapier.com) account
2. Trigger: **Netlify › New Form Submission** (select `register-couch-to-5k` or `register-womens-run-club`)
3. Action: **Google Sheets › Create Spreadsheet Row** → point to the Registrations tab
4. Map fields: programme_id, name, email, date, etc.
5. Repeat for the second form

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
- **Netlify**: `npm run build` → `dist/`, SPA redirect `/* → /index.html 200` in `netlify.toml`
- **Env vars**: `VITE_GOOGLE_SHEET_ID` and `VITE_GOOGLE_API_KEY` set in both `.env.local` and Netlify dashboard
- **DNS** (Fasthosts): A record `@` → `75.2.60.5`, CNAME `www` → `incandescent-tartufo-734037.netlify.app`
- **Push**: `git push` to `Numberonehsp/lift-flintshire-website` triggers auto-deploy

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
- [ ] Set up C25K session schedule — update `sessions` in `programmes.ts` with real day/time/location
- [ ] Configure Netlify email notifications for the 3 new forms (Netlify dashboard → Forms → register-couch-to-5k → Notifications)
- [ ] (Optional) Set up Zapier to auto-populate Registrations Google Sheet from Netlify form submissions
- [ ] Send `/questionnaire` link to participants after each session as a follow-up email
- [ ] Videos — user has MP4s, decide where to use (hero? programme sections?)
- [ ] About page — real team names, roles, photos (currently placeholders)
- [ ] Register site with Google Search Console
- [ ] Regenerate Google API key (was briefly exposed in a Terminal screenshot earlier in the project)
