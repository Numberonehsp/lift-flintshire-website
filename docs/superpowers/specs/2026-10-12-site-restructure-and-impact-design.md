# Lift Flintshire website: restructure, polish and Impact upgrade

Date: 2026-10-12. Status: draft for Ed's review. No code changed yet.

Review method: Impeccable critique, single-context (live Home and Impact pages plus source). Score 21/32. The detector found no mechanical issues. Pages not reviewed in depth: About, Events, Contact, the registration forms.

## Decisions already made

- Scope: keep the brand (teal, black, Barlow Condensed and DM Sans, real photography). Restructure, new pages, polish. No new visual identity.
- Flintshire Run Club gets its own page, `/run-club`. Couch to 5K and Women's Track Running are sub-sections on it. Each keeps its own register button and `/register/*` form.
- Flintshire Weightlifting Club gets its own page, `/weightlifting-club`. Youth Strength & Conditioning is renamed **Youth Weightlifting** and lives on that page.
- Everything else goes under **Wellbeing Programmes** (`/wellbeing`): Stay Strong, Girls Gym Session.
- Andy's Man Club and School Outreach stay on the Impact page only.
- Impact page audience: funders.
- Old URL `/programmes-events` is dropped. No redirect.
- Nav must not crowd on phones.

## Facts supplied by Ed

- Youth Weightlifting: ages 11 to 17, free 6-week Beginners Weightlifting Programme, starts any time, every Wednesday 16:30 to 17:30. Sign-up (GymMaster): https://numberonehsp.gymmasteronline.com/portal/membership/48f5f57b19e1226c2ce14291532fb2b0. Enquiry also stays available online.
- Run Club online sign-up (GymMaster): https://numberonehsp.gymmasteronline.com/portal/membership/94e9c35ff22e96fdc904582c820e922c

## 1. Information architecture

| Route | Content |
|---|---|
| `/` | Home |
| `/run-club` | Run Club: sessions (Tue, Thu, Sun), Couch to 5K section, Women's Track Running section, join CTA |
| `/weightlifting-club` | Club: Mon/Wed/Fri sessions, British Weightlifting affiliation, Youth Weightlifting section |
| `/wellbeing` | Stay Strong, Girls Gym Session |
| `/events`, `/events/:id` | Unchanged |
| `/impact` | Redesigned (section 4) |
| `/about`, `/contact` | Light polish |

Removed: `/programmes-events`. Update the sitemap, the Seo paths, all internal links (Home cards, footer, form pages) and `public/sitemap.xml`.

Data: extend `src/data/programmes.ts` with a `group` field (`run-club` | `weightlifting-club` | `wellbeing`) and rename the `youth-strength-conditioning` entry. The page for each group renders from this data, so session times keep coming from the Programme_Sessions sheet through `useContentSheets`. Programme ids used by that sheet (`stay-strong`, `run-club`, `weightlifting`, `couch-to-5k`, `womens-run-club`) must not change. Renaming the youth id needs a matching sheet row check.

Routing: rename `/enquire/youth-strength-conditioning` to `/enquire/youth-weightlifting` and redirect the old one, because enquiry links may already be in circulation.

## 2. Navigation (mobile first)

Problem: the current nav has six items, and the new structure would make eight. The pill header also switches to a hamburger only below 768px, so tablets would overflow.

Plan:
- Desktop (1024px and up) pill: Run Club, Weightlifting, Wellbeing, Events, Impact, About, plus a **Contact** button. Home is the logo. That is six links plus one button.
- Hamburger below 1024px, not 768px.
- Mobile overlay: five large links (Run Club, Weightlifting, Wellbeing, Events, Impact), then a smaller row (About, Contact, Safeguarding). A visible Instagram link at the bottom.
- Keep the existing focus management, Escape handling and body scroll lock.
- Sticky bottom "Join a session" bar on `/run-club` and `/weightlifting-club` on phones, linking to the GymMaster sign-up, so the main action stays in thumb reach.
- Test at 320, 375, 768 and 1024 widths.

## 3. Home page

- Replace the castle hero background with a people-first photo (a group at Run Club). The current one hides the people.
- Two entry cards directly under the hero: **Run Club** and **Weightlifting Club**, then a third smaller "Wellbeing programmes" link. Replaces the 7-card preview.
- Fix the stats mismatch. Hero says 540+ people, 3 active programmes, 8 projects. Impact says about 680 attendances and 7 programmes. Pick one source, define "people" versus "attendances", and use the same number in both places.
- Cut the four-card "aims" block to one short line plus link to About, or move it to About. Four equal text cards dilute the page.
- Add one testimonial or quote (needs Ed's input; do not invent).
- Reduce wave dividers to one or two. They add noise on a page that is already colour-blocked.
- Add an email sign-up or WhatsApp group link beside Instagram.

## 4. Impact page (funder-focused)

Keep: the live Google Sheets feed, the accessible data tables behind each chart, the colour-plus-label rule.

Change:
1. **Lead with three headline numbers**, not eight tiles: people reached, sessions delivered, programmes running. Move new vs returning, female %, and active this month into a secondary row.
2. **Define terms on the page.** Say whether "participants" means unique people or attendances. The page currently mixes both ("People supported" labelled "participant attendances").
3. **Partial-month handling.** September 2026 has 20 against 196 in July and reads as a collapse. Mark the current or incomplete month (hatched bar and "month in progress" label) and make sure it is not read as a decline.
4. **Fix the count-up for no-JS and screen readers.** The tiles render 0 until scrolled into view. Render the final value in the DOM and animate visually only, and respect `prefers-reduced-motion`.
5. **Add a "Who we reach" band.** Age and gender are currently two plain bar groups at the bottom. Move them above the time charts for funders, and say in words what they show (for example 62% female, 23% under 18).
6. **Simplify charts.** Two stacked bar charts with similar shapes (Impact Areas, Monthly Growth) overlap. Keep one by default, put the by-programme breakdown behind a "See by programme" toggle. Make programme colours more distinct and label bars directly.
7. **Add a downloadable funder summary** (one-page PDF built from the same figures). Needs Ed's decision on how it is produced (see open questions).
8. **Add an outcomes and stories slot** (quote, case study, wellbeing result) and a short "How we collect this data" note. Funders value method as much as totals.
9. **Last updated and data source** line stays, but move it to the top beside the title.

## 5. Visual polish across the site

- Programme-type pages share one template: hero with photo, "who it's for", "what to expect", sessions table, one primary CTA. Fewer long paragraphs; use accordions for detail.
- Replace the 4-column jump grid (3 cards in the last row, competing pills) with the Home entry cards.
- Cost wording: "Free, then £30 annually" (Run Club) is unclear. Rewrite, for example "Free to try. £30 a year to keep running with us." Ed to confirm the exact terms.
- Footer: add Facebook if it exists, safeguarding and privacy links grouped, charity-style CIC number line.
- Fix README tech stack (React 19, Router 7, Tailwind 3).
- Image optimisation: serve resized WebP with `srcset`; photos in `public/images` are full size.

## 6. Verification

- `npm run lint`, `npm run test`, `npm run build`.
- Browser check at 320, 375, 768, 1024 and 1440 widths, light and dark OS setting where relevant.
- Keyboard-only pass through the nav and the new pages.
- Run the Impeccable detector once on the changed files before finishing.
- Update `HANDOFF.md` and the SOP in `docs/SOP-editing-website-content.md` for new routes.

## Order of work

1. Data model and routes (new pages scaffolded from existing content, no styling changes).
2. Nav and mobile menu.
3. Run Club and Weightlifting Club pages (including GymMaster links).
4. Wellbeing page.
5. Home.
6. Impact.
7. Polish pass and verification.

## Answers from Ed (approved 2026-10-12)

1. Run Club GymMaster link covers the main club only (Tue/Thu/Sun). Couch to 5K and Women's Track Running keep their own `/register/*` forms.
2. Weightlifting Club CTA is a consultation booking: https://numberonehsp.gymmasteronline.com/portal/book/service?serviceid=698033 (replaces "Register your interest" and the Contact link).
3. Home hero stats are computed from the same feed as the Impact page (`useGoogleSheets`), not the static Summary tab. They can rotate through key figures or show headline data for the current period. Define "people" versus "attendances" once and reuse it. The Summary tab fallback stays only for when the feed fails.
4. Funder summary PDF is generated on request (not a static file).
5. Testimonials: use clearly marked placeholders for now. Ed will supply real quotes with permission. Placeholders must not ship to production as if real.
6. Mailing list: see recommendation below.

## Mailing list recommendation

A Google Sheet stores addresses but cannot send, handle unsubscribes, or record consent, which UK GDPR and PECR need for marketing email. Recommend a proper email tool (Brevo, named in the original project brief, or Resend Audiences since Resend is already used for confirmation emails) with a sign-up form on the site. Keep the Sheet write as a backup only, and write it to the private sheet (`PRIVATE_SHEET_ID`), never the public one. Record consent text and timestamp with each sign-up. Decision between Brevo and Resend is made during implementation planning.
