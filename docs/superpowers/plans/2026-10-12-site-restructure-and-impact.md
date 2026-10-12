# Site Restructure and Impact Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Flintshire Run Club and Flintshire Weightlifting Club their own pages, group the remaining programmes under Wellbeing, fix the navigation for phones, drive the Home hero stats from the Impact feed, and make the Impact page clearer for funders.

**Architecture:** Programme content stays in `src/data/programmes.ts`, extended with a `group` field. Three small page components render a group through one shared `ProgrammeSection` component extracted from the old `ProgrammesEvents.tsx`. Navigation items live in one data file used by Header and Footer. Pure helpers (hero stats, in-progress month, programme grouping) are unit-tested with vitest; UI is checked in the browser.

**Tech Stack:** Vite, React 19, React Router 7, TypeScript (strict, `verbatimModuleSyntax`: use `import type`), Tailwind 3, vitest, react-helmet-async.

**Spec:** `docs/superpowers/specs/2026-10-12-site-restructure-and-impact-design.md`

**Out of scope (separate plan):** Mailing list. See "Follow-up plan" at the end.

**Working rules**
- Work on a branch, not `main`: `git switch -c feat/site-restructure`.
- Run `npm run lint && npm run test && npm run build` before each commit that touches code.
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Never put personal data in the public sheet. Nothing in this plan writes to a sheet.
- Do not rename form-name `enquiry-youth-strength-conditioning` inside `EnquireYouthStrengthConditioning.tsx` or touch `api/submit-form.ts`; the backend and the sheet use that name.

---

## File structure

| File | Action | Responsibility |
|---|---|---|
| `src/data/links.ts` | Create | External sign-up URLs, one place to edit |
| `src/data/programmes.ts` | Modify | Add `group`, `joinUrl`; rename youth entry |
| `src/data/programmes.test.ts` | Create | Grouping and id rules |
| `src/data/navigation.ts` | Create | Nav items for Header, Footer, mobile menu |
| `src/components/programmes/ProgrammeSection.tsx` | Create | One programme block (moved from ProgrammesEvents) |
| `src/components/programmes/useProgrammesWithSessions.ts` | Create | Merge sheet sessions into programme data |
| `src/components/layout/StickyJoinBar.tsx` | Create | Phone-only sticky call to action |
| `src/components/ui/Testimonial.tsx` | Create | Quote block with an explicit placeholder mode |
| `src/pages/RunClub.tsx` | Create | `/run-club` |
| `src/pages/WeightliftingClub.tsx` | Create | `/weightlifting-club` |
| `src/pages/Wellbeing.tsx` | Create | `/wellbeing` |
| `src/pages/ProgrammesEvents.tsx` | Delete | Replaced by the three pages |
| `src/App.tsx` | Modify | Routes |
| `src/components/layout/Header.tsx` | Modify | New nav, lg breakpoint, grouped mobile menu |
| `src/components/layout/Footer.tsx` | Modify | Nav from shared data |
| `src/lib/heroStats.ts` | Create | Turn `SheetData` into hero stats |
| `src/lib/heroStats.test.ts` | Create | Tests |
| `src/lib/months.ts` | Create | In-progress month check |
| `src/lib/months.test.ts` | Create | Tests |
| `src/hooks/useGoogleSheets.ts` | Modify | Add `monthKey` to `MonthPoint` rows |
| `src/pages/Home.tsx` | Modify | New hero stats, entry cards, trimmed sections |
| `src/pages/ImpactDashboard.tsx` | Modify | Funder layout |
| `src/styles/global.css` | Modify | Print styles for the funder summary |
| `public/sitemap.xml` | Modify | New URLs |
| `README.md`, `HANDOFF.md`, `docs/SOP-editing-website-content.md` | Modify | New routes |

---

### Task 1: External links and programme data model

**Files:**
- Create: `src/data/links.ts`
- Modify: `src/data/programmes.ts`
- Test: `src/data/programmes.test.ts`

- [ ] **Step 1: Create the links file**

`src/data/links.ts`:

```ts
// External sign-up links. Edit here, not in page components.
export const RUN_CLUB_JOIN_URL =
  'https://numberonehsp.gymmasteronline.com/portal/membership/94e9c35ff22e96fdc904582c820e922c'

export const YOUTH_BEGINNERS_JOIN_URL =
  'https://numberonehsp.gymmasteronline.com/portal/membership/48f5f57b19e1226c2ce14291532fb2b0'

export const WEIGHTLIFTING_CONSULTATION_URL =
  'https://numberonehsp.gymmasteronline.com/portal/book/service?serviceid=698033'
```

- [ ] **Step 2: Write the failing test**

`src/data/programmes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { programmes, programmesByGroup } from './programmes'

describe('programmesByGroup', () => {
  it('puts Couch to 5K and Women\'s Track Running in the run club group, with the club itself first', () => {
    expect(programmesByGroup('run-club').map(p => p.id)).toEqual([
      'run-club',
      'couch-to-5k',
      'womens-run-club',
    ])
  })

  it('puts the weightlifting club first, then Youth Weightlifting', () => {
    expect(programmesByGroup('weightlifting-club').map(p => p.id)).toEqual([
      'weightlifting',
      'youth-weightlifting',
    ])
  })

  it('puts Stay Strong and Girls Gym in wellbeing', () => {
    expect(programmesByGroup('wellbeing').map(p => p.id)).toEqual([
      'stay-strong',
      'girls-gym-session',
    ])
  })

  it('assigns every programme to exactly one group', () => {
    const total =
      programmesByGroup('run-club').length +
      programmesByGroup('weightlifting-club').length +
      programmesByGroup('wellbeing').length
    expect(total).toBe(programmes.length)
  })

  it('does not use the old youth id anywhere', () => {
    expect(programmes.some(p => (p.id as string) === 'youth-strength-conditioning')).toBe(false)
  })
})
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npx vitest run src/data/programmes.test.ts`
Expected: FAIL (`programmesByGroup` is not exported).

- [ ] **Step 4: Update `programmes.ts`**

At the top of the file, add the import and change the types:

```ts
import { RUN_CLUB_JOIN_URL, YOUTH_BEGINNERS_JOIN_URL } from './links'
```

Replace the `Programme` interface with:

```ts
export type ProgrammeGroup = 'run-club' | 'weightlifting-club' | 'wellbeing'

export interface Programme {
  id: 'stay-strong' | 'run-club' | 'weightlifting' | 'couch-to-5k' | 'womens-run-club' | 'girls-gym-session' | 'youth-weightlifting'
  group: ProgrammeGroup
  title: string
  tagline: string
  badge: string
  description: string
  targetAudience: string
  whatToExpect: string
  sessions: SessionDetail[]
  /** External sign-up link (GymMaster). Omit when the programme uses its own form. */
  joinUrl?: string
}
```

Add `group` to every entry: `couch-to-5k` and `womens-run-club` and `run-club` get `group: 'run-club'`; `weightlifting` and `youth-weightlifting` get `group: 'weightlifting-club'`; `stay-strong` and `girls-gym-session` get `group: 'wellbeing'`.

Replace the whole `youth-strength-conditioning` entry with:

```ts
  {
    id: 'youth-weightlifting',
    group: 'weightlifting-club',
    title: 'Youth Weightlifting',
    tagline: 'A free 6-week beginners programme for young people',
    badge: 'Ages 11–17 · Free',
    description:
      'Our Youth Weightlifting beginners programme introduces young people to safe, coached weightlifting in a fun, supportive group. It runs for six weeks, is free, and you can start at any time.',
    targetAudience:
      'Open to young people aged 11 to 17. No previous gym or lifting experience is needed. Our qualified coaches adapt every session to the group.',
    whatToExpect:
      'Sessions combine fundamental movement skills, technique work with light barbells, and games. Groups are small and social, with no pressure or competition.',
    sessions: [
      { day: 'Wednesday', time: '16:30–17:30', location: 'Number One HSP, CH5 2TF, Flintshire', cost: 'Free (6-week beginners programme)' },
    ],
    joinUrl: YOUTH_BEGINNERS_JOIN_URL,
  },
```

On the existing `run-club` entry add `joinUrl: RUN_CLUB_JOIN_URL,`.

At the end of the file add:

```ts
export function programmesByGroup(group: ProgrammeGroup): Programme[] {
  return programmes.filter(p => p.group === group)
}
```

The array order already gives the expected test order only if entries appear in that order within each group. Reorder the array so `run-club` comes before `couch-to-5k` and `womens-run-club`, `weightlifting` before `youth-weightlifting`, and `stay-strong` before `girls-gym-session`.

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npx vitest run src/data/programmes.test.ts`
Expected: PASS (5 tests). `tsc` will now fail in `ProgrammesEvents.tsx` and `Home.tsx` for the old youth id; those are fixed in later tasks, so skip `npm run build` until Task 5.

- [ ] **Step 6: Commit**

```bash
git add src/data/links.ts src/data/programmes.ts src/data/programmes.test.ts
git commit -m "feat: group programmes and rename youth entry to Youth Weightlifting"
```

---

### Task 2: Shared ProgrammeSection and session merge hook

**Files:**
- Create: `src/components/programmes/ProgrammeSection.tsx`
- Create: `src/components/programmes/useProgrammesWithSessions.ts`

- [ ] **Step 1: Create the merge hook**

`src/components/programmes/useProgrammesWithSessions.ts`:

```ts
import { programmesByGroup } from '../../data/programmes'
import type { Programme, ProgrammeGroup } from '../../data/programmes'
import { useContentSheets } from '../../hooks/useContentSheets'

// Programmes in a group, with session rows from the content sheet where it has them.
export function useProgrammesWithSessions(group: ProgrammeGroup): Programme[] {
  const { sessionsByProgramme } = useContentSheets()
  return programmesByGroup(group).map(p => ({
    ...p,
    sessions: sessionsByProgramme[p.id]?.length ? sessionsByProgramme[p.id] : p.sessions,
  }))
}
```

- [ ] **Step 2: Create `ProgrammeSection`**

`src/components/programmes/ProgrammeSection.tsx`. Move `SessionDetails`, `programmeImages` and `REGISTER_DIRECTLY` from the old `ProgrammesEvents.tsx` unchanged, change the image map key `'youth-strength-conditioning'` (absent today, so add) to `'youth-weightlifting': ['/images/oly-coaching.jpg']`, and use this component:

```tsx
import { SectionWrapper } from '../layout/SectionWrapper'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'
import type { Programme } from '../../data/programmes'

function SessionDetails({ sessions }: { sessions: Programme['sessions'] }) {
  return (
    <ul className="space-y-2 mt-4">
      {sessions.map((s, i) => (
        <li key={i} className="flex items-start gap-3 font-body text-sm text-ink-light">
          <svg className="flex-shrink-0 mt-0.5 text-teal" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>
            <strong className="text-ink">{s.day}</strong> · {s.time} · {s.location} ·{' '}
            <span className="text-teal font-medium">{s.cost}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const programmeImages: Record<string, string[]> = {
  'run-club':            ['/images/frc-castle.jpeg', '/images/frc-half-maz.jpeg'],
  'couch-to-5k':         ['/images/c25k-26.jpg'],
  'womens-run-club':     ['/images/women-track-frc-flag.jpg', '/images/women-track-social.jpg'],
  'stay-strong':         ['/images/strong-paul-sled-pull.jpg', '/images/strong-gail-deadlift.jpg'],
  'weightlifting':       ['/images/oly-coaching2.jpg', '/images/oly-coaching-tripext2.jpg'],
  'youth-weightlifting': ['/images/oly-coaching.jpg'],
  'girls-gym-session':   ['/images/oly-ohs.jpg'],
}

export interface ProgrammeAction {
  label: string
  href: string
  external?: boolean
}

interface ProgrammeSectionProps {
  programme: Programme
  /** Primary and optional secondary action buttons. */
  actions: ProgrammeAction[]
  imageLeft?: boolean
  muted?: boolean
  /** Heading level: 'h2' for a page's main sections, 'h3' for sub-sections of a club page. */
  headingLevel?: 'h2' | 'h3'
  children?: React.ReactNode
}

export function ProgrammeSection({
  programme,
  actions,
  imageLeft = false,
  muted = false,
  headingLevel = 'h2',
  children,
}: ProgrammeSectionProps) {
  const images = programmeImages[programme.id]
  const Heading = headingLevel

  const content = (
    <div className="flex-1">
      <Badge className="mb-4">{programme.badge}</Badge>
      <Heading className="font-display font-extrabold text-h2 text-ink mb-2">{programme.title}</Heading>
      <p className="font-body text-lg text-ink-light mb-4 leading-relaxed">{programme.tagline}</p>
      <p className="font-body text-base text-ink-light mb-4 leading-relaxed">{programme.description}</p>
      <p className="font-display font-bold text-h3 text-ink mb-1">Who is it for?</p>
      <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{programme.targetAudience}</p>
      <p className="font-display font-bold text-h3 text-ink mb-1">What to expect</p>
      <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{programme.whatToExpect}</p>
      <p className="font-display font-bold text-h3 text-ink mb-1">Sessions</p>
      <SessionDetails sessions={programme.sessions} />
      {children}
      <div className="mt-6 flex flex-wrap gap-3">
        {actions.map((a, i) => (
          <Button key={a.href} variant={i === 0 ? 'primary' : 'outline'} href={a.href}>
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  )

  const image = (
    <div className="flex-1 space-y-4 w-full">
      {images ? (
        images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${programme.title} session`}
            className="w-full aspect-[4/3] object-cover rounded-card"
            loading="lazy"
          />
        ))
      ) : (
        <ImagePlaceholder aspectRatio="4/3" label={`${programme.title}, photography coming soon`} />
      )}
    </div>
  )

  return (
    <section id={programme.id} className="scroll-mt-24">
      <SectionWrapper variant={muted ? 'muted' : 'light'}>
        <div className={`flex flex-col ${imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-start`}>
          {content}
          {image}
        </div>
      </SectionWrapper>
    </section>
  )
}
```

Note the "Who is it for?" / "What to expect" / "Sessions" labels are now `<p>` styled as headings instead of `<h3>`, so sub-sections on club pages keep a valid heading outline.

- [ ] **Step 3: Type-check just these files**

Run: `npx tsc -b 2>&1 | grep -E "components/programmes" || echo "no errors in new files"`
Expected: `no errors in new files`.

- [ ] **Step 4: Commit**

```bash
git add src/components/programmes
git commit -m "feat: extract ProgrammeSection and session merge hook"
```

---

### Task 3: Run Club page

**Files:**
- Create: `src/pages/RunClub.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { ProgrammeSection } from '../components/programmes/ProgrammeSection'
import { useProgrammesWithSessions } from '../components/programmes/useProgrammesWithSessions'
import { StickyJoinBar } from '../components/layout/StickyJoinBar'
import { RUN_CLUB_JOIN_URL } from '../data/links'

export default function RunClub() {
  const programmes = useProgrammesWithSessions('run-club')
  const club = programmes.find(p => p.id === 'run-club')
  const couch = programmes.find(p => p.id === 'couch-to-5k')
  const womens = programmes.find(p => p.id === 'womens-run-club')

  return (
    <>
      <Seo
        title="Flintshire Run Club · Lift Flintshire CIC"
        description="Flintshire Run Club: free guided group runs for every pace, plus Couch to 5K and Women's Track Running. Open to everyone, beginners welcome."
        path="/run-club"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Lift Flintshire</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Flintshire Run Club</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed mb-8">
          Running for every pace, every person. Three guided sessions a week, plus our Couch to 5K programme and Women's Track Running sessions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg" href={RUN_CLUB_JOIN_URL}>Join Run Club</Button>
          <Button variant="outline" size="lg" href="#couch-to-5k" className="border-white/40 text-white hover:bg-white/10">
            New to running? Couch to 5K
          </Button>
        </div>
      </SectionWrapper>

      {club && (
        <ProgrammeSection
          programme={club}
          actions={[{ label: 'Join Run Club', href: RUN_CLUB_JOIN_URL }]}
        />
      )}
      {couch && (
        <ProgrammeSection
          programme={couch}
          imageLeft
          muted
          headingLevel="h2"
          actions={[{ label: "Register now, it's free", href: '/register/couch-to-5k' }]}
        />
      )}
      {womens && (
        <ProgrammeSection
          programme={womens}
          actions={[{ label: "Register now, it's free", href: '/register/womens-run-club' }]}
        />
      )}

      <StickyJoinBar label="Join Run Club" href={RUN_CLUB_JOIN_URL} />
    </>
  )
}
```

(`StickyJoinBar` is created in Task 7. Until then the file will not type-check; this is expected, commit after Task 7 or stub as noted in Step 2.)

- [ ] **Step 2: Temporary stub so the project compiles**

Create `src/components/layout/StickyJoinBar.tsx` with a placeholder export so later tasks can build; the real component replaces it in Task 7:

```tsx
export function StickyJoinBar(_props: { label: string; href: string }) {
  return null
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/RunClub.tsx src/components/layout/StickyJoinBar.tsx
git commit -m "feat: add Run Club page with Couch to 5K and Women's Track Running"
```

---

### Task 4: Weightlifting Club and Wellbeing pages

**Files:**
- Create: `src/pages/WeightliftingClub.tsx`
- Create: `src/pages/Wellbeing.tsx`

- [ ] **Step 1: Weightlifting Club page**

```tsx
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { ProgrammeSection } from '../components/programmes/ProgrammeSection'
import { useProgrammesWithSessions } from '../components/programmes/useProgrammesWithSessions'
import { StickyJoinBar } from '../components/layout/StickyJoinBar'
import { WEIGHTLIFTING_CONSULTATION_URL, YOUTH_BEGINNERS_JOIN_URL } from '../data/links'

function BritishWeightliftingNote() {
  return (
    <div className="flex items-center gap-3 mt-6 p-4 bg-teal-pale rounded-card border border-teal/20">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal flex-shrink-0" aria-hidden="true">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
      <p className="font-body text-sm text-ink-light">
        <strong className="text-ink">Affiliated with British Weightlifting</strong>, our coaches hold British Weightlifting qualifications and our athletes can compete in sanctioned competitions.
      </p>
    </div>
  )
}

export default function WeightliftingClub() {
  const programmes = useProgrammesWithSessions('weightlifting-club')
  const club = programmes.find(p => p.id === 'weightlifting')
  const youth = programmes.find(p => p.id === 'youth-weightlifting')

  return (
    <>
      <Seo
        title="Flintshire Weightlifting Club · Lift Flintshire CIC"
        description="Flintshire Weightlifting Club: coached Olympic lifting for all levels, British Weightlifting affiliated, plus a free beginners programme for ages 11 to 17."
        path="/weightlifting-club"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Lift Flintshire</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Flintshire Weightlifting Club</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed mb-8">
          Learn the snatch, clean and jerk, and build real strength. Coached sessions three times a week, for adults and young people.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg" href={WEIGHTLIFTING_CONSULTATION_URL}>Book a consultation</Button>
          <Button variant="outline" size="lg" href="#youth-weightlifting" className="border-white/40 text-white hover:bg-white/10">
            Ages 11 to 17
          </Button>
        </div>
      </SectionWrapper>

      {club && (
        <ProgrammeSection
          programme={club}
          actions={[{ label: 'Book a consultation', href: WEIGHTLIFTING_CONSULTATION_URL }]}
        >
          <BritishWeightliftingNote />
        </ProgrammeSection>
      )}
      {youth && (
        <ProgrammeSection
          programme={youth}
          imageLeft
          muted
          actions={[
            { label: 'Start the free 6-week programme', href: YOUTH_BEGINNERS_JOIN_URL },
            { label: 'Enquire online', href: '/enquire/youth-weightlifting' },
          ]}
        />
      )}

      <StickyJoinBar label="Book a consultation" href={WEIGHTLIFTING_CONSULTATION_URL} />
    </>
  )
}
```

- [ ] **Step 2: Wellbeing page**

```tsx
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { ProgrammeSection } from '../components/programmes/ProgrammeSection'
import { useProgrammesWithSessions } from '../components/programmes/useProgrammesWithSessions'

export default function Wellbeing() {
  const programmes = useProgrammesWithSessions('wellbeing')
  const strong = programmes.find(p => p.id === 'stay-strong')
  const girls = programmes.find(p => p.id === 'girls-gym-session')

  return (
    <>
      <Seo
        title="Wellbeing Programmes · Lift Flintshire CIC"
        description="Wellbeing programmes from Lift Flintshire CIC: Stay Strong for adults aged 55 and over, and free Girls Gym Sessions for young women."
        path="/wellbeing"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">What else we offer</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Wellbeing Programmes</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Strength and confidence for the people who are too often left out of fitness spaces. All sessions are led by qualified coaches and are fully inclusive.
        </p>
      </SectionWrapper>

      {strong && (
        <ProgrammeSection
          programme={strong}
          actions={[{ label: 'Register your interest', href: '/contact' }]}
        />
      )}
      {girls && (
        <ProgrammeSection
          programme={girls}
          imageLeft
          muted
          actions={[
            { label: 'Register for a session', href: '/register/girls-gym-session' },
            { label: 'Arrange a session for your school', href: '/contact' },
          ]}
        />
      )}
    </>
  )
}
```

Note: the old page sent Girls Gym to Contact only, but `/register/girls-gym-session` already exists in `App.tsx` and `sitemap.xml`. Confirm with Ed before release that this registration route is live; if not, drop the first action.

- [ ] **Step 3: Commit**

```bash
git add src/pages/WeightliftingClub.tsx src/pages/Wellbeing.tsx
git commit -m "feat: add Weightlifting Club and Wellbeing pages"
```

---

### Task 5: Routes, removal of the old page, youth enquiry route

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/pages/ProgrammesEvents.tsx`
- Modify: `src/pages/EnquireYouthStrengthConditioning.tsx` (copy only)
- Modify: `src/pages/Contact.tsx` (links)

- [ ] **Step 1: Update `App.tsx`**

Replace the `ProgrammesEvents` import and route, and the two youth routes:

```tsx
import RunClub from './pages/RunClub'
import WeightliftingClub from './pages/WeightliftingClub'
import Wellbeing from './pages/Wellbeing'
```

```tsx
<Route path="/run-club" element={<RunClub />} />
<Route path="/weightlifting-club" element={<WeightliftingClub />} />
<Route path="/wellbeing" element={<Wellbeing />} />
```

```tsx
<Route path="/enquire/youth-weightlifting" element={<EnquireYouthStrengthConditioning />} />
<Route path="/enquire/youth-strength-conditioning" element={<Navigate to="/enquire/youth-weightlifting" replace />} />
<Route path="/register/youth-strength-conditioning" element={<Navigate to="/enquire/youth-weightlifting" replace />} />
```

Remove the `/programmes-events` route (Ed confirmed no redirect). Remove the `ProgrammesEvents` import.

- [ ] **Step 2: Delete the old page**

Run: `git rm src/pages/ProgrammesEvents.tsx`

- [ ] **Step 3: Update copy in the enquiry page**

Run: `grep -n "Youth Strength\|youth-strength\|programmes-events" src/pages/EnquireYouthStrengthConditioning.tsx src/pages/Contact.tsx`
For each hit that is visible text or a link (not `FORM_NAME`), change "Youth Strength & Conditioning" to "Youth Weightlifting", change `/programmes-events` to the matching new route (`/weightlifting-club` for youth, `/wellbeing` for Stay Strong or Girls Gym), and update the Seo `path` to `/enquire/youth-weightlifting`. Leave `const FORM_NAME = 'enquiry-youth-strength-conditioning'` exactly as it is.

- [ ] **Step 4: Fix remaining old-route references**

Run: `grep -rn "programmes-events" src`
Expected hits: `Header.tsx`, `Footer.tsx`, `Home.tsx`. These are rewritten in Tasks 7 and 8; the build passes only after those tasks. Do not run the build yet.

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "feat: add club and wellbeing routes, remove /programmes-events"
```

---

### Task 6: Shared navigation data

**Files:**
- Create: `src/data/navigation.ts`

- [ ] **Step 1: Create it**

```ts
export interface NavItem {
  label: string
  to: string
}

// Six links in the desktop pill; Home is the logo, Contact is the button.
export const primaryNav: NavItem[] = [
  { label: 'Run Club', to: '/run-club' },
  { label: 'Weightlifting', to: '/weightlifting-club' },
  { label: 'Wellbeing', to: '/wellbeing' },
  { label: 'Events', to: '/events' },
  { label: 'Impact', to: '/impact' },
  { label: 'About', to: '/about' },
]

export const contactNav: NavItem = { label: 'Contact', to: '/contact' }

// Phone menu: the first group is large, the second is a small row.
export const mobileLargeNav: NavItem[] = primaryNav.filter(i => i.to !== '/about')
export const mobileSmallNav: NavItem[] = [
  { label: 'About', to: '/about' },
  contactNav,
  { label: 'Safeguarding', to: '/safeguarding' },
]

export const footerNav: NavItem[] = [
  { label: 'Home', to: '/' },
  ...primaryNav,
  contactNav,
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/navigation.ts
git commit -m "feat: shared navigation data"
```

---

### Task 7: Header, Footer and sticky join bar

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Replace: `src/components/layout/StickyJoinBar.tsx`

- [ ] **Step 1: Header**

Delete the local `navItems` array and import: `import { primaryNav, contactNav, mobileLargeNav, mobileSmallNav } from '../../data/navigation'`.

Change every `md:` in the Header to `lg:` (`hidden md:flex` becomes `hidden lg:flex`, `md:hidden` becomes `lg:hidden` on both the hamburger button and the overlay container). This moves the hamburger breakpoint from 768px to 1024px.

Desktop nav: map `primaryNav`, then add the Contact button after the links, inside the same `<nav>`:

```tsx
<NavLink
  to={contactNav.to}
  className="ml-2 rounded-full bg-teal px-4 py-2 font-body font-semibold text-sm text-white hover:bg-teal-light transition-colors min-h-[36px] inline-flex items-center"
>
  {contactNav.label}
</NavLink>
```

Logo link: add `aria-label="Lift Flintshire CIC, home"` on the `Link` (the image alt stays).

Mobile overlay: replace the `navItems.map` with two groups. The first large link keeps `ref={firstLinkRef}` and the existing classes and transition delay; the second group renders after it:

```tsx
{mobileLargeNav.map((item, i) => (
  <NavLink
    key={item.to}
    ref={i === 0 ? firstLinkRef : undefined}
    to={item.to}
    onClick={() => setIsOpen(false)}
    tabIndex={isOpen ? undefined : -1}
    style={{
      transitionDelay: isOpen ? `${i * 55 + 40}ms` : '0ms',
      fontSize: 'clamp(26px, 7vw, 40px)',
    }}
    className={({ isActive }) =>
      `font-display font-black uppercase py-2 transition-all duration-300 ease-out ${
        isActive ? 'text-teal-light' : 'text-white hover:text-teal-light'
      } ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`
    }
  >
    {item.label}
  </NavLink>
))}
<div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1">
  {mobileSmallNav.map(item => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setIsOpen(false)}
      tabIndex={isOpen ? undefined : -1}
      className="font-body font-medium text-sm text-white/70 hover:text-white min-h-[44px] inline-flex items-center"
    >
      {item.label}
    </NavLink>
  ))}
</div>
```

The overlay is five large lines at 26–40px plus a small row, which fits a 320×568 screen; verify in Step 5.

- [ ] **Step 2: Footer**

Replace the local `navLinks` with `import { footerNav } from '../../data/navigation'` and map `footerNav` instead of `navLinks`. No other change.

- [ ] **Step 3: Sticky join bar**

Overwrite `src/components/layout/StickyJoinBar.tsx`:

```tsx
interface StickyJoinBarProps {
  label: string
  href: string
}

// Phone-only bar fixed to the bottom of the screen so the main action stays in thumb reach.
export function StickyJoinBar({ label, href }: StickyJoinBarProps) {
  return (
    <>
      {/* Spacer so the bar never covers the footer's last line. */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-ink/95 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href={href}
          className="flex w-full items-center justify-center rounded-btn bg-teal px-5 py-3 font-body font-semibold text-[15px] text-white min-h-[44px] hover:bg-teal-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {label}
        </a>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Type-check, lint**

Run: `npx tsc -b 2>&1 | head -20`
Expected: remaining errors only in `Home.tsx` (old youth id and `/programmes-events`). Fixed in Task 9.

- [ ] **Step 5: Browser check (deferred to Task 11)**

Visual checks of the nav at 320, 375, 768 and 1024px are in Task 11 once Home compiles.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout
git commit -m "feat: new navigation, lg hamburger breakpoint, sticky join bar"
```

---

### Task 8: Live hero stats from the Impact feed

**Files:**
- Create: `src/lib/heroStats.ts`
- Test: `src/lib/heroStats.test.ts`
- Modify: `src/hooks/useGoogleSheets.ts`
- Modify: `src/pages/Home.tsx` (wired in Task 9)

- [ ] **Step 1: Write the failing test**

`src/lib/heroStats.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildHeroStats, roundedCount } from './heroStats'
import { aggregateData } from '../hooks/useGoogleSheets'
import type { SheetRow } from '../data/mockData'

function row(date: string, programme: string, total: number): SheetRow {
  return {
    date, programme, sessionType: programme, totalParticipants: total, newParticipants: 0,
    ageUnder18: 0, age18to30: 0, age30to60: 0, ageOver60: 0,
    genderMale: 0, genderFemale: 0, genderOther: 0,
  }
}

describe('roundedCount', () => {
  it('shows small numbers exactly', () => {
    expect(roundedCount(0)).toBe('0')
    expect(roundedCount(7)).toBe('7')
  })
  it('rounds down to the nearest ten with a plus', () => {
    expect(roundedCount(10)).toBe('10+')
    expect(roundedCount(681)).toBe('680+')
  })
})

describe('buildHeroStats', () => {
  const data = aggregateData([
    row('2026-04-07', 'Stay Strong', 30),
    row('2026-04-09', 'Flintshire Run Club', 25),
    row('2026-05-02', 'Flintshire Run Club', 40),
  ])

  it('returns attendances, sessions and programmes from the feed', () => {
    const stats = buildHeroStats(data)
    expect(stats.map(s => s.label)).toEqual([
      'Attendances recorded',
      'Sessions delivered',
      'Programmes running',
    ])
    expect(stats.map(s => s.value)).toEqual(['90+', '3', '2'])
  })

  it('labels the period from the first month of data', () => {
    expect(buildHeroStats(data)[0].period).toBe("Since Apr '26")
  })

  it('returns no stats when there is no data', () => {
    expect(buildHeroStats(aggregateData([]))).toEqual([])
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/lib/heroStats.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/heroStats.ts`:

```ts
import type { SheetData } from '../hooks/useGoogleSheets'

export interface LiveHeroStat {
  value: string
  label: string
  /** Period the figure covers, for example "Since Apr '26". */
  period: string
}

// Exact below 10, otherwise rounded down to the nearest ten with a "+".
export function roundedCount(n: number): string {
  if (n < 10) return String(n)
  return `${Math.floor(n / 10) * 10}+`
}

export function buildHeroStats(data: SheetData): LiveHeroStat[] {
  if (data.totalParticipants === 0 && data.totalSessions === 0) return []
  const first = data.byMonth[0]?.month
  const period = first ? `Since ${first}` : 'All time'
  return [
    { value: roundedCount(data.totalParticipants), label: 'Attendances recorded', period },
    { value: roundedCount(data.totalSessions), label: 'Sessions delivered', period },
    { value: String(data.byProgramme.length), label: 'Programmes running', period },
  ]
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npx vitest run src/lib/heroStats.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Decide what happens to the old Summary tab**

In `useGoogleSheets.ts` leave `heroStats` and `parseSummarySheet` in place. They are the fallback when the impact feed fails (Task 9 uses them only when `data` is null). No code change in this step. Record the decision in `HANDOFF.md` in Task 13.

- [ ] **Step 6: Commit**

```bash
git add src/lib/heroStats.ts src/lib/heroStats.test.ts
git commit -m "feat: build hero stats from the Impact feed"
```

---

### Task 9: Home page

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/ui/Testimonial.tsx`

- [ ] **Step 1: Testimonial with a visible placeholder mode**

`src/components/ui/Testimonial.tsx`:

```tsx
interface TestimonialProps {
  quote: string
  attribution: string
  /** True until Ed supplies a real, permitted quote. Placeholders render a clear "Example" label. */
  placeholder?: boolean
}

export function Testimonial({ quote, attribution, placeholder = false }: TestimonialProps) {
  return (
    <figure className="max-w-3xl mx-auto text-center">
      {placeholder && (
        <p className="inline-block mb-4 rounded-full bg-white/10 px-3 py-1 font-body text-[11px] uppercase tracking-[0.08em] text-white/80">
          Example, replace with a real quote
        </p>
      )}
      <blockquote className="font-display font-bold text-h3 text-white leading-snug">
        “{quote}”
      </blockquote>
      <figcaption className="font-body text-sm text-white/70 mt-4">{attribution}</figcaption>
    </figure>
  )
}
```

The visible label stops placeholder text going live looking like a real person's words.

- [ ] **Step 2: Hero stats**

In `Home.tsx` add `import { buildHeroStats } from '../lib/heroStats'` and replace the `HeroStats` component and its use:

```tsx
function HeroStats({ stats }: { stats: { value: string; label: string; period?: string }[] }) {
  const period = stats.find(s => s.period)?.period
  return (
    <div className="border-t border-white/10 mt-10 pt-8">
      <div className="grid grid-cols-3 gap-6">
        {stats.map(s => (
          <StatCard key={s.label} value={s.value} label={s.label} />
        ))}
      </div>
      {period && <p className="font-body text-xs text-white/60 text-center mt-4">{period}</p>}
    </div>
  )
}
```

```tsx
const { data: sheetsData } = useGoogleSheets()
const liveStats = sheetsData ? buildHeroStats(sheetsData) : []
const heroStats = liveStats.length > 0 ? liveStats : sheetsData?.heroStats ?? []
```

- [ ] **Step 3: Hero image and CTAs**

Change the hero background image to a people-first photo. Use `/images/women-run-club-1.jpeg` as the starting choice and look at it in the browser; if faces are not visible at 20% opacity, raise to `opacity-30`. Ed to confirm the photo choice. Change the two buttons to `Join Run Club` (`/run-club`) and `Weightlifting Club` (`/weightlifting-club`), and make the secondary one outline.

- [ ] **Step 4: Entry cards replace the 7-card grid**

Replace the whole "Programmes preview" `SectionWrapper` with:

```tsx
<SectionWrapper variant="muted">
  <h2 className="font-display font-extrabold text-h2 text-ink mb-10">Find your place</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card
      variant="programme"
      title="Flintshire Run Club"
      description="Guided runs for every pace, plus Couch to 5K and Women's Track Running."
      badge="Running"
      href="/run-club"
      imageSrc="/images/frc-castle.jpeg"
    />
    <Card
      variant="programme"
      title="Flintshire Weightlifting Club"
      description="Coached Olympic lifting for all levels, and a free beginners programme for ages 11 to 17."
      badge="Weightlifting"
      href="/weightlifting-club"
      imageSrc="/images/oly-coaching2.jpg"
    />
  </div>
  <p className="font-body text-base text-ink-light mt-8 text-center">
    Looking for something else? See our{' '}
    <Link to="/wellbeing" className="text-teal font-semibold hover:underline">wellbeing programmes</Link>
    {' '}for adults aged 55 and over and young women.
  </p>
</SectionWrapper>
```

Remove the now-unused `programmes`, `programmeImages` and `programmeImagePositions` constants and the `programmes` import.

- [ ] **Step 5: Trim the aims block and dividers**

Replace the four-card "Our aim" grid with one short paragraph and a link:

```tsx
<SectionWrapper variant="light">
  <div className="max-w-3xl mx-auto text-center">
    <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Our aim</p>
    <h2 className="font-display font-extrabold text-h2 text-ink mb-6">A stronger, healthier Flintshire, open to everyone</h2>
    <p className="font-body text-lg text-ink-light leading-relaxed mb-6">
      We make fitness genuinely accessible, whatever your age, ability, income or experience. Every programme starts free, and every coach is trained to welcome complete beginners.
    </p>
    <Link to="/about" className="font-body font-semibold text-teal hover:underline">Read our objectives →</Link>
  </div>
</SectionWrapper>
```

Move the four numbered objectives into `About.tsx` unchanged (cut and paste the four `div`s into a grid inside a new `SectionWrapper` on that page). Keep the wave divider between the hero and the teal mission strip, and delete the other three `WaveDivider`s along with their imports if unused.

- [ ] **Step 6: Testimonial strip**

Add above the social strip, inside a dark `SectionWrapper`:

```tsx
<SectionWrapper variant="dark">
  <Testimonial
    placeholder
    quote="Replace this with a real quote from a member, with their permission."
    attribution="Member name, programme"
  />
</SectionWrapper>
```

Import `Testimonial` from `../components/ui/Testimonial`. When Ed supplies real quotes, remove `placeholder`.

- [ ] **Step 7: Social strip**

Under the Instagram link add a plain-text note, "Newsletter coming soon", only if the mailing list follow-up has not shipped; otherwise omit. (Default: omit; do not announce unbuilt features.)

- [ ] **Step 8: Build, lint, test**

Run: `npm run lint && npm run test && npm run build`
Expected: all pass. Fix any unused-import errors (`Card`, `Button`, `Link` are still used).

- [ ] **Step 9: Commit**

```bash
git add -A src
git commit -m "feat: new Home with club entry cards, live hero stats, testimonial placeholder"
```

---

### Task 10: Impact page for funders

**Files:**
- Create: `src/lib/months.ts`
- Test: `src/lib/months.test.ts`
- Modify: `src/hooks/useGoogleSheets.ts`
- Modify: `src/pages/ImpactDashboard.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write the failing test for the in-progress month**

`src/lib/months.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isInProgressMonth } from './months'

describe('isInProgressMonth', () => {
  it('is true for the current calendar month', () => {
    expect(isInProgressMonth('2026-10', new Date('2026-10-12T10:00:00'))).toBe(true)
  })
  it('is false for earlier months', () => {
    expect(isInProgressMonth('2026-09', new Date('2026-10-12T10:00:00'))).toBe(false)
  })
  it('is false when the key is missing', () => {
    expect(isInProgressMonth(undefined, new Date('2026-10-12T10:00:00'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/lib/months.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/months.ts`:

```ts
// monthKey is "YYYY-MM". The current calendar month is still being recorded,
// so its bar is not comparable with finished months.
export function isInProgressMonth(monthKey: string | undefined, now: Date = new Date()): boolean {
  if (!monthKey) return false
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthKey === current
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npx vitest run src/lib/months.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Add `monthKey` to month points**

In `useGoogleSheets.ts`, in both `byMonth` and `byAreaMonth` `.map` callbacks change the return to include the key:

```ts
return { month: `${MONTH_LABELS[month] ?? month} '${year.slice(2)}`, monthKey: key, total: _total || 0, ...programmes }
```

(and the same with `...areas` in the area version). `MonthPoint`'s index signature already allows a string value.

Re-run Task 8 tests: `npx vitest run src/lib/heroStats.test.ts`. Expected: PASS (the period test reads `month`, which is unchanged).

- [ ] **Step 6: Headline numbers and terms**

In `ImpactDashboard.tsx`, replace the eight-tile grid with a headline trio and a secondary row. Keep `StatNum` but make the final number readable without animation by changing it to:

```tsx
function StatNum({ value, suffix = '', colour }: { value: number; suffix?: string; colour: string }) {
  const { value: count, ref } = useCountUp(value, 1800)
  return (
    <div ref={ref} className="font-display font-black leading-none" style={{ fontSize: 'clamp(44px, 5vw, 64px)', color: colour }}>
      <span className="sr-only">{value.toLocaleString()}{suffix}</span>
      <span aria-hidden="true">{count.toLocaleString()}{suffix}</span>
    </div>
  )
}
```

Headline trio (3 columns on `md`, stacked on phones):

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#376A6B' }}>
    <p className="font-body text-sm font-semibold text-white/80">Attendances recorded</p>
    <StatNum value={data.totalParticipants} colour="white" />
  </div>
  <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#E8713C' }}>
    <p className="font-body text-sm font-semibold text-white/80">Sessions delivered</p>
    <StatNum value={data.totalSessions} colour="white" />
  </div>
  <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#111111' }}>
    <p className="font-body text-sm font-semibold text-white/70">Programmes running</p>
    <StatNum value={numProgrammes} colour="white" />
  </div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
  {/* four compact tiles: Active this month, New participants, Returning, Female participants */}
</div>
<p className="font-body text-sm text-ink-light max-w-2xl mb-20">
  <strong className="text-ink">How we count.</strong> An attendance is one person at one session, so someone who comes to four sessions counts four times. Session records come from our coaches after each session and are entered by our team.
</p>
```

Fill the four compact tiles by moving the existing "Active this month", "New participants", "Returning participants" and "Female participants" tiles into the second grid with `min-h-[110px]` and `p-5`. The "Active programmes" tile is deleted (it is now a headline tile).

Wording check with Ed: the sentence "entered by our team" must match how the sheet is actually filled (a Google Form, per `Form Responses 4`). Edit to match before release.

- [ ] **Step 7: "Who we reach" above the time charts**

Move `<DemographicsSection …/>` to directly after the compact tiles and the "How we count" note, and replace its section headings with a single intro line above it:

```tsx
<h2 className="font-display font-bold text-h2 text-ink mb-1">Who we reach</h2>
<p className="font-body text-sm text-ink-light max-w-lg mb-8">
  {pctFemale}% of attendances are by women and girls, and {underEighteenPct}% are by under-18s.
</p>
```

Compute `underEighteenPct` next to `pctFemale`:

```tsx
const totalAge = data?.byAge.reduce((s, a) => s + a.participants, 0) ?? 0
const underEighteen = data?.byAge.find(a => a.name === 'Under 18')?.participants ?? 0
const underEighteenPct = totalAge > 0 ? Math.round((underEighteen / totalAge) * 100) : 0
```

- [ ] **Step 8: Merge the two time charts and mark the current month**

Order below "Who we reach": `ImpactAreasChart` first (default view), then the by-programme chart inside a native disclosure:

```tsx
<details className="mb-20 group">
  <summary className="cursor-pointer font-body font-semibold text-teal min-h-[44px] flex items-center">
    See attendances by programme
  </summary>
  <div className="pt-6">
    <MonthlyTimeline byMonth={data.byMonth} allProgrammes={data.allProgrammes} />
  </div>
</details>
```

In `StackedBarChart`, add the in-progress treatment. Import `isInProgressMonth` and change the month label cell and the bar track:

```tsx
const partial = isInProgressMonth(m.monthKey as string | undefined)
// label cell
<div className="w-14 flex-shrink-0 font-body text-xs font-semibold text-ink-light text-right">
  {m.month}{partial && <span className="block font-normal text-[10px]">so far</span>}
</div>
// bar track: add a dashed outline when partial
<div className={`flex-1 flex h-8 rounded overflow-hidden bg-surface-muted ${partial ? 'outline outline-2 outline-dashed outline-ink-light/50' : ''}`}>
```

Add a legend line under the chart caption when any row is partial: `Dashed bar: month still in progress.` Also add `partial` to the `ChartDataTable` month cell text, for example `${m.month} (in progress)`.

Open question for Ed (note in the PR description): September 2026 shows 20 attendances against 196 in July. If Sep is complete, that is a real dip; if entries were late, the data needs completing before funders see the page. The code does not hide it.

- [ ] **Step 9: Stories slot, method note, print summary**

Below Programme Reach add a dark "In their words" strip using `Testimonial` with `placeholder` (same placeholder rules as Home). Replace the footer data note with:

```tsx
<div className="mt-4 text-center">
  <p className="font-body text-xs text-ink-light">
    Data from Lift Flintshire CIC session records. Last updated: {data.lastUpdated}.
  </p>
</div>
```

Add a "Download summary (PDF)" button in the page hero, hidden when printing:

```tsx
<Button variant="primary" onClick={() => window.print()} className="mt-6 print:hidden">
  Download summary (PDF)
</Button>
```

Add to `src/styles/global.css`:

```css
@media print {
  header[class*="fixed"], footer, #mobile-menu, .skip-link { display: none !important; }
  main { padding-top: 0 !important; }
  .animate-pulse { animation: none; }
  details > summary { display: none; }
  details > div { display: block; }
  details:not([open]) > :not(summary) { display: block; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

Users choose "Save as PDF" in the print dialog; this satisfies "generate on request" with no new dependency. The `details` rules make the by-programme chart appear in the printout.

- [ ] **Step 10: Verify**

Run: `npm run lint && npm run test && npm run build`
Expected: pass.

- [ ] **Step 11: Commit**

```bash
git add -A src
git commit -m "feat: funder-focused Impact page with in-progress month and print summary"
```

---

### Task 11: Browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Use the preview tool with the `dev` entry in `.claude/launch.json`, or run `npm run dev` and open `http://localhost:5173`.

- [ ] **Step 2: Check each page at four widths**

Pages: `/`, `/run-club`, `/weightlifting-club`, `/wellbeing`, `/impact`, `/events`, `/about`, `/contact`. Widths: 320, 375, 768, 1024, 1440.

Pass criteria:
- No horizontal scroll at any width.
- At 1024px the desktop pill shows six links plus Contact without wrapping or clipping; at 768px the hamburger shows.
- The mobile menu fits at 320×568 with all eight items visible without scrolling.
- Sticky join bar shows below 1024px on the two club pages only and does not cover the footer's last line.
- Buttons and links are at least 44px tall on phones.
- Console shows no errors.

- [ ] **Step 3: Keyboard pass**

Tab through the header: skip link, logo, six links, Contact, hamburger at small widths. Open the menu, press Escape: focus returns to the hamburger.

- [ ] **Step 4: Check redirects**

Open `/enquire/youth-strength-conditioning` and `/register/youth-strength-conditioning`: both land on `/enquire/youth-weightlifting`. Submit nothing; confirm the form renders and the heading reads Youth Weightlifting.

- [ ] **Step 5: Check the external links**

Click each of the three GymMaster buttons (Run Club join, Youth beginners, Weightlifting consultation). They must open the right GymMaster page. If any shows an error, tell Ed before release.

- [ ] **Step 6: Impact page**

Confirm: headline trio, "How we count", "Who we reach" before the charts, the dashed "so far" bar on the current month once Oct data exists, the "See attendances by programme" disclosure, screen reader text shows final numbers (inspect that the `sr-only` span holds the value), and the print preview (Cmd+P) hides the header and footer.

- [ ] **Step 7: Run the Impeccable detector once**

Run: `"/Users/edharper/Library/Application Support/Claude/local-agent-mode-sessions/3cff9ddc-5335-4ed1-8041-ebffbdb828f7/f4767464-9bdf-46de-9880-33592633038a/rpm/plugin_01V5tHKv2BVDURhymvtkwAFM/skills/impeccable/scripts/impeccable" detect --json src/pages src/components`
Expected: `[]` or only findings you can justify. Fix the rest in one pass, then stop.

---

### Task 12: Sitemap and docs

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `README.md`, `HANDOFF.md`, `docs/SOP-editing-website-content.md`

- [ ] **Step 1: Sitemap**

In `public/sitemap.xml` replace the `/programmes-events` entry with three entries (`priority` 0.9, `changefreq` weekly for `/run-club`, `/weightlifting-club`, `/wellbeing`) and change `/enquire/youth-strength-conditioning` to `/enquire/youth-weightlifting`. Add `/events` and `/safeguarding` only if they are missing and should be indexed (events yes, priority 0.8).

- [ ] **Step 2: Docs**

- `README.md`: fix the tech stack to React 19, React Router 7 and Tailwind 3; drop the Recharts line if `package.json` does not list it (it does not).
- `HANDOFF.md`: update the Key Files table (new pages, `links.ts`, `navigation.ts`, `heroStats.ts`), note that Home hero stats now come from the Impact feed with the Summary tab as fallback, and note the youth id rename and the retained `FORM_NAME`.
- `docs/SOP-editing-website-content.md`: replace every mention of `/programmes-events` with the new page for that programme, and explain where to change the three GymMaster links (`src/data/links.ts`).

- [ ] **Step 3: Final run and commit**

Run: `npm run lint && npm run test && npm run build`
Expected: all pass.

```bash
git add -A
git commit -m "docs: sitemap and handoff notes for the new structure"
```

- [ ] **Step 4: Open the PR**

Push the branch and open a pull request. In the description list the open items for Ed: confirm the Girls Gym registration route is live, confirm the hero photo, confirm the "How we count" wording, check whether September 2026 data is complete, and replace the two testimonial placeholders.

---

## Self-review against the spec

| Spec item | Task |
|---|---|
| `/run-club` with C25K and Women's Track as sections, forms kept | 3 |
| `/weightlifting-club` with Youth Weightlifting, GymMaster links, consultation booking | 1, 4 |
| `/wellbeing` with Stay Strong and Girls Gym | 4 |
| Andy's Man Club and School Outreach stay Impact-only | no task needed (no page added) |
| `/programmes-events` dropped, no redirect | 5 |
| Nav: six links plus Contact button, lg hamburger, grouped phone menu, sticky join bar | 6, 7 |
| Home: people-first hero, entry cards, trimmed aims, fewer dividers, testimonial placeholder | 9 |
| Hero stats from the Impact feed, period label | 8, 9 |
| Impact: headline trio, defined terms, who-we-reach first, one default chart with by-programme disclosure, in-progress month, reduced-motion and no-JS-safe numbers, print summary, stories slot, method note | 10 |
| Funder PDF on request | 10 Step 9 (browser print to PDF) |
| Sitemap and docs | 12 |
| Mailing list | Follow-up plan below |

Type consistency: `ProgrammeGroup`, `programmesByGroup`, `joinUrl`, `monthKey`, `LiveHeroStat.period`, `isInProgressMonth`, `StickyJoinBar` props (`label`, `href`) and the link constants are used with the same names everywhere.

Not done in this plan: cost wording clarification for Run Club ("Free, then £30 annually"), Facebook link, image resizing to WebP, About page polish. They need Ed's input or are separate polish tasks.

## Follow-up plan: mailing list

Separate plan, because it adds a third-party service and a consent flow. Before writing it, Ed decides the provider (Brevo, named in the original brief, or Resend Audiences, already used for confirmation emails). The plan must read `api/submit-form.ts` first and follow the handoff rule that anything personal goes to the private sheet only. It must cover: a sign-up form with unticked consent text, a consent timestamp stored with the address, an unsubscribe route, an update to the Privacy page, and a single "Join our newsletter" block in the Footer and on Home.
