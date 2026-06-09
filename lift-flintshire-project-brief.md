# Lift Flintshire CIC — Website Project Brief

## Organisation Overview

**Name:** Lift Flintshire CIC  
**Type:** Community Interest Company (not-for-profit)  
**Location:** Flintshire, North Wales  
**Mission:** Delivering strength, fitness, and wellbeing support to the local community  
**Current web presence:** https://www.numberonehsp.com/lift-flintshire-cic (to be replaced)

---

## Project Goal

Build a new standalone website for Lift Flintshire CIC that:
- Clearly communicates who we are and what we offer to community members, funders, and volunteers
- Showcases our programmes and clubs
- Displays live impact data (participant numbers, demographics) for funders
- Handles event registrations and automates follow-up emails
- Is completely free or low-cost to run
- Is fully optimised for mobile phones (mobile-first design)

---

## Target Audiences

1. **Local community members** — discovering and joining programmes and events
2. **Funders & grant bodies** — assessing the organisation's reach and impact
3. **Volunteers & staff** — finding out how to get involved

---

## Design Direction

- **Reference site:** [AnyVan.com](https://www.anyvan.com) — use as a structural/layout reference
- **Tone:** Warm, friendly, and inclusive — welcoming to people who may feel nervous about fitness, while remaining credible and professional for funders
- **Mobile-first:** Every component designed for 375px (iPhone SE) upwards
- **Brand assets available:** Logo (digital file), real photography of the service

---

## Pages & Content

### 1. Home
- Hero section with strong headline and primary CTA ("Explore our programmes" / "Get involved")
- Mission statement / who we are in brief
- Live impact stats bar (pulls from Google Sheets — see Data section)
- Featured programmes section (Stay Strong, Run Club, Weightlifting Club)
- Upcoming events preview
- Social media links / feed integration

### 2. About Us
- Organisation story and values
- CIC status explained (what it means for the community)
- Team and volunteers section
- Partners and funders acknowledgement section

### 3. Programmes & Clubs
Individual sections (or sub-pages) for each programme:

- **Stay Strong** — Strength training programme designed for people over 60. Focus on safety, mobility, and building confidence.
- **Flintshire Run Club** — Community running club open to all abilities. Inclusive, social, and supportive.
- **Flintshire Weightlifting Club** — Structured weightlifting club for those interested in the sport.

Each programme section should include:
- Description and who it's for
- Session schedule (placeholder if not yet confirmed)
- How to join / enquiry CTA (links to contact form or registration landing page)

### 4. Events
- List of upcoming events with date, description, and location
- Each event links to a **registration landing page** (built in Brevo or as a page on the site)
- Registration collects: name, email, phone, age group, gender (for impact data)
- Free events: registration only
- Paid events: registration triggers an automated email with a **Stripe payment link**

### 5. Impact Dashboard
- Live statistics pulled automatically from a Google Sheet updated by staff/volunteers
- Key metrics to display:
  - Total participants helped (all time)
  - Active participants (current month/quarter)
  - Sessions run (total and by programme)
  - Age breakdown (chart)
  - Gender breakdown (chart)
  - Specific session types (e.g. women-only running sessions)
- Designed to be compelling and credible for funders viewing the site
- Data updated by staff via a shared Google Sheet — no coding required

### 6. Contact & Referral
- **General enquiry form** — name, email, message
- **GP / agency referral form** — referrer name, organisation, client details, reason for referral, consent checkbox
- Both forms handled via Netlify Forms
- On submission: automated confirmation email to submitter + notification to Lift Flintshire team (via Brevo)

---

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend framework | React + Tailwind CSS | Free |
| Build tool | Vite | Free |
| Hosting & CI/CD | Netlify (free tier) | Free |
| Form handling | Netlify Forms | Free (100 submissions/month) |
| Email automation & CRM | Brevo (formerly Sendinblue) | Free (300 emails/day) |
| Impact data CMS | Google Sheets + public Sheets API | Free |
| Event registration | Brevo landing pages or on-site forms | Free |
| Payment links (paid events) | Stripe Payment Links | Free to create; 1.5% + 20p per UK transaction |
| Version control | GitHub | Free |

**No merchandise shop required** — handled on a separate existing site.

---

## Integrations & Automations

### Brevo Email Automations (set up once, run forever)

| Trigger | Automated action |
|---|---|
| Contact form submitted | Confirmation email to visitor + team notification |
| Programme enquiry | Welcome email tailored to that programme + added to programme mailing list |
| Event registration (free) | Confirmation email with event details + reminder 24hrs before |
| Event registration (paid) | Confirmation email with Stripe payment link |
| Stripe payment received | "Payment confirmed" email (via Stripe webhook to Brevo) |
| Newsletter signup | 2–3 email welcome sequence introducing Lift Flintshire |

### Google Sheets → Impact Dashboard
- Staff update a shared Google Sheet after each session
- Sheet columns: Date, Programme, Session Type, Number of Participants, Age Group breakdown, Gender breakdown
- Website reads the sheet via the Google Sheets public API (no auth required if sheet is published)
- Dashboard updates automatically whenever the page loads

---

## Accounts to Create (Before Building)

All free to sign up:

1. **GitHub** — github.com (version control + Netlify deployment source)
2. **Netlify** — netlify.com (hosting + forms)
3. **Brevo** — brevo.com (email automation, landing pages, CRM)
4. **Stripe** — stripe.com (payment links for paid events — only needed when running paid events)
5. **Google account** — for Google Sheets impact data (likely already have one)

---

## Mobile-First Requirements

- Navigation: hamburger menu on mobile, horizontal nav on desktop
- All hero sections stack vertically on small screens
- Impact stats display as large, scrollable cards on mobile
- Forms: large tap targets, full-width inputs
- Images: lazy-loaded, responsive srcset
- Typography: minimum 16px body text on mobile
- Tested at 375px (iPhone SE) as minimum viewport
- No horizontal scrolling at any screen size

---

## SEO Requirements

- Semantic HTML throughout (h1, h2, nav, main, article, section, footer)
- Meta title and description for every page
- Open Graph tags for social sharing
- Alt text on all images
- Fast load time — target under 3 seconds on mobile (Lighthouse score 90+)
- sitemap.xml and robots.txt

---

## Build Order (Recommended)

1. Scaffold Vite + React + Tailwind project, push to GitHub, connect to Netlify
2. Build shared components: Header (mobile nav), Footer, Button, Card
3. Home page — hero, stats bar (static placeholder first), programmes preview, events preview
4. Programmes & Clubs page — Stay Strong, Run Club, Weightlifting Club
5. Impact Dashboard — Google Sheets API integration, charts (use Recharts or Chart.js)
6. Events page — event cards, registration form / Brevo landing page embed
7. Contact & Referral page — Netlify Forms, Brevo webhook
8. About Us page
9. Brevo automation setup (email sequences and triggers)
10. SEO: meta tags, Open Graph, sitemap
11. Performance and mobile QA — Lighthouse audit, fix issues
12. Go live — custom domain on Netlify

---

## Assets To Provide During Build

- [ ] Logo file (SVG preferred, PNG acceptable)
- [ ] Brand colours (hex codes — or confirm happy for designer to suggest based on logo)
- [ ] Any existing photography
- [ ] Programme descriptions / copy (or confirm happy for placeholder copy to be used initially)
- [ ] Google Sheet template (will be created during build)
- [ ] Team bios / photos (optional)

---

## Reference Links

- Current site: https://www.numberonehsp.com/lift-flintshire-cic
- Design reference: https://www.anyvan.com
- Brevo: https://brevo.com
- Netlify: https://netlify.com
- Stripe Payment Links: https://stripe.com/gb/payments/payment-links
