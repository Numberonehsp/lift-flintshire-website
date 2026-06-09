# Claude Code Opening Prompt — Lift Flintshire CIC Website

Copy and paste everything between the lines below into Claude Code in VS Code to begin the build.

---

## PROMPT (copy from here)

I want to build a complete website for **Lift Flintshire CIC**, a not-for-profit community interest company in Flintshire, North Wales that delivers strength, fitness, and wellbeing support to the local community.

Please read the full project brief in `lift-flintshire-project-brief.md` before starting. Here is a summary of everything you need to know:

---

### Project Summary

**Organisation:** Lift Flintshire CIC — community strength, fitness, and wellbeing CIC  
**Goal:** Replace an outdated page on another site with a professional standalone website  
**Design reference:** AnyVan.com — use its layout confidence, structure, and professionalism as inspiration  
**Tone:** Warm, friendly, inclusive — welcoming to community members, credible to funders  
**Critical requirement:** Fully mobile-first. Every component must be designed for 375px (iPhone SE) upwards. No exceptions.

---

### Tech Stack

- **Vite + React + Tailwind CSS** (single-page app with React Router for multi-page navigation)
- **Netlify** for hosting and form handling (Netlify Forms)
- **Google Sheets public API** for the live impact data dashboard
- **Brevo** for email automation (forms will POST to Netlify and trigger Brevo via webhook — set up webhook endpoint placeholders)
- **Recharts** for the impact dashboard charts
- No backend, no database — everything is static + API calls

---

### Pages to Build

1. **Home** — Hero, mission statement, live impact stats bar, featured programmes (Stay Strong, Run Club, Weightlifting Club), upcoming events preview, social media links
2. **About Us** — Organisation story, values, CIC explanation, team section, partners section
3. **Programmes & Clubs** — Sections for Stay Strong (60+ strength training), Flintshire Run Club (all abilities), Flintshire Weightlifting Club
4. **Events** — Event cards with registration forms; free events register only, paid events trigger email with Stripe payment link
5. **Impact Dashboard** — Live data from Google Sheets: total participants, sessions, age/gender breakdowns displayed as charts and stat cards
6. **Contact & Referral** — General enquiry form + GP/agency referral form, both via Netlify Forms

---

### Shared Components to Build

- **Header** with mobile hamburger menu and smooth desktop nav
- **Footer** with links, social media icons, and CIC registration info
- **Button** component (primary, secondary, outline variants)
- **Card** component (for programmes, events, team members)
- **StatCard** component (for impact dashboard numbers)
- **SectionWrapper** (consistent padding and max-width across all pages)

---

### Design System

Please create a Tailwind config with these design tokens (suggest appropriate values if brand colours are not yet confirmed — use a strong, energetic but warm palette appropriate for a community fitness CIC):

- Primary colour (main brand — suggest a strong, confident colour)
- Secondary colour (accent)
- Neutral greys for text and backgrounds
- Font: Use Inter from Google Fonts (clean, professional, highly readable on mobile)
- Border radius: slightly rounded (8px–12px) for a friendly feel
- Spacing scale: generous padding on mobile, slightly tighter on desktop

---

### Mobile-First Rules (strictly enforced throughout)

- All layouts use Tailwind's mobile-first breakpoints (sm:, md:, lg:)
- Navigation: hamburger on mobile, horizontal on md: and above
- All font sizes minimum 16px on body text
- Tap targets minimum 44px height
- No horizontal overflow at any breakpoint
- Images use lazy loading and are responsive
- Test every component at 375px, 768px, and 1280px

---

### Impact Dashboard — Google Sheets Integration

- Create a placeholder Google Sheets integration using the public Sheets API
- The sheet URL and sheet ID should be stored in a `.env` file as `VITE_GOOGLE_SHEET_ID`
- Expected columns in the sheet: Date, Programme, Session Type, Total Participants, Age_Under30, Age_30to60, Age_Over60, Gender_Male, Gender_Female, Gender_Other
- The dashboard should aggregate this data and display:
  - Total participants all time (large stat card)
  - Total sessions run (large stat card)
  - Active participants this month (large stat card)
  - Bar chart: participants by programme
  - Pie/donut chart: gender breakdown
  - Bar chart: age breakdown
- Show a loading state and a graceful error state if the sheet is unavailable

---

### Forms — Netlify Forms Setup

All forms must have `data-netlify="true"` and a hidden `form-name` field for Netlify to capture submissions.

**Contact form fields:** Name, Email, Phone (optional), Message, Subject (dropdown: General Enquiry / Volunteering / Partnership / Media)

**Referral form fields:** Referrer Name, Referrer Organisation, Referrer Email, Referrer Phone, Client First Name, Client Age Group (dropdown), Reason for Referral (textarea), Programme of Interest (dropdown: Stay Strong / Run Club / Weightlifting Club / Not Sure), Consent checkbox (client has consented to referral)

---

### Build Steps — Please Follow This Order

1. Scaffold the Vite + React + Tailwind project. Install dependencies: react-router-dom, recharts. Configure Tailwind with the custom design system. Create a `.env.example` file.
2. Build all shared components (Header with mobile nav, Footer, Button, Card, StatCard, SectionWrapper).
3. Build the Home page — complete with all sections using placeholder content and placeholder stats.
4. Build the Programmes & Clubs page.
5. Build the Impact Dashboard with the Google Sheets integration (use placeholder/mock data initially, structured exactly as the real sheet would be).
6. Build the Events page with a sample event and registration form.
7. Build the Contact & Referral page with both forms.
8. Build the About Us page.
9. Add React Router navigation linking all pages. Ensure smooth scroll-to-top on route change.
10. Add SEO: react-helmet-async, meta titles/descriptions for every page, Open Graph tags.
11. Create a `netlify.toml` config file for deployment.
12. Run a final check: no console errors, no horizontal overflow on mobile, all links working, Lighthouse mobile score target 90+.

---

### Content Notes

Use realistic, warm placeholder copy throughout — do not use "Lorem ipsum". Write copy that sounds like it genuinely belongs to a community fitness CIC in North Wales. Use phrases like "Building stronger communities, one session at a time" as inspiration. The tone should feel encouraging, human, and local.

---

### Deliverables

When complete I should have:
- A fully working local development environment (`npm run dev` starts the site)
- All pages built and navigable
- Mobile-responsive at all breakpoints
- Google Sheets integration ready (just needs real Sheet ID in .env)
- Netlify Forms ready (just needs deploying to Netlify to activate)
- A `README.md` explaining: how to run locally, how to deploy to Netlify, how to set up the Google Sheet, how to connect Brevo webhooks, how to create Stripe payment links for events

Please start with **Step 1** — scaffold the project and confirm the structure before moving to the components.

---

## END OF PROMPT

---

## Tips for Using Claude Code in VS Code

1. **Open VS Code** in an empty project folder (e.g. `lift-flintshire-website`)
2. **Open the Claude Code panel** (sidebar or Cmd+Shift+P → "Claude Code")
3. **Paste the prompt above** and send it
4. After Step 1 completes, run `npm run dev` in the VS Code terminal to see the site in your browser
5. Let Claude Code complete each step before moving to the next — if it asks a question, answer it before proceeding
6. **Upload your logo** when prompted or when it reaches the Header component step
7. Once the build is complete, follow the README it generates to deploy to Netlify

## After the Build — Setup Checklist

- [ ] Create GitHub repo and push the code
- [ ] Connect GitHub repo to Netlify
- [ ] Create Google Sheet with the correct column headers (Date, Programme, Session Type, Total Participants, Age_Under30, Age_30to60, Age_Over60, Gender_Male, Gender_Female, Gender_Other)
- [ ] Publish the Google Sheet (File → Share → Publish to web) and add the Sheet ID to Netlify environment variables
- [ ] Create Brevo account and set up automation workflows
- [ ] Add Brevo webhook URL to Netlify environment variables
- [ ] Set up Stripe account and create payment link template for paid events
- [ ] Point custom domain to Netlify
