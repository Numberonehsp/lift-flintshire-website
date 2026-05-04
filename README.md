# Lift Flintshire CIC Website

Community Interest Company website built with Vite + React + TypeScript + Tailwind CSS. Hosted on Netlify.

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_GOOGLE_SHEET_ID` | Google Sheet ID (from the sheet URL) |
| `VITE_GOOGLE_API_KEY` | Google Cloud API key with Sheets API enabled |

Without these variables the site uses built-in sample data on the Impact Dashboard.

## Deploying to Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project** → select the repo.
3. Build command: `npm run build` · Publish directory: `dist`
4. Add `VITE_GOOGLE_SHEET_ID` and `VITE_GOOGLE_API_KEY` under **Site configuration → Environment variables**.
5. Deploy. Netlify Forms activates automatically on first deploy.

## Setting Up the Google Sheet

1. Create a new Google Sheet.
2. Name the first tab `Sheet1`.
3. Set up columns in row 1 exactly as:
   `Date | Programme | Session Type | Total Participants | Age_Under30 | Age_30to60 | Age_Over60 | Gender_Male | Gender_Female | Gender_Other`
4. Share the sheet: **File → Share → Anyone with the link → Viewer**.
5. Copy the Sheet ID from the URL (`/spreadsheets/d/SHEET_ID/edit`) and add to `.env.local`.
6. Create a Google Cloud API key at [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create API key. Enable the **Google Sheets API**.

## Adding Photography

Replace `ImagePlaceholder` components with `<img>` tags once photography is available:

```tsx
// Before
<ImagePlaceholder aspectRatio="4/3" />

// After
<img
  src="/images/stay-strong-session.jpg"
  alt="Stay Strong session at Mold Leisure Centre"
  loading="lazy"
  className="w-full aspect-[4/3] object-cover rounded-card"
/>
```

Place image files in `public/images/`.

## Connecting Brevo Webhooks

To send confirmation emails from the contact and referral forms:

1. Create a Netlify Function at `netlify/functions/brevo-contact.ts`.
2. POST to the Brevo transactional email API with the form data.
3. Add `BREVO_API_KEY` to Netlify environment variables.

## Creating Stripe Payment Links for Events

1. In Stripe Dashboard: **Payment Links → Create**.
2. Add the event as a one-off product with the correct price.
3. Copy the payment link URL.
4. Update `src/data/events.ts` — set `stripeLink` on the relevant event.

## Adding Logo Files

Place your logo PNG files in `src/assets/`:
- `logo-white.png` — white version for dark backgrounds (Header, Footer)
- `logo-dark.png` — dark version for light backgrounds

Then update `src/components/layout/Header.tsx` and `src/components/layout/Footer.tsx` to use `<img src={logoWhite} />` instead of the text fallback.

## Tech Stack

- [Vite](https://vitejs.dev) + [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v3](https://tailwindcss.com) — design tokens in `tailwind.config.ts`
- [React Router v6](https://reactrouter.com) — client-side routing
- [Recharts](https://recharts.org) — Impact Dashboard charts
- [react-helmet-async](https://github.com/staylor/react-helmet-async) — per-page SEO meta tags
- [Netlify Forms](https://www.netlify.com/products/forms/) — contact and referral form handling
