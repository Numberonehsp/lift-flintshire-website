# SOP: Making small content changes to liftflintshire.co.uk

**Who this is for:** Ed (or anyone at Lift Flintshire CIC) changing words on the website, such as a session time, a description or a contact line. No coding skills needed.

**Time:** about 5 minutes per change. The live site updates 1–2 minutes after you save.

**Safety net:** Every change is saved in GitHub's history. Anything you get wrong can be undone (see section 6). You cannot permanently break the site by editing text, as long as you follow the "Do not touch" rule below.

---

## 1. Pick the right method first

| What you want to change | Method | Needs GitHub? |
|---|---|---|
| Session day / time / location / cost for a programme | **Method A: Google Sheet** (`Programme_Sessions` tab) | No |
| Events listing (title, date, price, booking link) | **Method A: Google Sheet** (`Events` tab) | No |
| Programme descriptions, "Who is it for?", "What to expect", badges | **Method B: GitHub** → `src/data/programmes.ts` | Yes |
| Next Women's Run Club date or next Couch to 5K cohort date | **Method B: GitHub** → `src/data/nextSessionDates.ts` **and** `api/submit-form.ts` (both) | Yes |
| Home page, About page, Contact page, Privacy page wording | **Method B: GitHub** → the file listed in section 5 | Yes |
| Photos | Ask Claude Code (images need to be added to the project) | n/a |

**Check the Google Sheet first for anything about session times.** If a row exists there for a programme, it overrides what is written in the code (see section 7, "Gotchas").

---

## 2. Method A: change sessions or events in the Google Sheet

1. Open the Lift Flintshire content Google Sheet (the one whose ID is in `VITE_GOOGLE_SHEET_ID`, see Vercel → Project → Settings → Environment Variables if you have lost the link).
2. Open the tab you need:
   - `Programme_Sessions`: columns are `programme id | day | time | location | cost`. Programme ids are `couch-to-5k`, `womens-run-club`, `girls-gym-session`, `youth-weightlifting`, `stay-strong`, `run-club`, `weightlifting`.
   - `Events`: columns are `id | title | date (YYYY-MM-DD) | time | location | price | description | programme | bookingLink`.
3. Edit the cell. Keep the first row (headers) exactly as it is. Do not rename tabs.
4. Reload the website. Changes appear straight away, with no deploy step. If it does not change, hard refresh (Cmd+Shift+R).

To remove a programme's override, delete its row and the site falls back to the wording in `programmes.ts`.

> **Never put personal data in this sheet.** It is public by design. Registrations and feedback go to a separate private sheet.

---

## 3. Method B: edit text in GitHub (no software to install)

Repository: https://github.com/Numberonehsp/lift-flintshire-website

1. Sign in to GitHub with the account that has access to the repository.
2. Click through to the file you want (see section 5 for which file). Example: `src` → `data` → `programmes.ts`.
3. Click the **pencil icon** ("Edit this file") at the top right of the file.
4. Press **Cmd+F** to search the page for the text you want to change. Use a distinctive phrase.
5. Edit **only the words**. Follow the "Do not touch" rule below.
6. Click **Commit changes…** (green button, top right). In the box:
   - Message: describe the change in plain words, e.g. `Update Stay Strong description`.
   - Leave **Commit directly to the main branch** selected.
7. Click **Commit changes**.
8. Wait 1–2 minutes. Vercel rebuilds and publishes automatically.
9. Check the live page (hard refresh with Cmd+Shift+R). See section 4 for the check.

### Do not touch

Text sits inside code. Change the words, never the punctuation around them.

- Keep the quote marks (`'` `"` or the backtick `` ` ``) at the start and end of each piece of text.
- Keep the commas at the end of lines.
- Keep `{ }`, `[ ]`, `< >` and anything inside them that looks like code (`className=...`, `href=...`).
- If your text contains an apostrophe inside `'single quotes'`, put a backslash before it: `women\'s`. Or leave the apostrophe out and ask Claude Code to fix it.
- In page files (`.tsx`), write `&amp;` instead of `&`. In `programmes.ts` you can write `&` normally.
- Do not rename files, delete lines you are unsure about, or edit anything in `api/` except as listed in section 5.

### Example: change the Stay Strong description

Before, in `src/data/programmes.ts`:

```
description:
  'Our Stay Strong sessions are for adults aged 55 and over...',
```

Change the words between the quote marks only:

```
description:
  'Our new wording goes here...',
```

---

## 4. Check your change before you walk away

1. Wait for the deploy: in Vercel, the latest deployment shows **Ready** (about 1–2 minutes).
2. Open the page on liftflintshire.co.uk and hard refresh (Cmd+Shift+R).
3. Confirm the new text shows and the page still looks normal.
4. If the page is blank or shows an error, undo it straight away (section 6).

If you want to see a change before it goes live, choose **Create a new branch** instead of committing to main in step 6 of Method B. Vercel will build a preview link, but this needs a pull request to publish, so ask Claude Code for help the first time.

---

## 5. Which file holds which text

| Text | File |
|---|---|
| Programme titles, taglines, badges, descriptions, "Who is it for?", "What to expect", default session lines | `src/data/programmes.ts` |
| Run Club page (intro, Couch to 5K and Women's Track Running sections), page title/SEO | `src/pages/RunClub.tsx` |
| Weightlifting Club page (includes Youth Weightlifting enquiry link), page title/SEO | `src/pages/WeightliftingClub.tsx` |
| Wellbeing page (Stay Strong, Girls Gym Session), page title/SEO | `src/pages/Wellbeing.tsx` |
| The three GymMaster links (Run Club join, Youth Beginners join, Weightlifting consultation booking) | `src/data/links.ts` (edit the URL string only; every page and button that uses it updates) |
| Menu items and footer links | `src/data/navigation.ts` (shared by header and footer) |
| Events listing page | `src/pages/Events.tsx` |
| Home page | `src/pages/Home.tsx` |
| About page | `src/pages/About.tsx` |
| Contact page, subject dropdown, "Register for a programme" box | `src/pages/Contact.tsx` |
| Youth Weightlifting enquiry form wording (route `/enquire/youth-weightlifting`) | `src/pages/EnquireYouthStrengthConditioning.tsx` |
| Girls Gym Session registration form | `src/pages/RegisterGirlsGymSession.tsx` |
| Couch to 5K / Women's Run Club registration pages | `src/pages/RegisterCouchTo5k.tsx`, `src/pages/RegisterWomensRunClub.tsx` |
| Privacy policy | `src/pages/Privacy.tsx` |
| Safeguarding page | `src/pages/Safeguarding.tsx` |
| Footer (all pages) | `src/components/layout/Footer.tsx` |
| Next Women's Run Club date, next Couch to 5K start | `src/data/nextSessionDates.ts` **and** the same two dates near the top of `api/submit-form.ts` (change both, they must match) |
| Confirmation emails sent to people who register | `api/submit-form.ts` (search for `CONFIRMATION_TEMPLATES`) |

Privacy and safeguarding wording has legal weight. Check with the board before changing it.

---

## 6. Undo a mistake

1. Go to the repository on GitHub → click **Commits** (clock icon, near the top of the file list).
2. Find your change, click the `<>` icon next to it to view that version, or open the commit and click **…** → **Revert**. GitHub creates a new commit that reverses yours.
3. Click **Create a new pull request**, then **Merge**. Or ask Claude Code: "Revert the last commit on main."
4. Wait 1–2 minutes for Vercel to redeploy.

Alternative: in Vercel → Deployments, find the last good deployment, click **…** → **Promote to Production**. This is the fastest way to restore a broken site.

---

## 7. Gotchas

- **Google Sheet overrides the code.** If you edit session times in `programmes.ts` and nothing changes on the site, a row for that programme exists in the `Programme_Sessions` tab. Edit or delete that row. After the Youth Weightlifting change, delete any old `youth-strength-conditioning` or Thursday row if one is there.
- **Two places for the dates.** The Women's Run Club and Couch to 5K dates live in two files. If they differ, the page and the confirmation email will disagree.
- **Enquiries go to email only.** Youth Strength & Conditioning enquiries arrive at hello@liftflintshire.co.uk with the subject "New enquiry: youth strength conditioning". They are not saved to a sheet.
- **Changes need a hard refresh** (Cmd+Shift+R) to see on your own machine, because the browser caches the old page.
- **Do not paste passwords, API keys or personal data** into any file in the repository.

---

## 8. When to ask Claude Code instead

Ask for help if you want to: add or remove a page or programme, change layout or colours, add photos, change what a form collects, or change anything in `api/` other than the dates.

Example prompt: "In the Lift Flintshire website, change X to Y on the Z page, then run lint and build."

---

*Last updated: 6 October 2026.*
