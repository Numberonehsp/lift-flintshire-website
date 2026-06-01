# Visual Redesign — Lift Flintshire CIC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the aesthetic quality, motion design, and impact storytelling of liftflintshire.co.uk across all pages — without changing any functionality or deployment configuration.

**Architecture:** Pure CSS + vanilla JS for all animations (IntersectionObserver, requestAnimationFrame) — zero new runtime dependencies. All UI changes are additive: existing component APIs are extended with optional props, never broken. New hooks extend the existing Google Sheets pipeline. Netlify form wiring remains untouched.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS 3, Recharts, react-router-dom 7, Netlify Forms (existing)

**Testing note:** No test framework exists in this project. Each task's verification step is visual: run `npm run dev`, open `http://localhost:5173`, and check the described behaviour in the browser. TypeScript compilation (`npm run build`) acts as a type-safety gate.

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `src/hooks/useScrollReveal.ts` | IntersectionObserver hook — returns a `ref` that adds `.revealed` class when element enters viewport |
| `src/hooks/useCountUp.ts` | rAF-based counter — animates from 0 to a target number over a configurable duration |
| `src/hooks/useTestimonials.ts` | Fetches anonymised participant quotes from the `Testimonials` Google Sheet tab |
| `src/components/ui/AnimatedCounter.tsx` | Renders a counting-up number using `useCountUp` + `useScrollReveal` |
| `src/components/ui/StoryBar.tsx` | Horizontal animated bar for programme participant breakdown |
| `src/components/ui/TestimonialCarousel.tsx` | Auto-rotating quote carousel |
| `src/components/ui/ProgressBar.tsx` | Multi-step form progress indicator |
| `src/components/ui/WaveDivider.tsx` | SVG wave used at section transitions |
| `docs/google-sheets-testimonials-setup.md` | Instructions for adding the Testimonials tab to the Google Sheet |

### Modified files
| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add amber accent colour; add custom animation keyframes |
| `src/styles/global.css` | Grain texture overlay; `.reveal` / `.revealed` scroll animation classes; stagger delay utilities |
| `src/App.tsx` | Body-level grain overlay; main gets `pt-20` for fixed nav clearance |
| `src/components/layout/Header.tsx` | Floating pill nav; hamburger → X morph; full-screen mobile overlay with staggered links |
| `src/components/layout/SectionWrapper.tsx` | Optional `reveal` prop triggers scroll-reveal on inner wrapper |
| `src/components/ui/Card.tsx` | `ProgrammeCard` redesigned as full-bleed image with gradient overlay, double-bezel outer shell, hover physics |
| `src/components/ui/StatCard.tsx` | Accepts optional `animate` prop — delegates to `AnimatedCounter` |
| `src/pages/Home.tsx` | Hero dark bg extends behind fixed nav; hero stats animate on entry; programme grid uses staggered reveals |
| `src/pages/About.tsx` | Emoji → custom SVG icons; team placeholder section hidden; partner placeholder section removed |
| `src/pages/ImpactDashboard.tsx` | Full redesign: dark headline panel, horizontal story bars, monthly trend line, testimonials carousel |
| `src/hooks/useGoogleSheets.ts` | Add `byMonth` field to `SheetData` and `aggregateData` |
| `src/pages/Questionnaire.tsx` | Rewritten as 4-step multi-step form with progress bar |
| `src/components/forms/RegistrationForm.tsx` | Add "How did you hear about us?" field |

---

## Phase 1 — Design Foundation

### Task 1: Amber accent + animation tokens in Tailwind

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add amber accent colour and keyframes**

Replace the `extend` block in `tailwind.config.ts` with:

```ts
extend: {
  colors: {
    ink: {
      DEFAULT: '#111111',
      light: '#444444',
    },
    bg: '#FAFAF8',
    surface: {
      DEFAULT: '#FFFFFF',
      muted: '#F0EFEA',
    },
    teal: {
      DEFAULT: '#376A6B',
      light: '#5A9798',
      pale: '#E0EDEE',
    },
    amber: {
      DEFAULT: '#D4A853',
      pale: '#FDF6E3',
    },
    cream: '#D4CDB2',
    border: '#E2E0D8',
  },
  fontFamily: {
    display: ['"Barlow Condensed"', 'sans-serif'],
    body: ['"DM Sans"', 'sans-serif'],
  },
  borderRadius: {
    card: '10px',
    btn: '7px',
  },
  fontSize: {
    hero: ['clamp(64px,8vw,110px)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
    h1: ['clamp(40px,5vw,64px)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
    h2: ['clamp(32px,4vw,48px)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
    h3: ['clamp(22px,2.5vw,32px)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
  },
  transitionTimingFunction: {
    spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
    press: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  keyframes: {
    revealUp: {
      '0%': { opacity: '0', transform: 'translateY(32px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
  animation: {
    revealUp: 'revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  },
},
```

Note: hero font size increased from `clamp(52px,6vw,80px)` to `clamp(64px,8vw,110px)` — this makes the homepage headline more dramatic on desktop.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: no TypeScript or Tailwind errors.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add amber accent, spring easing, larger hero type scale"
```

---

### Task 2: Global CSS — grain overlay + scroll reveal classes

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add grain, scroll reveal, and stagger utilities**

Append to the end of `src/styles/global.css`:

```css
/* ─── Grain texture overlay ─────────────────────────── */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}

/* ─── Scroll reveal ──────────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger delays for grid children */
.stagger-1 { transition-delay: 0ms; }
.stagger-2 { transition-delay: 80ms; }
.stagger-3 { transition-delay: 160ms; }
.stagger-4 { transition-delay: 240ms; }
.stagger-5 { transition-delay: 320ms; }
.stagger-6 { transition-delay: 400ms; }

/* ─── Story bar animation ────────────────────────────── */
@keyframes barGrow {
  from { width: 0%; }
  to { width: var(--bar-width); }
}
.bar-animate {
  animation: barGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
```

- [ ] **Step 2: Start dev server and verify grain**

```bash
npm run dev
```

Open `http://localhost:5173`. You should see a very subtle film-grain texture overlaying the whole page. It should be barely perceptible — if it's distracting, reduce the `opacity` value.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add grain overlay, scroll reveal classes, stagger utilities"
```

---

### Task 3: `useScrollReveal` hook

**Files:**
- Create: `src/hooks/useScrollReveal.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useRef } from 'react'

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('reveal')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScrollReveal.ts
git commit -m "feat: add useScrollReveal IntersectionObserver hook"
```

---

### Task 4: `useCountUp` hook

**Files:**
- Create: `src/hooks/useCountUp.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useState } from 'react'

export function useCountUp(
  target: number,
  duration = 1400,
  enabled = true
): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled || target === 0) {
      setCount(target)
      return
    }

    let rafId: number
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, enabled])

  return count
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCountUp.ts
git commit -m "feat: add useCountUp rAF animation hook"
```

---

### Task 5: `AnimatedCounter` component

**Files:**
- Create: `src/components/ui/AnimatedCounter.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useRef, useState, useEffect } from 'react'
import { useCountUp } from '../../hooks/useCountUp'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1400,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [enabled, setEnabled] = useState(false)
  const count = useCountUp(value, duration, enabled)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnabled(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('en-GB')}{suffix}
    </span>
  )
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/AnimatedCounter.tsx
git commit -m "feat: add AnimatedCounter component with viewport-triggered count-up"
```

---

## Phase 2 — Navigation

### Task 6: Floating pill nav + animated mobile overlay

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Replace Header with floating pill design**

Rewrite `src/components/layout/Header.tsx`:

```tsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Programmes', to: '/programmes-events' },
  { label: 'Impact', to: '/impact' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-body font-medium text-sm transition-colors duration-200 ${
      isActive ? 'text-white' : 'text-white/60 hover:text-white'
    }`

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <div className="bg-ink/95 backdrop-blur-md rounded-full px-5 py-3 flex items-center justify-between ring-1 ring-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center min-h-[44px]">
              <img
                src="/logo-white.png"
                alt="Lift Flintshire CIC"
                className="h-8 w-auto max-w-[140px]"
                style={{ mixBlendMode: 'screen' }}
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  ;(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'
                }}
              />
              <span
                className="font-display font-black text-white text-lg leading-none tracking-tight"
                style={{ display: 'none' }}
              >
                LIFT <span className="text-teal">FLINTSHIRE</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={desktopLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setIsOpen(prev => !prev)}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal rounded-full"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              <span
                className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${
                  isOpen ? 'rotate-45 translate-y-[3.75px]' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${
                  isOpen ? '-rotate-45 -translate-y-[3.75px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(17,17,17,0.97)', backdropFilter: 'blur(20px)' }}
        onClick={() => setIsOpen(false)}
      >
        <nav className="flex flex-col items-center justify-center min-h-dvh gap-2 px-8">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `font-display font-black text-[clamp(36px,8vw,56px)] uppercase leading-none tracking-tight py-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'text-teal' : 'text-white hover:text-teal'
                } ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
              }
              style={{ transitionDelay: isOpen ? `${i * 60 + 80}ms` : '0ms' }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Check:
- Nav appears as a floating pill 16px from top on all pages
- Logo is visible in the pill
- Desktop links are readable at 60% opacity, white when active
- On mobile: hamburger shows three short lines
- Clicking hamburger opens a full-screen dark overlay with large nav items
- The three lines morph: top rotates to 45°, middle fades, bottom rotates to -45°
- Each nav link slides up and fades in with stagger
- Clicking a link or the overlay closes the menu

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: floating pill nav with morphing hamburger and staggered mobile overlay"
```

---

### Task 7: Fix main content clearance for fixed nav

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Add top padding to main in App.tsx**

In `src/App.tsx`, change:

```tsx
<main>
```

to:

```tsx
<main className="pt-20">
```

- [ ] **Step 2: Extend Home hero section behind the nav**

In `src/pages/Home.tsx`, change the opening section tag from:

```tsx
<section className="bg-ink">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
```

to:

```tsx
<section className="bg-ink -mt-20 pt-8">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-24">
```

This pulls the section up by 80px (overcoming the main's `pt-20`) so the dark background fills to the top of the viewport, then adds enough top padding to the content so it clears the floating nav.

- [ ] **Step 3: Update all other page hero SectionWrappers**

Each page that uses `<SectionWrapper variant="dark">` as its first element needs extra top padding. The `innerClassName` prop allows overriding the inner div's classes. Update the hero SectionWrapper in each of these pages:

**`src/pages/About.tsx`** — change:
```tsx
<SectionWrapper variant="dark">
```
to:
```tsx
<SectionWrapper variant="dark" innerClassName="pt-28 md:pt-36 pb-16 md:pb-24">
```

**`src/pages/ProgrammesEvents.tsx`** — same change on its first `<SectionWrapper variant="dark">`.

**`src/pages/ImpactDashboard.tsx`** — same change on its first `<SectionWrapper variant="dark">`.

**`src/pages/Contact.tsx`** — same change on its `<SectionWrapper variant="dark">`.

**`src/pages/Questionnaire.tsx`** — same change on its `<SectionWrapper variant="dark">`.

**`src/pages/RegisterCouchTo5k.tsx`** — same change on its `<SectionWrapper variant="dark">`.

**`src/pages/RegisterWomensRunClub.tsx`** — same change on its `<SectionWrapper variant="dark">`.

- [ ] **Step 4: Verify in browser**

Navigate to each page. The floating pill nav should float cleanly over the dark hero background, and no hero content should be hidden behind the nav on any page. The dark background should fill right to the top of the viewport on pages with dark heroes.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/Home.tsx src/pages/About.tsx src/pages/ProgrammesEvents.tsx src/pages/ImpactDashboard.tsx src/pages/Contact.tsx src/pages/Questionnaire.tsx src/pages/RegisterCouchTo5k.tsx src/pages/RegisterWomensRunClub.tsx
git commit -m "fix: nav clearance — extend hero sections behind fixed floating nav"
```

---

## Phase 3 — Hero Section

### Task 8: Hero atmospheric layer + hero stat animation

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/ui/StatCard.tsx`

- [ ] **Step 1: Add atmospheric photo layer to hero**

In `src/pages/Home.tsx`, replace the hero section content (after the opening `<section>` tag through to the first `</section>`) with:

```tsx
<section className="bg-ink relative overflow-hidden -mt-20 pt-8">
  {/* Atmospheric photo layer */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: 'url(/images/frc-castle.jpeg)',
      opacity: 0.08,
      filter: 'grayscale(60%)',
    }}
    aria-hidden="true"
  />
  {/* Dark gradient to fade the photo at bottom */}
  <div
    className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink"
    aria-hidden="true"
  />

  <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-24">
    <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
      Strength · Fitness · Wellbeing · Flintshire
    </p>
    <h1 className="font-display font-black text-hero text-white uppercase leading-none mb-6">
      Lifting<br />
      <span className="text-teal">Communities</span><br />
      Together
    </h1>
    <p className="font-body text-lg text-white/70 leading-relaxed max-w-xl mb-8">
      Lift Flintshire CIC delivers inclusive strength, fitness, and wellbeing programmes
      across Flintshire — open to everyone, regardless of age or ability.
      We believe movement changes lives.
    </p>
    <div className="flex flex-wrap gap-4">
      <Button variant="primary" href="/programmes-events" size="lg">View our programmes</Button>
      <Button variant="outline" href="/contact" size="lg" className="border-white/40 text-white hover:bg-white/10">
        Get in touch
      </Button>
    </div>
    {heroStats.length > 0 && <HeroStats stats={heroStats} />}
  </div>
</section>
```

- [ ] **Step 2: Update `StatCard` to support animated counting**

Rewrite `src/components/ui/StatCard.tsx`:

```tsx
import { AnimatedCounter } from './AnimatedCounter'

interface StatCardProps {
  value: string
  label: string
  className?: string
  animate?: boolean
}

function parseNumeric(value: string): { num: number; prefix: string; suffix: string } | null {
  const match = value.match(/^([£+]*)(\d[\d,]*)([k+%]*)$/)
  if (!match) return null
  return {
    prefix: match[1] ?? '',
    num: parseInt(match[2].replace(/,/g, ''), 10),
    suffix: match[3] ?? '',
  }
}

export function StatCard({ value, label, className = '', animate = false }: StatCardProps) {
  const parsed = animate ? parseNumeric(value.trim()) : null

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className="font-display font-extrabold text-h2 text-teal leading-none">
        {parsed ? (
          <AnimatedCounter
            value={parsed.num}
            prefix={parsed.prefix}
            suffix={parsed.suffix}
          />
        ) : (
          value
        )}
      </span>
      <span className="font-body text-sm text-ink-light mt-1">{label}</span>
    </div>
  )
}
```

- [ ] **Step 3: Pass `animate` to hero stats**

In `src/pages/Home.tsx`, update `HeroStats`:

```tsx
function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="border-t border-white/10 mt-10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map(s => (
        <StatCard key={s.label} value={s.value} label={s.label} animate />
      ))}
    </div>
  )
}
```

And update the Impact Dashboard's stat cards (in `src/pages/ImpactDashboard.tsx`) to use `animate` on the three top-level stat cards as well (covered in Phase 6 below).

- [ ] **Step 4: Verify in browser**

On `http://localhost:5173`:
- Hero now has a very faint photographic layer behind the text (barely visible, adds warmth)
- Headline "LIFTING COMMUNITIES TOGETHER" is noticeably larger than before
- If Google Sheets is connected, hero stats animate from 0 upward when scrolled into view

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx src/components/ui/StatCard.tsx
git commit -m "feat: hero atmospheric photo layer, animated hero stats, larger headline"
```

---

## Phase 4 — Programme Cards

### Task 9: Full-bleed image programme cards with hover physics

**Files:**
- Modify: `src/components/ui/Card.tsx`

- [ ] **Step 1: Redesign `ProgrammeCard` with full-bleed image + double-bezel**

In `src/components/ui/Card.tsx`, replace the `ProgrammeCard` function and its supporting types:

```tsx
import { Badge } from './Badge'
import { Button } from './Button'
import { ImagePlaceholder } from './ImagePlaceholder'

interface ProgrammeCardProps {
  variant: 'programme'
  title: string
  description: string
  badge?: string
  href: string
  imageSrc?: string
  imagePosition?: string
}

interface EventCardProps {
  variant: 'event'
  title: string
  date: string
  time: string
  location: string
  price: number
  description: string
  onRegister?: () => void
}

interface TeamCardProps {
  variant: 'team'
  name: string
  role: string
}

type CardProps = ProgrammeCardProps | EventCardProps | TeamCardProps

function ProgrammeCard({ title, description, badge, href, imageSrc, imagePosition = 'object-center' }: ProgrammeCardProps) {
  return (
    {/* Outer double-bezel shell */}
    <div className="p-1.5 rounded-[14px] bg-black/8 ring-1 ring-black/8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)] group">
      {/* Inner card core */}
      <div className="rounded-[10px] overflow-hidden bg-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        {/* Image area */}
        <div className="relative aspect-video overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className={`w-full h-full object-cover ${imagePosition} scale-100 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]`}
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder aspectRatio="video" />
          )}
          {/* Gradient overlay — content sits on top of image */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
          {/* Badge on top of image */}
          {badge && (
            <div className="absolute top-3 left-3">
              <Badge>{badge}</Badge>
            </div>
          )}
          {/* Title on top of image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display font-black text-white text-[clamp(20px,2.5vw,28px)] leading-none uppercase">
              {title}
            </h3>
          </div>
        </div>
        {/* Description + CTA below image */}
        <div className="p-4 bg-surface">
          <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{description}</p>
          <Button variant="ghost" href={href} size="sm">Find out more →</Button>
        </div>
      </div>
    </div>
  )
}
```

Note: The JSX fragment notation `{/* Outer double-bezel shell */}` needs to be removed in the actual file — it's a `<div>` not a fragment. The return value starts with `<div className="p-1.5...`.

- [ ] **Step 2: Verify in browser**

On the homepage programme grid:
- Each card has a subtle outer shell/bezel (very slight padding around the card)
- Programme image fills the top of the card with the programme title overlaid at bottom
- The badge floats over the top-left of the image
- Description and CTA appear below the image on a white background
- Hovering a card: the card lifts slightly, shadow deepens, image zooms gently (1.04x)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat: programme cards — full-bleed image, double-bezel, hover physics"
```

---

## Phase 5 — Scroll Reveals

### Task 10: Scroll reveal on SectionWrapper

**Files:**
- Modify: `src/components/layout/SectionWrapper.tsx`

- [ ] **Step 1: Add optional `reveal` prop**

```tsx
import { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

type Variant = 'light' | 'muted' | 'dark' | 'teal'

interface SectionWrapperProps {
  children: ReactNode
  variant?: Variant
  className?: string
  innerClassName?: string
  id?: string
  reveal?: boolean
}

const variantClasses: Record<Variant, string> = {
  light: 'bg-bg',
  muted: 'bg-surface-muted',
  dark: 'bg-ink text-white',
  teal: 'bg-teal text-white',
}

export function SectionWrapper({
  children,
  variant = 'light',
  className = '',
  innerClassName = '',
  id,
  reveal = false,
}: SectionWrapperProps) {
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reveal) return
    const el = innerRef.current
    if (!el) return
    el.classList.add('reveal')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reveal])

  return (
    <section id={id} className={`${variantClasses[variant]} ${className}`}>
      <div
        ref={innerRef}
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${innerClassName}`}
      >
        {children}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add `reveal` to non-hero sections on Home**

In `src/pages/Home.tsx`, add `reveal` to:
- `<SectionWrapper variant="teal" ...>` (mission strip)
- `<SectionWrapper variant="muted">` (programmes preview)
- `<SectionWrapper variant="light">` (events preview, if shown)
- `<SectionWrapper variant="dark" ...>` (social strip)

- [ ] **Step 3: Add `reveal` to other pages' non-hero sections**

Apply `reveal` to all secondary `SectionWrapper` instances in:
- `src/pages/About.tsx` — all sections except the hero
- `src/pages/Contact.tsx` — the form section
- `src/pages/ProgrammesEvents.tsx` — each `ProgrammeSection`'s inner SectionWrapper

- [ ] **Step 4: Add stagger classes to programme card grid on Home**

In `src/pages/Home.tsx`, update the programme grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {programmes.map((p, i) => (
    <div
      key={p.id}
      className={`reveal stagger-${Math.min(i + 1, 6)}`}
      ref={/* Note: stagger items use the CSS class approach, not the hook */undefined}
    >
      <Card
        variant="programme"
        title={p.title}
        description={p.tagline}
        badge={p.badge}
        href={`/programmes-events#${p.id}`}
        imageSrc={programmeImages[p.id]}
        imagePosition={programmeImagePositions[p.id]}
      />
    </div>
  ))}
</div>
```

Wait — the stagger items need the IntersectionObserver applied to them. Rather than the hook (which attaches to one element), apply reveals to the grid container and use CSS stagger delays on children. The `.reveal` CSS class is applied via the parent SectionWrapper. For card-level stagger, add a small utility: trigger the parent SectionWrapper's reveal, and children get their stagger delays via the `.stagger-N` classes. The children also need the `reveal` class added.

Better approach — add a parent wrapper that triggers child reveals:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="programmes-grid">
  {programmes.map((p, i) => (
    <div key={p.id} className={`reveal stagger-${Math.min(i + 1, 6)}`}>
      <Card ... />
    </div>
  ))}
</div>
```

Then add this `useEffect` inside the `Home` component to trigger child reveals when the grid enters viewport:

```tsx
useEffect(() => {
  const grid = document.getElementById('programmes-grid')
  if (!grid) return
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        grid.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'))
        observer.disconnect()
      }
    },
    { threshold: 0.05 }
  )
  observer.observe(grid)
  return () => observer.disconnect()
}, [])
```

- [ ] **Step 5: Verify in browser**

Scroll through the homepage. Sections should fade and slide up as they enter the viewport. Programme cards should reveal with a staggered left-to-right delay.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/SectionWrapper.tsx src/pages/Home.tsx src/pages/About.tsx src/pages/Contact.tsx src/pages/ProgrammesEvents.tsx
git commit -m "feat: scroll reveal animations across all pages and programme card grid stagger"
```

---

## Phase 6 — Impact Dashboard Redesign

### Task 11: Add `byMonth` aggregation to Google Sheets hook

**Files:**
- Modify: `src/hooks/useGoogleSheets.ts`

- [ ] **Step 1: Add `byMonth` to `SheetData` interface**

In `src/hooks/useGoogleSheets.ts`, add to the `SheetData` interface:

```ts
byMonth: { name: string; participants: number }[]
```

- [ ] **Step 2: Add monthly aggregation to `aggregateData`**

In the `aggregateData` function, after the `byAge` block, add:

```ts
const monthMap: Record<string, number> = {}
rows.forEach(r => {
  const month = r.date.slice(0, 7) // 'YYYY-MM'
  if (month) {
    monthMap[month] = (monthMap[month] || 0) + r.totalParticipants
  }
})
const byMonth = Object.entries(monthMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, participants]) => ({
    name: new Date(key + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    participants,
  }))
```

Add `byMonth` to the return object:

```ts
return {
  totalParticipants,
  totalSessions,
  activeThisMonth,
  byProgramme,
  byGender,
  byAge,
  byMonth,        // ← add this
  lastUpdated: now.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
  heroStats: defaultHeroStats,
}
```

Also update `aggregateData`'s return in the mock path if `mockData.ts` uses it — it doesn't directly call `aggregateData`, so this only affects the live path. Add `byMonth: []` as a fallback in the mock aggregation call at the top of `useGoogleSheets` where mock data is used:

```ts
const aggregated = aggregateData(mockRows)
// byMonth already populated from mock rows
setData(aggregated)
```

- [ ] **Step 3: Verify compilation**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGoogleSheets.ts
git commit -m "feat: add byMonth participant trend to Google Sheets aggregation"
```

---

### Task 12: `StoryBar` component

**Files:**
- Create: `src/components/ui/StoryBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useEffect, useRef } from 'react'

interface StoryBarProps {
  label: string
  value: number
  max: number
  colour?: string
}

export function StoryBar({ label, value, max, colour = '#376A6B' }: StoryBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.setProperty('--bar-width', `${percentage}%`)
          el.classList.add('bar-animate')
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [percentage])

  return (
    <div className="flex items-center gap-4">
      <span className="font-body text-sm text-ink-light w-36 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ backgroundColor: colour, width: 0 }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-label={`${label}: ${value} participants`}
        />
      </div>
      <span className="font-display font-bold text-ink text-sm w-12 text-right flex-shrink-0">
        {value.toLocaleString('en-GB')}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StoryBar.tsx
git commit -m "feat: add StoryBar animated horizontal bar component"
```

---

### Task 13: `useTestimonials` hook + Google Sheet instructions

**Files:**
- Create: `src/hooks/useTestimonials.ts`
- Create: `docs/google-sheets-testimonials-setup.md`

- [ ] **Step 1: Create the hook**

```ts
import { useState, useEffect } from 'react'

export interface Testimonial {
  quote: string
  programme: string
  firstName: string
}

export function useTestimonials(): Testimonial[] {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!sheetId || !apiKey) return

    const tab = encodeURIComponent('Testimonials')
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}?key=${apiKey}`)
      .then(r => r.json())
      .then((json: { values?: string[][] }) => {
        if (!json.values || json.values.length < 2) return
        const [, ...rows] = json.values
        setTestimonials(
          rows
            .filter(row => row[0] && row[1] && row[2])
            .map(row => ({
              quote: row[0],
              programme: row[1],
              firstName: row[2],
            }))
        )
      })
      .catch(() => {/* silently fail — testimonials are optional */})
  }, [])

  return testimonials
}
```

- [ ] **Step 2: Create Google Sheet setup instructions**

Create `docs/google-sheets-testimonials-setup.md`:

```markdown
# Google Sheets: Testimonials Tab Setup

Add a tab named exactly `Testimonials` to the same Google Sheet used for impact data.

## Column layout

| A | B | C |
|---|---|---|
| Quote | Programme | First name |

Row 1 must be a header row (not shown to visitors). Data starts from row 2.

## Example data

| A | B | C |
|---|---|---|
| The Stay Strong sessions have genuinely changed my life. I feel so much stronger. | Stay Strong | Margaret |
| I went from never running to completing my first parkrun. Amazing support. | Couch to 5K | David |

## Notes

- Keep quotes to 2–3 sentences maximum for display
- First name only (or "Anonymous") — do not include surnames
- Programme name should match one of: Stay Strong, Couch to 5K, Women's Run Club, Flintshire Run Club, Flintshire Weightlifting Club
- The tab name must be exactly `Testimonials` (capital T, no spaces)
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTestimonials.ts docs/google-sheets-testimonials-setup.md
git commit -m "feat: useTestimonials hook + Google Sheets setup instructions"
```

---

### Task 14: `TestimonialCarousel` component

**Files:**
- Create: `src/components/ui/TestimonialCarousel.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState, useEffect } from 'react'
import type { Testimonial } from '../../hooks/useTestimonials'

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setActive(prev => (prev + 1) % testimonials.length)
        setFading(false)
      }, 400)
    }, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (testimonials.length === 0) return null

  const current = testimonials[active]

  return (
    <div className="py-12 px-6 md:px-12 text-center max-w-2xl mx-auto">
      <div
        className="transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)' }}
      >
        <svg
          className="mx-auto mb-4 text-teal/40"
          width="36"
          height="28"
          viewBox="0 0 36 28"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 28V17.5C0 7.833 5.167 2.167 15.5 0L17 3C11.5 4.333 8.667 7.333 8.5 12H16V28H0ZM20 28V17.5C20 7.833 25.167 2.167 35.5 0L37 3C31.5 4.333 28.667 7.333 28.5 12H36V28H20Z" />
        </svg>
        <blockquote className="font-body text-lg text-ink leading-relaxed mb-4 italic">
          "{current.quote}"
        </blockquote>
        <p className="font-display font-bold text-teal text-sm uppercase tracking-wider">
          {current.firstName} · {current.programme}
        </p>
      </div>

      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false) }, 300) }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === active ? 'bg-teal w-4' : 'bg-border hover:bg-teal/40'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/TestimonialCarousel.tsx
git commit -m "feat: TestimonialCarousel auto-rotating quote component"
```

---

### Task 15: Redesign Impact Dashboard page

**Files:**
- Modify: `src/pages/ImpactDashboard.tsx`

- [ ] **Step 1: Rewrite the ImpactDashboard page**

Replace the entire contents of `src/pages/ImpactDashboard.tsx`:

```tsx
import { Helmet } from 'react-helmet-async'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import { StoryBar } from '../components/ui/StoryBar'
import { TestimonialCarousel } from '../components/ui/TestimonialCarousel'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { useTestimonials } from '../hooks/useTestimonials'

const TEAL_PALETTE = ['#376A6B', '#5A9798', '#E0EDEE']

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-ink/10 rounded-card" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-muted rounded-card" />)}
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-8 text-center">
      <p className="font-body text-ink-light">{message}</p>
      <p className="font-body text-sm text-ink-light mt-2">
        Please check back soon, or{' '}
        <a href="/contact" className="text-teal hover:underline">contact us</a> if the issue persists.
      </p>
    </div>
  )
}

export default function ImpactDashboard() {
  const { data, loading, error } = useGoogleSheets()
  const testimonials = useTestimonials()

  const maxProgramme = data ? Math.max(...data.byProgramme.map(p => p.participants), 1) : 1

  return (
    <>
      <Helmet>
        <title>Our Impact — Lift Flintshire CIC</title>
        <meta name="description" content="Live impact data from Lift Flintshire CIC — total participants, sessions delivered, age and gender breakdowns across all programmes." />
        <meta property="og:title" content="Our Impact — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <SectionWrapper variant="dark" innerClassName="pt-28 md:pt-36 pb-16 md:pb-24">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Transparency &amp; accountability
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Our Impact</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          We believe in being open about the difference we're making. Here's a live view of our
          programme data — updated directly from our session records.
        </p>
      </SectionWrapper>

      {loading && (
        <SectionWrapper variant="muted">
          <LoadingSkeleton />
        </SectionWrapper>
      )}
      {error && (
        <SectionWrapper variant="muted">
          <ErrorState message={error} />
        </SectionWrapper>
      )}

      {data && (
        <>
          {/* Headline stat panel */}
          <section className="bg-ink py-20 md:py-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="font-body font-semibold text-[11px] uppercase tracking-[0.16em] text-teal mb-6">
                Since we started
              </p>
              <p className="font-display font-black text-white uppercase leading-none mb-2"
                 style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}>
                <AnimatedCounter value={data.totalParticipants} className="text-teal" />
              </p>
              <p className="font-body text-xl text-white/60 mb-12">
                people have moved with us
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                <div className="bg-white/5 ring-1 ring-white/10 rounded-[14px] p-6 text-center">
                  <p className="font-display font-black text-teal text-[clamp(32px,4vw,48px)] leading-none mb-1">
                    <AnimatedCounter value={data.totalSessions} />
                  </p>
                  <p className="font-body text-sm text-white/60">Sessions delivered</p>
                </div>
                <div className="bg-white/5 ring-1 ring-white/10 rounded-[14px] p-6 text-center">
                  <p className="font-display font-black text-teal text-[clamp(32px,4vw,48px)] leading-none mb-1">
                    <AnimatedCounter value={data.activeThisMonth} />
                  </p>
                  <p className="font-body text-sm text-white/60">Active this month</p>
                </div>
              </div>
            </div>
          </section>

          {/* Story bars — participants by programme */}
          <SectionWrapper variant="light" reveal>
            <h2 className="font-display font-extrabold text-h2 text-ink mb-10">
              Participants by Programme
            </h2>
            <div className="space-y-5 max-w-2xl">
              {data.byProgramme.map((p, i) => (
                <StoryBar
                  key={p.name}
                  label={p.name}
                  value={p.participants}
                  max={maxProgramme}
                  colour={i === 0 ? '#376A6B' : i === 1 ? '#5A9798' : i === 2 ? '#2D5657' : '#4A8485'}
                />
              ))}
            </div>
          </SectionWrapper>

          {/* Monthly trend + gender breakdown */}
          <SectionWrapper variant="muted" reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly trend line */}
              {data.byMonth.length > 1 && (
                <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
                  <h2 className="font-display font-bold text-h3 text-ink mb-6">Participant Growth</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.byMonth} margin={{ left: -10 }}>
                      <XAxis dataKey="name" tick={{ fontFamily: 'DM Sans', fontSize: 11 }} />
                      <YAxis tick={{ fontFamily: 'DM Sans', fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="participants"
                        stroke="#376A6B"
                        strokeWidth={2}
                        dot={{ fill: '#376A6B', strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gender breakdown pie */}
              <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
                <h2 className="font-display font-bold text-h3 text-ink mb-6">Gender Breakdown</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.byGender}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                    >
                      {data.byGender.map((_, index) => (
                        <Cell key={index} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Age breakdown */}
              <div className="bg-surface rounded-card border border-border p-6 shadow-sm lg:col-span-2">
                <h2 className="font-display font-bold text-h3 text-ink mb-6">Age Breakdown</h2>
                <div className="space-y-4">
                  {(() => {
                    const maxAge = Math.max(...data.byAge.map(a => a.participants), 1)
                    return data.byAge.map((a, i) => (
                      <StoryBar
                        key={a.name}
                        label={a.name}
                        value={a.participants}
                        max={maxAge}
                        colour={i % 2 === 0 ? '#376A6B' : '#5A9798'}
                      />
                    ))
                  })()}
                </div>
              </div>
            </div>
          </SectionWrapper>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <SectionWrapper variant="light" reveal>
              <h2 className="font-display font-extrabold text-h2 text-ink mb-2 text-center">
                Community Voices
              </h2>
              <p className="font-body text-sm text-ink-light text-center mb-8">
                What our participants say about our programmes.
              </p>
              <div className="bg-teal-pale rounded-[20px] ring-1 ring-teal/10">
                <TestimonialCarousel testimonials={testimonials} />
              </div>
            </SectionWrapper>
          )}

          {/* Data note */}
          <SectionWrapper variant="muted" innerClassName="py-8">
            <p className="font-body text-xs text-ink-light text-center">
              Data sourced from Lift Flintshire CIC programme records via Google Sheets.
              Last updated: {data.lastUpdated}.
              {!import.meta.env.VITE_GOOGLE_SHEET_ID && ' (Currently showing sample data — connect a Google Sheet to show live figures.)'}
            </p>
          </SectionWrapper>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/impact`. Check:
- Large animated counter counts up to total participants
- Two smaller stat boxes below (sessions, active this month)
- Horizontal story bars appear with an animated grow-in for each programme
- Monthly growth line chart is shown (if data has multiple months)
- Gender breakdown pie chart remains
- Age breakdown is now horizontal story bars instead of bar chart
- Testimonials carousel appears if `Testimonials` tab exists in the Sheet (won't show in dev unless Sheet connected)
- All sections reveal on scroll

- [ ] **Step 3: Commit**

```bash
git add src/pages/ImpactDashboard.tsx
git commit -m "feat: impact dashboard full redesign — headline counter, story bars, growth chart, testimonials"
```

---

## Phase 7 — About Page Cleanup

### Task 16: Replace emoji icons and remove placeholders

**Files:**
- Modify: `src/pages/About.tsx`

- [ ] **Step 1: Replace emoji with SVG icons in the values section**

In `src/pages/About.tsx`, replace the `values` array:

```ts
const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#376A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Community First',
    body: 'Every decision we make starts with the community. We consult, listen, and adapt — because the people we serve know what they need better than anyone.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#376A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'Inclusive by Design',
    body: 'Our programmes are built for everyone. We actively remove barriers — financial, physical, and social — so that nobody in Flintshire is left behind.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#376A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Evidence-Led',
    body: 'We track our impact, publish our data, and use evidence to improve. Our Impact Dashboard is public because we believe in accountability.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#376A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Locally Rooted',
    body: 'We live and work here. Lift Flintshire exists because of Flintshire — and we reinvest everything we earn back into the communities that support us.',
  },
]
```

Update the JSX to render `v.icon` instead of `{v.icon}` as a string:

```tsx
{values.map(v => (
  <div key={v.title} className="bg-surface rounded-card border border-border p-6 shadow-sm">
    <span className="mb-4 block text-teal" aria-hidden="true">{v.icon}</span>
    <h3 className="font-display font-bold text-h3 text-ink mb-2">{v.title}</h3>
    <p className="font-body text-sm text-ink-light leading-relaxed">{v.body}</p>
  </div>
))}
```

- [ ] **Step 2: Hide the team placeholders section**

In `src/pages/About.tsx`, remove the entire "Meet the Team" `<SectionWrapper>` block (from `{/* Team */}` comment to its closing `</SectionWrapper>`). It can be re-added once real team content is ready.

- [ ] **Step 3: Remove the partner logos placeholder section**

In `src/pages/About.tsx`, remove the entire "Our Partners" `<SectionWrapper>` block (from `{/* Partners */}` comment to its closing `</SectionWrapper>`).

- [ ] **Step 4: Verify in browser**

Navigate to `/about`. Values section should show clean SVG icons in teal instead of emoji. Team and partners sections should be gone.

- [ ] **Step 5: Commit**

```bash
git add src/pages/About.tsx
git commit -m "feat: about page — SVG icons, remove placeholder team/partner sections"
```

---

## Phase 8 — Multi-Step Questionnaire

### Task 17: `ProgressBar` component

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
interface ProgressBarProps {
  current: number
  total: number
  labels?: string[]
}

export function ProgressBar({ current, total, labels }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="font-body text-xs text-ink-light">
          Step {current} of {total}
          {labels?.[current - 1] ? ` — ${labels[current - 1]}` : ''}
        </span>
        <span className="font-body text-xs font-medium text-teal">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProgressBar.tsx
git commit -m "feat: multi-step ProgressBar component"
```

---

### Task 18: Rewrite Questionnaire as 4-step form

**Files:**
- Modify: `src/pages/Questionnaire.tsx`

- [ ] **Step 1: Rewrite the Questionnaire page**

The form is split into 4 steps:
1. Which session?
2. Rate your experience
3. Your thoughts (free text)
4. Optional contact details

Replace the entire file contents of `src/pages/Questionnaire.tsx`:

```tsx
import { useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'

type FormState = 'idle' | 'submitting' | 'success' | 'error'
type Rating = '1' | '2' | '3' | '4' | '5' | ''

const inputClass =
  'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'

const STEP_LABELS = ['Which session?', 'Rate your experience', 'Your thoughts', 'Your details']

async function submitNetlifyForm(data: Record<string, string>) {
  const body = new URLSearchParams({ 'form-name': 'programme-questionnaire', ...data }).toString()
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Submit failed')
}

function StarRating({ name, label, required }: { name: string; label: string; required?: boolean }) {
  const [selected, setSelected] = useState<Rating>('')
  const [hovered, setHovered] = useState<Rating>('')
  const labels: Record<string, string> = { '1': 'Poor', '2': 'Fair', '3': 'Good', '4': 'Very good', '5': 'Excellent' }

  return (
    <div>
      <p className={labelClass}>
        {label}
        {required && <span className="text-teal font-medium"> *</span>}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {(['1', '2', '3', '4', '5'] as Rating[]).map(val => {
          const active = hovered ? Number(val) <= Number(hovered) : Number(val) <= Number(selected)
          return (
            <button
              key={val}
              type="button"
              aria-label={`${val} star${val !== '1' ? 's' : ''} — ${labels[val]}`}
              onClick={() => setSelected(val)}
              onMouseEnter={() => setHovered(val)}
              onMouseLeave={() => setHovered('')}
              className="focus:outline-none focus:ring-2 focus:ring-teal rounded transition-transform duration-150 hover:scale-110 active:scale-95"
            >
              <svg
                width="28" height="28" viewBox="0 0 24 24"
                fill={active ? '#376A6B' : 'none'}
                stroke={active ? '#376A6B' : '#CBD5E1'}
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )
        })}
        {(hovered || selected) && (
          <span className="font-body text-xs text-ink-light ml-2">{labels[hovered || selected]}</span>
        )}
      </div>
      <input type="hidden" name={name} value={selected} required={required} />
    </div>
  )
}

function Step1({ onNext }: { onNext: (data: Record<string, string>) => void }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onNext(Object.fromEntries(fd.entries()) as Record<string, string>)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="q-programme" className={labelClass}>
          Which programme are you giving feedback on? <span className="text-teal font-medium">*</span>
        </label>
        <select id="q-programme" name="programme" required className={inputClass}>
          <option value="">Select a programme</option>
          <option value="couch-to-5k">Couch to 5K</option>
          <option value="womens-run-club">Women's Run Club</option>
          <option value="stay-strong">Stay Strong</option>
          <option value="run-club">Flintshire Run Club</option>
          <option value="weightlifting">Flintshire Weightlifting Club</option>
        </select>
      </div>
      <div>
        <label htmlFor="q-date" className={labelClass}>
          Approximate date of session <span className="text-teal font-medium">*</span>
        </label>
        <input
          id="q-date" type="date" name="session-date" required
          max={new Date().toISOString().split('T')[0]}
          className={inputClass}
        />
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full">Continue →</Button>
    </form>
  )
}

function Step2({ onNext, onBack }: { onNext: (data: Record<string, string>) => void; onBack: () => void }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onNext(Object.fromEntries(fd.entries()) as Record<string, string>)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5 bg-surface-muted rounded-card p-5 border border-border">
        <p className="font-body font-semibold text-sm text-ink">How would you rate the following?</p>
        <StarRating name="rating-overall" label="Overall session experience" required />
        <StarRating name="rating-coaching" label="Quality of coaching" required />
        <StarRating name="rating-welcome" label="How welcome did you feel?" required />
        <StarRating name="rating-venue" label="Venue / meeting location" />
      </div>
      <div>
        <p className={labelClass}>
          Would you recommend this programme to a friend? <span className="text-teal font-medium">*</span>
        </p>
        <div className="flex gap-6 mt-1">
          {[{ value: 'yes', label: 'Yes, definitely' }, { value: 'maybe', label: 'Possibly' }, { value: 'no', label: 'Probably not' }].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input type="radio" name="would-recommend" value={opt.value} required className="accent-teal h-4 w-4" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">← Back</Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1">Continue →</Button>
      </div>
    </form>
  )
}

function Step3({ onNext, onBack }: { onNext: (data: Record<string, string>) => void; onBack: () => void }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onNext(Object.fromEntries(fd.entries()) as Record<string, string>)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className={labelClass}>Has participating affected your physical or mental wellbeing?</p>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { value: 'improved-both', label: 'Yes — improved both physical and mental wellbeing' },
            { value: 'improved-physical', label: 'Yes — improved physical wellbeing' },
            { value: 'improved-mental', label: 'Yes — improved mental wellbeing' },
            { value: 'no-change', label: 'No noticeable change yet' },
            { value: 'too-early', label: 'Too early to say' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input type="radio" name="wellbeing-impact" value={opt.value} className="accent-teal h-4 w-4 flex-shrink-0" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="q-went-well" className={labelClass}>What did you enjoy most about the session?</label>
        <textarea id="q-went-well" name="what-went-well" rows={3} placeholder="Tell us what worked well…" className={`${inputClass} min-h-[80px] resize-y`} />
      </div>
      <div>
        <label htmlFor="q-improve" className={labelClass}>Is there anything we could improve?</label>
        <textarea id="q-improve" name="improvements" rows={3} placeholder="Honest feedback helps us get better…" className={`${inputClass} min-h-[80px] resize-y`} />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">← Back</Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1">Continue →</Button>
      </div>
    </form>
  )
}

function Step4({
  onSubmit,
  onBack,
  formState,
}: {
  onSubmit: (data: Record<string, string>) => void
  onBack: () => void
  formState: FormState
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit(Object.fromEntries(fd.entries()) as Record<string, string>)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">
          Optional — Leave your details
        </p>
        <p className="font-body text-xs text-ink-light mb-4 leading-relaxed">
          If you'd like us to follow up or contact you about future sessions, share your details below. Entirely optional.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="q-name" className={labelClass}>Name <span className="text-ink-light font-normal">(optional)</span></label>
            <input id="q-name" type="text" name="name" placeholder="Jane Smith" className={inputClass} />
          </div>
          <div>
            <label htmlFor="q-email" className={labelClass}>Email <span className="text-ink-light font-normal">(optional)</span></label>
            <input id="q-email" type="email" name="email" placeholder="jane@example.com" className={inputClass} />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <input
            id="q-contact-consent" type="checkbox" name="contact-consent" value="yes"
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="q-contact-consent" className="font-body text-xs text-ink-light leading-relaxed cursor-pointer">
            I'm happy for Lift Flintshire CIC to use these details to follow up on my feedback or contact me about sessions.
          </label>
        </div>
      </div>
      {formState === 'error' && (
        <p className="font-body text-xs text-red-600 text-center">
          Something went wrong. Please try again or email{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="underline">hello@liftflintshire.co.uk</a>.
        </p>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">← Back</Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={formState === 'submitting'}>
          {formState === 'submitting' ? 'Sending…' : 'Send feedback'}
        </Button>
      </div>
    </form>
  )
}

export default function Questionnaire() {
  const [step, setStep] = useState(1)
  const [formState, setFormState] = useState<FormState>('idle')
  const [collected, setCollected] = useState<Record<string, string>>({})

  const handleNext = useCallback((data: Record<string, string>) => {
    setCollected(prev => ({ ...prev, ...data }))
    setStep(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleBack = useCallback(() => {
    setStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  async function handleSubmit(data: Record<string, string>) {
    setFormState('submitting')
    const all = { ...collected, ...data }
    try {
      await submitNetlifyForm(all)
      setFormState('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setFormState('error')
    }
  }

  return (
    <>
      <Helmet>
        <title>Feedback — Lift Flintshire CIC</title>
        <meta name="description" content="Share your feedback on a Lift Flintshire CIC programme session. Your responses help us keep improving." />
        <meta property="og:title" content="Session Feedback — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SectionWrapper variant="dark" innerClassName="pt-28 md:pt-36 pb-16 md:pb-24">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Help us improve
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Session Feedback</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Takes about 3 minutes. Every piece of feedback shapes how we run our sessions — thank you.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        {formState === 'success' ? (
          <div className="bg-teal-pale rounded-card p-10 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-h2 text-teal mb-3">Thank you!</h2>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Your feedback is genuinely appreciated and helps us keep improving our sessions.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <ProgressBar current={step} total={4} labels={STEP_LABELS} />
            {step === 1 && <Step1 onNext={handleNext} />}
            {step === 2 && <Step2 onNext={handleNext} onBack={handleBack} />}
            {step === 3 && <Step3 onNext={handleNext} onBack={handleBack} />}
            {step === 4 && <Step4 onSubmit={handleSubmit} onBack={handleBack} formState={formState} />}
          </div>
        )}
      </SectionWrapper>

      {/* Hidden Netlify form for bot discovery */}
      <form name="programme-questionnaire" data-netlify="true" hidden>
        <input type="hidden" name="form-name" value="programme-questionnaire" />
        <input type="text" name="programme" />
        <input type="date" name="session-date" />
        <input type="text" name="rating-overall" />
        <input type="text" name="rating-coaching" />
        <input type="text" name="rating-welcome" />
        <input type="text" name="rating-venue" />
        <input type="text" name="would-recommend" />
        <input type="text" name="wellbeing-impact" />
        <textarea name="what-went-well" />
        <textarea name="improvements" />
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="checkbox" name="contact-consent" />
      </form>
    </>
  )
}
```

**Important:** The hidden static form at the bottom is required for Netlify to discover the form fields at build time (Netlify crawls static HTML). Since the form is now dynamic, this hidden form ensures all field names are registered with Netlify.

- [ ] **Step 2: Verify in browser**

Navigate to `/questionnaire`. Check:
- Progress bar shows "Step 1 of 4 — Which session?" with 25% fill
- Step 1: programme dropdown + date picker, Next button advances
- Step 2: star ratings + recommend radio, Back/Next work
- Step 3: wellbeing + free text, Back/Next work
- Step 4: optional name/email/consent, Back + Submit work
- On step transitions, page scrolls to top
- Success state shows after submit (won't actually submit without Netlify)

- [ ] **Step 3: Commit**

```bash
git add src/pages/Questionnaire.tsx src/components/ui/ProgressBar.tsx
git commit -m "feat: questionnaire — 4-step multi-step form with progress bar"
```

---

## Phase 9 — Registration Forms & Wave Dividers

### Task 19: Add "How did you hear about us?" to registration forms

**Files:**
- Modify: `src/components/forms/RegistrationForm.tsx`

- [ ] **Step 1: Add the field after the phone number field**

In `src/components/forms/RegistrationForm.tsx`, add after the phone number `<div>` block (after the closing `</div>` for `${formName}-phone`):

```tsx
<div>
  <label htmlFor={`${formName}-referral`} className={labelClass}>
    How did you hear about us? <span className="text-ink-light font-normal">(optional)</span>
  </label>
  <select id={`${formName}-referral`} name="how-did-you-hear" className={inputClass}>
    <option value="">Select one…</option>
    <option value="instagram">Instagram</option>
    <option value="word-of-mouth">Word of mouth / friend or family</option>
    <option value="gp-referral">GP or health professional referral</option>
    <option value="council">Flintshire County Council</option>
    <option value="search">Web search</option>
    <option value="leaflet">Leaflet or poster</option>
    <option value="other">Other</option>
  </select>
</div>
```

Also add the corresponding field to the static Netlify discovery forms in both `RegisterCouchTo5k.tsx` and `RegisterWomensRunClub.tsx` (if they have any). They don't — the `RegistrationForm` component itself has `data-netlify="true"`, so the field is automatically picked up.

- [ ] **Step 2: Verify in browser**

Navigate to `/register/couch-to-5k`. The "How did you hear about us?" dropdown should appear below the phone number field in the personal information section.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/RegistrationForm.tsx
git commit -m "feat: add 'how did you hear about us' to registration forms"
```

---

### Task 20: Wave dividers at key section transitions

**Files:**
- Create: `src/components/ui/WaveDivider.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create the WaveDivider component**

```tsx
interface WaveDividerProps {
  fromColour: string
  toColour: string
  flip?: boolean
  height?: number
}

export function WaveDivider({ fromColour, toColour, flip = false, height = 60 }: WaveDividerProps) {
  return (
    <div
      style={{
        backgroundColor: toColour,
        marginTop: '-1px',
        marginBottom: '-1px',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          height: `${height}px`,
          width: '100%',
          transform: flip ? 'scaleY(-1)' : undefined,
        }}
      >
        <path
          d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z"
          fill={fromColour}
        />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Add wave dividers to homepage**

In `src/pages/Home.tsx`, add the import:

```tsx
import { WaveDivider } from '../components/ui/WaveDivider'
```

Add a wave between the hero section (dark, `#111111`) and the teal mission strip:

```tsx
{/* Between hero and teal strip */}
<WaveDivider fromColour="#111111" toColour="#376A6B" />
```

Add a wave between the teal strip and the programmes section (muted, `#F0EFEA`):

```tsx
{/* Between teal strip and programmes */}
<WaveDivider fromColour="#376A6B" toColour="#F0EFEA" flip />
```

Add a wave between the dark social strip and the footer (also dark, so this creates a slight organic curve):

These go between the JSX elements — insert them as siblings between the relevant `<SectionWrapper>` / `<section>` elements.

- [ ] **Step 3: Verify in browser**

The homepage should show smooth organic wave transitions between the hero and teal strip, and between the teal strip and the programmes section. The waves add visual flow without disrupting the colour scheme.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/WaveDivider.tsx src/pages/Home.tsx
git commit -m "feat: wave dividers at hero–teal and teal–programmes transitions"
```

---

## Final verification

- [ ] **Run TypeScript build**

```bash
npm run build
```

Expected: zero errors.

- [ ] **Run dev server and do a full page tour**

```bash
npm run dev
```

Check each route:
- `/` — floating nav, dramatic headline, grain overlay, programme cards with hover, scroll reveals, wave dividers
- `/programmes-events` — nav clears hero, programme sections reveal on scroll
- `/impact` — headline counter animation, story bars, trend line, testimonials (if Sheet connected)
- `/about` — SVG icons in values, no placeholder team/partners sections
- `/contact` — form section reveals on scroll
- `/questionnaire` — 4-step form with progress bar, back/forward navigation
- `/register/couch-to-5k` — "how did you hear" field present
- `/register/womens-run-club` — same
- Mobile: hamburger morphs, full-screen overlay with staggered links

- [ ] **Lint check**

```bash
npm run lint
```

Fix any reported issues before deploying.

- [ ] **Final commit**

```bash
git add -A
git commit -m "chore: visual redesign complete — ready for Netlify deployment"
```

---

## Deployment note

This plan intentionally excludes any Netlify deployment steps. All changes work locally via `npm run dev`. When Netlify credits are available:

1. `git push origin main` — Netlify will auto-deploy from the main branch
2. Verify Netlify Forms are detecting all form names in the Netlify dashboard after first deploy
3. If any form submissions arrive before the first deploy, they won't be captured — test each form after deploying
4. The `Testimonials` Google Sheet tab can be populated at any time before or after deploy — the hook fails silently if the tab doesn't exist

---

## Summary of new files

```
src/hooks/useScrollReveal.ts
src/hooks/useCountUp.ts
src/hooks/useTestimonials.ts
src/components/ui/AnimatedCounter.tsx
src/components/ui/StoryBar.tsx
src/components/ui/TestimonialCarousel.tsx
src/components/ui/ProgressBar.tsx
src/components/ui/WaveDivider.tsx
docs/google-sheets-testimonials-setup.md
docs/superpowers/plans/2026-06-01-visual-redesign.md
```
