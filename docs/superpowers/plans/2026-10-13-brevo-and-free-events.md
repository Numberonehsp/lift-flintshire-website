# Brevo mailing groups and free event entries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let people opt in to Lift Flintshire emails from the site and land in Brevo groups per programme and per event (for example everyone who entered the Women's Track event), and make free events (price 0) enterable.

**Architecture:** One server-only Brevo client (`api/_lib/brevo.ts`) adds or updates a contact and puts it on named lists. Registration forms, event entry and a new newsletter form carry an unticked marketing-consent checkbox. Only people who tick it are sent to Brevo, and only after the entry or registration succeeds. Event entries record consent in a new sheet column so the Stripe webhook can add the contact once the entry is confirmed. Free tiers skip Stripe and confirm immediately through the same code path.

**Tech Stack:** Vercel serverless functions (`api/`), Brevo REST API v3, Resend (existing transactional email), Stripe, Google Sheets (private sheet), React 19, vitest.

**Decisions made with Ed (2026-10-13)**
- Consent: optional, unticked "email me" checkbox on each form. Only people who tick it go into Brevo. No automatic adding.
- Groups: one per programme, one per event, and a whole-newsletter list.
- Under-18s: parent or guardian email only, with an explicit guardian tick-box. Never the child's name or details.
- The API key is created by Ed in Brevo and set in Vercel as `BREVO_API_KEY`. It must never be pasted into chat, committed, or put in a `VITE_` variable.

**Working rules**
- Branch: `git switch -c feat/brevo-and-free-events` from `main`.
- Run `npm run lint && npm run test && npm run build` before each commit that touches code.
- Commit trailers: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Brevo's API shapes below are from memory. Before writing `api/_lib/brevo.ts`, read Brevo's current API docs (developers.brevo.com: "Create a contact", "Get all lists", "Create a list", "Get all folders") and correct the payloads. Do not guess.
- Marketing consent is separate from `gdpr-consent`. Never add anyone to Brevo without `marketing-consent === 'yes'`.
- Personal data stays out of the public sheet. Nothing here writes to `VITE_GOOGLE_SHEET_ID`.

---

## File structure

| File | Action | Responsibility |
|---|---|---|
| `api/_lib/brevo.ts` | Create | Brevo client: list lookup/creation, contact upsert |
| `api/_lib/brevo.test.ts` | Create | Payload and list-name tests with a mocked `fetch` |
| `api/_lib/marketing.ts` | Create | Maps a form name or event to list names; decides whether to send |
| `api/_lib/marketing.test.ts` | Create | Tests for the mapping rules |
| `api/_lib/entryEmails.ts` | Create | Shared entry confirmation email (paid and free) |
| `api/_lib/entriesSheet.ts` | Modify | New "Marketing Consent" column; free-entry helper |
| `api/_lib/eventLookup.ts` | Create | Reads one event's programme from the public Events tab |
| `api/subscribe.ts` | Create | Newsletter sign-up endpoint |
| `api/submit-form.ts` | Modify | After a registration or youth enquiry, add opted-in contacts |
| `api/create-entry.ts` | Modify | Free-tier path; store consent |
| `api/stripe-webhook.ts` | Modify | Add opted-in entrant to Brevo after payment; use shared email |
| `src/components/forms/MarketingConsent.tsx` | Create | The unticked checkbox with clear wording |
| `src/components/forms/NewsletterSignup.tsx` | Create | Email field, consent text, submit |
| `src/components/forms/RegistrationForm.tsx` | Modify | Add `MarketingConsent` |
| `src/pages/EventEntry.tsx` | Modify | Add `MarketingConsent`; free-tier wording and flow |
| `src/pages/EventDetail.tsx` | Modify | Show "Free" instead of £0.00 |
| `src/pages/EnquireYouthStrengthConditioning.tsx` | Modify | Guardian-only marketing tick-box |
| `src/pages/Home.tsx`, `src/components/layout/Footer.tsx` | Modify | Newsletter sign-up block |
| `src/pages/Privacy.tsx` | Modify | Brevo as a processor; marketing consent; unsubscribe |
| `.env.example`, `HANDOFF.md`, `docs/SOP-editing-website-content.md` | Modify | Env vars, steps for Ed, how to email a group |

## List naming

Brevo lists are found or created by name, so nobody has to copy numeric IDs around.

| Who | List name |
|---|---|
| Anyone who ticks consent anywhere | `Newsletter` |
| Programme registrants | `Programme: couch-to-5k`, `Programme: womens-run-club` (the programme ids in `src/data/programmes.ts`) |
| Event entrants | `Event: <event id>`, for example `Event: Nov_WTR` |
| Event entrants, by programme | `Programme: <Events sheet programme column>` when that column is filled |
| Parent or guardian of a youth enquirer | `Guardians: youth-weightlifting` |

All new lists are created inside one Brevo folder named in `BREVO_FOLDER_ID`.

---

### Task 1: Brevo client

**Files:** Create `api/_lib/brevo.ts`, `api/_lib/brevo.test.ts`.

- [ ] **Step 1: Read Brevo's docs** for create contact (update if exists), get lists, create list, and folders. Note the exact paths, the `api-key` header, and how existing contacts are updated.

- [ ] **Step 2: Write failing tests** with a stubbed `globalThis.fetch`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertContact, resetListCache } from './brevo.js'

describe('upsertContact', () => {
  beforeEach(() => {
    resetListCache()
    process.env.BREVO_API_KEY = 'test-key'
    process.env.BREVO_FOLDER_ID = '1'
  })

  it('creates missing lists, then upserts the contact on all of them', async () => {
    const calls: { url: string; init?: RequestInit }[] = []
    globalThis.fetch = vi.fn(async (url: string | URL, init?: RequestInit) => {
      calls.push({ url: String(url), init })
      const u = String(url)
      if (u.includes('/contacts/lists') && (!init || init.method === undefined || init.method === 'GET')) {
        return new Response(JSON.stringify({ lists: [{ id: 7, name: 'Newsletter' }], count: 1 }), { status: 200 })
      }
      if (u.endsWith('/contacts/lists') && init?.method === 'POST') {
        return new Response(JSON.stringify({ id: 9 }), { status: 201 })
      }
      return new Response('{}', { status: 201 })
    }) as typeof fetch

    await upsertContact({
      email: 'a@example.com',
      firstName: 'Ann',
      lists: ['Newsletter', 'Event: Nov_WTR'],
    })

    const contactCall = calls.find(c => c.url.endsWith('/contacts') && c.init?.method === 'POST')!
    const body = JSON.parse(contactCall.init!.body as string)
    expect(body.email).toBe('a@example.com')
    expect(body.listIds.sort()).toEqual([7, 9])
    expect(body.updateEnabled).toBe(true)
    expect((contactCall.init!.headers as Record<string, string>)['api-key']).toBe('test-key')
  })

  it('does nothing when BREVO_API_KEY is not set', async () => {
    delete process.env.BREVO_API_KEY
    globalThis.fetch = vi.fn() as typeof fetch
    await upsertContact({ email: 'a@example.com', lists: ['Newsletter'] })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
```

Adjust paths and shapes to match the docs you read.

- [ ] **Step 3: Implement** `api/_lib/brevo.ts` with:
  - `upsertContact({ email, firstName?, lastName?, lists, attributes? })`: resolve each list name to an id (cached in a module-level map, `resetListCache()` clears it for tests), create missing lists in `BREVO_FOLDER_ID`, then POST the contact with `listIds` and `updateEnabled: true`.
  - Sends `CONSENT_DATE` (ISO) and `CONSENT_SOURCE` (the form or page) as contact attributes. Create these attributes in Brevo first (Ed step in Task 9) or the API rejects unknown attributes; handle that error by retrying without attributes and logging.
  - Returns without throwing when the key is missing. Throws on non-2xx so callers can catch and log; callers must treat Brevo failure as non-fatal.
  - Never logs the email address or the API key.

- [ ] **Step 4: Run** `npx vitest run api/_lib/brevo.test.ts` (pass), lint, build. Commit: `feat: Brevo client for contact upsert and list lookup`.

---

### Task 2: List mapping rules

**Files:** Create `api/_lib/marketing.ts`, `api/_lib/marketing.test.ts`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { listsForRegistration, listsForEvent, listsForYouthGuardian, hasMarketingConsent } from './marketing.js'

describe('hasMarketingConsent', () => {
  it('is true only for "yes"', () => {
    expect(hasMarketingConsent({ 'marketing-consent': 'yes' })).toBe(true)
    expect(hasMarketingConsent({ 'marketing-consent': 'on' })).toBe(false)
    expect(hasMarketingConsent({})).toBe(false)
  })
})

describe('listsForRegistration', () => {
  it('maps the register form name to its programme list plus Newsletter', () => {
    expect(listsForRegistration('register-womens-run-club')).toEqual(['Newsletter', 'Programme: womens-run-club'])
    expect(listsForRegistration('register-couch-to-5k')).toEqual(['Newsletter', 'Programme: couch-to-5k'])
  })
  it('returns only Newsletter for an unknown form', () => {
    expect(listsForRegistration('something-else')).toEqual(['Newsletter'])
  })
})

describe('listsForEvent', () => {
  it('adds the event list and the programme list when the event has a programme', () => {
    expect(listsForEvent('Nov_WTR', 'womens-run-club')).toEqual([
      'Newsletter', 'Event: Nov_WTR', 'Programme: womens-run-club',
    ])
  })
  it('skips the programme list when the event has none', () => {
    expect(listsForEvent('Nov_WTR', undefined)).toEqual(['Newsletter', 'Event: Nov_WTR'])
  })
})

describe('listsForYouthGuardian', () => {
  it('uses only the guardian list', () => {
    expect(listsForYouthGuardian()).toEqual(['Guardians: youth-weightlifting'])
  })
})
```

- [ ] **Step 2: Implement** with those exact signatures; `listsForRegistration` strips a leading `register-`.
- [ ] **Step 3: Run tests, lint, commit:** `feat: mailing list mapping rules`.

---

### Task 3: Consent checkbox component and registration wiring

**Files:** Create `src/components/forms/MarketingConsent.tsx`; modify `src/components/forms/RegistrationForm.tsx`.

- [ ] **Step 1: Component.** Unticked, optional, named `marketing-consent`, value `yes`:

```tsx
interface MarketingConsentProps {
  id: string
  /** What the person is joining, for example "Couch to 5K news and updates". */
  topic?: string
  guardian?: boolean
}

export function MarketingConsent({ id, topic = 'news, session updates and events', guardian = false }: MarketingConsentProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        name="marketing-consent"
        value="yes"
        className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
      />
      <label htmlFor={id} className="font-body text-sm text-ink leading-relaxed cursor-pointer">
        {guardian
          ? `I am the parent or guardian and I'd like Lift Flintshire CIC to email me ${topic}.`
          : `I'd like Lift Flintshire CIC to email me ${topic}.`}{' '}
        <span className="text-ink-light">Optional. You can unsubscribe at any time from any email.</span>
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Wire into `RegistrationForm.tsx`** on the consents step, after the photo consent, above the submit area. It uses the form's own submit (it posts all `FormData` entries), so no handler change is needed. Use `id={`${formName}-marketing`}`.
- [ ] **Step 3: Check in the browser** that the box is unticked by default and absent from the required-field validation, then lint, build, commit: `feat: optional marketing consent checkbox on registration forms`.

---

### Task 4: Registration and youth enquiry to Brevo

**Files:** Modify `api/submit-form.ts`, `src/pages/EnquireYouthStrengthConditioning.tsx`.

- [ ] **Step 1: Youth enquiry form.** Read the page to find the parent or guardian email field name. Add `<MarketingConsent id="youth-marketing" guardian topic="news about Youth Weightlifting" />` before the submit button.
- [ ] **Step 2: `submit-form.ts`.** After the registration email and sheet write succeed (new step 4, non-fatal, before the response):

```ts
if (hasMarketingConsent(fields)) {
  try {
    if (isEnquiry && formName === 'enquiry-youth-strength-conditioning') {
      const guardianEmail = fields['parent-email'] ?? fields['guardian-email'] ?? fields['email']
      if (guardianEmail) {
        await upsertContact({ email: guardianEmail, lists: listsForYouthGuardian(), source: formName })
      }
    } else if (!isEnquiry && formName.startsWith('register-')) {
      const contactEmail = fields['guardian-email'] ?? fields['email']
      if (contactEmail) {
        await upsertContact({
          email: contactEmail,
          firstName: fields['first-name'],
          lastName: fields['last-name'],
          lists: listsForRegistration(formName),
          source: formName,
        })
      }
    }
  } catch (brevoErr) {
    console.error('Brevo error (non-fatal):', brevoErr)
  }
}
```

Replace `parent-email` with the real field name from Step 1. For the guardian path send only the email, never the child's name or school year.
- [ ] **Step 3: Tests.** Extract the decision into a pure function in `marketing.ts` if needed so it can be unit-tested; add tests for: consent absent means no call, youth means guardian list only with no first name, register form means programme list plus Newsletter.
- [ ] **Step 4:** lint, test, build, commit: `feat: add opted-in registrants and youth guardians to Brevo`.

---

### Task 5: Newsletter sign-up

**Files:** Create `api/subscribe.ts`, `src/components/forms/NewsletterSignup.tsx`; modify `Footer.tsx`, `Home.tsx`.

- [ ] **Step 1: `api/subscribe.ts`.** POST only. Body `{ email, 'marketing-consent': 'yes' }`. Validate email with a simple regex, require consent, call `upsertContact({ email, lists: ['Newsletter'], source: 'newsletter-signup' })`. Return 200 `{ success: true }`, 400 for bad input, 500 for Brevo errors with no detail. Basic abuse protection: reject bodies over 2 KB and add a hidden honeypot field `website` that must be empty (silently return 200 if filled).
- [ ] **Step 2: Component.** Email input (label, `autoComplete="email"`), consent line "I'd like Lift Flintshire CIC to email me news, session updates and events. You can unsubscribe at any time.", the checkbox is required here because ticking is the signup action, honeypot hidden with `aria-hidden` and `tabIndex={-1}`, states idle, submitting, success, error. Success text: "Thanks, you're on the list."
- [ ] **Step 3: Place it** in the Footer's "Connect" column and as a section on Home above the social strip. 
- [ ] **Step 4:** browser check on desktop and 320px, lint, build, commit: `feat: newsletter sign-up form`.

---

### Task 6: Free event entries

**Files:** Create `api/_lib/entryEmails.ts`; modify `api/_lib/entriesSheet.ts`, `api/create-entry.ts`, `api/stripe-webhook.ts`, `src/pages/EventDetail.tsx`, `src/pages/EventEntry.tsx`.

Current behaviour: every tier goes through Stripe Checkout, including price 0. A zero-pound Checkout session is not reliable, and the page shows "£0.00", so free events cannot be entered.

- [ ] **Step 1: Confirm the problem** (do not skip): in Stripe test mode, create a Checkout session with `unit_amount: 0` as `create-entry.ts` does, and record what Stripe returns. Note the result in the commit message. The fix below does not depend on the answer, since free entries bypass Stripe.
- [ ] **Step 2: Shared email.** Move `confirmationHtml` from `stripe-webhook.ts` into `api/_lib/entryEmails.ts` as `entryConfirmationHtml({ firstName, eventTitle, tierLabel, ref, amount })`; when `amount` is `0.00` it must say "Your free entry is confirmed" instead of "£0.00 paid". Add a unit test for both wordings. Update the webhook to import it.
- [ ] **Step 3: `create-entry.ts` free path.** After the availability checks and `entryRef` creation, before Stripe:

```ts
if (tier.pricePence === 0) {
  await appendPendingEntry({ ...entry, sessionId: 'free' })
  const row = await findEntryByRef(entryRef)
  if (!row) throw new Error('Free entry row missing after append')
  await markEntryPaid(row.rowNumber, '0.00')
  await finaliseEntry({ entryRef, eventId: f.eventId, eventTitle: f.eventTitle, tierLabel: tier.label,
    firstName: f['first-name'], email: f.email, amount: '0.00', marketingConsent: f['marketing-consent'] === 'yes' })
  return res.status(200).json({ url: `${site}/events/entry-confirmed?ref=${entryRef}` })
}
```

`finaliseEntry` (new, in `entryEmails.ts` or a sibling file) sends the confirmation and organiser emails and, if opted in, calls Brevo (Task 7). It is shared with the webhook so paid and free entries behave identically. Email and Brevo failures are caught and logged, never thrown.

Capacity: `countTaken` counts `paid` rows, so free confirmed entries count against capacity, and the existing availability check runs before this block.
- [ ] **Step 4: Frontend.** `EventDetail.tsx` and `EventEntry.tsx`: show "Free" when `tier.pricePence === 0`; the entry button reads "Enter for free"; the payment note about Stripe is hidden for free tiers. `EventEntry` follows the returned `url` as it does today, so no flow change is needed.
- [ ] **Step 4b: Check** `/events/entry-confirmed` does not assume a paid amount; adjust wording if it does.
- [ ] **Step 5:** lint, test, build, commit: `feat: free events skip Stripe and confirm immediately`.

---

### Task 7: Event entries to Brevo

**Files:** Create `api/_lib/eventLookup.ts`; modify `api/_lib/entriesSheet.ts`, `api/create-entry.ts`, `api/stripe-webhook.ts`, `src/pages/EventEntry.tsx`.

- [ ] **Step 1: Consent column.** Append `'Marketing Consent'` to the end of `ENTRY_COLUMNS` (it must stay after column D, which the public availability endpoint reads). Add `marketingConsent: string` to `PendingEntry` and the row. Extend `findEntryByRef` to read the consent value and the first and last name (`A:AH`) and return `marketingConsent` and `lastName`. If the existing live sheet already has a header row, add the new header cell by hand (Ed step in Task 9); `ensureHeaderRow` only writes headers for an empty sheet.
- [ ] **Step 2: Checkbox in `EventEntry.tsx`** after the photo consent: `<MarketingConsent id="entry-marketing" topic="news about this event and other Lift Flintshire sessions" />`. Pass `marketing-consent` through to `create-entry.ts`, which stores it.
- [ ] **Step 3: Programme lookup.** `eventLookup.ts` exports `fetchEventProgramme(eventId): Promise<string | undefined>`, reading the public `Events` tab (same `GOOGLE_SHEET_ID_PUBLIC` and `GOOGLE_API_KEY` env vars as `Ticket_Types`), matching column A, returning column H trimmed or undefined. Unit test the row parsing with a plain array.
- [ ] **Step 4: `finaliseEntry`.** If `marketingConsent`, call `fetchEventProgramme`, build lists with `listsForEvent(eventId, programme)`, and `upsertContact({ email, firstName, lastName, lists, source: 'event-entry' })`, in a try/catch that logs and moves on. Use it from both the free path and the webhook. Do not add team-captain teammates' emails to Brevo; only the person who ticked.
- [ ] **Step 5:** lint, test, build, commit: `feat: add opted-in event entrants to Brevo event and programme lists`.

---

### Task 8: Privacy policy and wording

**Files:** Modify `src/pages/Privacy.tsx`.

- [ ] Add a section "Email updates": what we send, that it is opt-in, Brevo named as the processor (data held by Brevo, which Ed should confirm is within the UK or EEA or covered by a transfer mechanism in Brevo's terms), that the consent date and the form it came from are recorded, how to unsubscribe (link in every email, or email hello@liftflintshire.co.uk), and how long we keep addresses (until unsubscribed or on request). Keep the guardian wording for Youth Weightlifting.
- [ ] Add Brevo to any "who we share data with" list that exists.
- [ ] Lint, build, commit: `docs: privacy policy covers Brevo email updates`.

---

### Task 9: Env vars, docs and steps for Ed

**Files:** Modify `.env.example`, `HANDOFF.md`, `docs/SOP-editing-website-content.md`.

- [ ] `.env.example`: add `BREVO_API_KEY=your_brevo_api_key_here` and `BREVO_FOLDER_ID=your_brevo_folder_id_here` with a comment that they are server-only.
- [ ] `HANDOFF.md`: describe the flow (opt-in only, list naming table, where code lives, failures are non-fatal and logged), the free-entry path, and the new sheet column.
- [ ] `SOP`: "How to email a group": in Brevo go to Contacts, Lists, pick `Event: <id>` or `Programme: <id>`, then create a campaign to that list. The Events sheet `programme` column controls which programme list an event's entrants join, so fill it (valid ids: `womens-run-club`, `couch-to-5k`, `run-club`, `stay-strong`, `weightlifting`).
- [ ] Commit: `docs: Brevo setup and how to email a group`.

**Steps only Ed can do (the PR description must list these):**
1. In Brevo: Contacts, Settings, Contact attributes, create two text attributes: `CONSENT_DATE` and `CONSENT_SOURCE`.
2. In Brevo: Contacts, Lists, create a folder (for example "Website") and note its numeric id.
3. In Brevo: SMTP and API, create an API key. Copy it straight into Vercel (Project, Settings, Environment Variables) as `BREVO_API_KEY` for Production and Preview. Do not paste it into chat, a file in the repo, or a `VITE_` variable. Add `BREVO_FOLDER_ID` the same way.
4. In Brevo: Senders, domains and dedicated IPs, add and authenticate `liftflintshire.co.uk` (DKIM and DMARC records) before sending campaigns. Resend's existing records on that domain do not cover Brevo.
5. In the private sheet, `Event_Entries` tab: add a header `Marketing Consent` in the next free column after `Runner 4 Email` (column AH).
6. In the Events sheet: fill the `programme` column (H) for each event, for example `womens-run-club` for the Nov_WTR event.
7. Redeploy after the env vars are set.

---

### Task 10: Verification

- [ ] `npm run lint && npm run test && npm run build`.
- [ ] Browser: newsletter form (success, bad email, honeypot), registration checkbox present and unticked on `/register/couch-to-5k` and `/register/womens-run-club`, event entry checkbox, free event shows "Free" and "Enter for free", youth enquiry guardian box; each at 320px and desktop.
- [ ] With real Brevo credentials in a Preview deployment: submit a newsletter signup and a free event entry with the box ticked, confirm the contact appears in Brevo on `Newsletter`, `Event: <id>` and the programme list with consent attributes; confirm a submission with the box unticked adds nothing.
- [ ] Confirm the Resend confirmation email arrives for a free entry and says it is free.
- [ ] Open the PR with the Ed steps above and the privacy-policy note that Brevo's data location should be checked.

---

## Self-review against the decisions

| Decision | Task |
|---|---|
| Optional unticked consent on each form | 3, 4, 5, 7 |
| Groups per programme, per event, newsletter | 1, 2, 4, 5, 7 |
| Guardian-only for under-18s | 3 (component), 4 |
| Event linkage so one programme's registrants can be emailed | 2, 7 |
| Free events enterable (found while planning) | 6 |
| Privacy policy | 8 |
| Ed's Brevo steps and secrets handling | 9 |

Not covered: importing the historical mailing list (needs its location and proof of consent; separate task once found), double opt-in confirmation emails (optional Brevo setting), and unsubscribing people from the site (Brevo handles unsubscribe links in campaigns).
