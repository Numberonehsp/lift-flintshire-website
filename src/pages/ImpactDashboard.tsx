import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { useCountUp } from '../hooks/useCountUp'
import type { MonthPoint } from '../hooks/useGoogleSheets'

const PROGRAMME_COLOURS = ['#376A6B', '#E8713C', '#5A9798', '#B8860B', '#A8CBCC', '#6B5B95']

const AREA_COLOURS: Record<string, string> = {
  Running:      '#E8713C',
  Weightlifting: '#376A6B',
  Community:    '#5A9798',
  Other:        '#B8860B',
}

const IMPACT_AREAS = ['Running', 'Weightlifting', 'Community']

// ── Shared helpers ─────────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-h2 text-ink mb-1">{title}</h2>
      <p className="font-body text-sm text-ink-light leading-relaxed max-w-lg">{subtitle}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-surface rounded-card border border-border" />
        ))}
      </div>
      <div className="h-96 bg-surface rounded-card border border-border mt-8" />
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

// Animated number inside a stat tile
function StatNum({ value, suffix = '', colour }: { value: number; suffix?: string; colour: string }) {
  const { value: count, ref } = useCountUp(value, 1800)
  return (
    <div
      ref={ref}
      className="font-display font-black leading-none"
      style={{ fontSize: 'clamp(44px, 5vw, 64px)', color: colour }}
    >
      {count.toLocaleString()}{suffix}
    </div>
  )
}

// Horizontal stacked bar chart (shared by monthly and area charts)
function StackedBarChart({
  rows,
  keys,
  colours,
  label,
}: {
  rows: MonthPoint[]
  keys: string[]
  colours: (key: string, i: number) => string
  label: string
}) {
  const maxTotal = Math.max(...rows.map(m => m.total), 1)

  return (
    <>
      <div className="space-y-3">
        {rows.map(m => (
          <div key={m.month} className="flex items-center gap-3">
            <div className="w-14 flex-shrink-0 font-body text-xs font-semibold text-ink-light text-right">
              {m.month}
            </div>
            <div className="flex-1 flex h-8 rounded overflow-hidden bg-surface-muted">
              {keys.map((key, i) => {
                const val = typeof m[key] === 'number' ? (m[key] as number) : 0
                const pct = (val / maxTotal) * 100
                return pct > 0 ? (
                  <div
                    key={key}
                    title={`${key}: ${val}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: colours(key, i),
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                ) : null
              })}
            </div>
            <div className="w-10 flex-shrink-0 font-display font-bold text-sm text-teal text-right">
              {m.total}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="w-14" />
        <div className="flex-1 flex justify-between font-body text-[10px] text-ink-light">
          <span>0</span><span>{Math.round(maxTotal / 2)}</span><span>{maxTotal}</span>
        </div>
        <div className="w-10" />
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        <div className="w-14" />
        <div className="flex-1 text-center font-body text-[10px] text-ink-light">{label}</div>
        <div className="w-10" />
      </div>
    </>
  )
}

// ── Monthly Growth (by programme) ──────────────────────────────────────────────

function MonthlyTimeline({ byMonth, allProgrammes }: { byMonth: MonthPoint[]; allProgrammes: string[] }) {
  return (
    <div className="mb-20">
      <SectionHeading
        title="Monthly Growth"
        subtitle="Total participants each month, coloured by programme — showing which sessions drive growth over time."
      />
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        {allProgrammes.map((prog, i) => (
          <div key={prog} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PROGRAMME_COLOURS[i % PROGRAMME_COLOURS.length] }} />
            <span className="font-body text-xs text-ink-light">{prog}</span>
          </div>
        ))}
      </div>
      <StackedBarChart
        rows={byMonth}
        keys={allProgrammes}
        colours={(_, i) => PROGRAMME_COLOURS[i % PROGRAMME_COLOURS.length]}
        label="Participants per month"
      />
    </div>
  )
}

// ── Impact Areas Monthly (Running / Weightlifting / Community) ─────────────────

function ImpactAreasChart({ byAreaMonth }: { byAreaMonth: MonthPoint[] }) {
  const areas = IMPACT_AREAS.filter(a => byAreaMonth.some(m => (m[a] as number) > 0))

  return (
    <div className="mb-20">
      <SectionHeading
        title="Impact Areas Over Time"
        subtitle="How our three pillars — Running, Weightlifting and Community — contribute each month, showing how they work alongside each other."
      />
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        {IMPACT_AREAS.map(area => (
          <div key={area} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: AREA_COLOURS[area] }} />
            <span className="font-body text-xs text-ink-light">{area}</span>
          </div>
        ))}
      </div>
      <StackedBarChart
        rows={byAreaMonth}
        keys={areas}
        colours={(key) => AREA_COLOURS[key] ?? '#999'}
        label="Participants per month"
      />
    </div>
  )
}

// ── Programme Reach ────────────────────────────────────────────────────────────

function ProgrammeReach({ byProgramme, allProgrammes }: { byProgramme: { name: string; participants: number }[]; allProgrammes: string[] }) {
  const max = Math.max(...byProgramme.map(p => p.participants), 1)
  const sorted = [...byProgramme].sort((a, b) => b.participants - a.participants)

  return (
    <div className="mb-20">
      <SectionHeading
        title="Programme Reach"
        subtitle="Total participants supported across each programme since we began recording."
      />
      <div className="space-y-4">
        {sorted.map(p => {
          const idx = allProgrammes.indexOf(p.name)
          const colour = PROGRAMME_COLOURS[idx >= 0 ? idx % PROGRAMME_COLOURS.length : 0]
          const pct = (p.participants / max) * 100
          return (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-44 flex-shrink-0 font-body text-sm text-ink text-right leading-tight">{p.name}</div>
              <div className="flex-1 h-8 bg-surface-muted rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: colour, transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </div>
              <div className="w-12 flex-shrink-0 font-display font-bold text-base text-right" style={{ color: colour }}>
                {p.participants}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="w-44" />
        <div className="flex-1 flex justify-between font-body text-[10px] text-ink-light">
          <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
        </div>
        <div className="w-12" />
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        <div className="w-44" />
        <div className="flex-1 text-center font-body text-[10px] text-ink-light">Total participants</div>
        <div className="w-12" />
      </div>
    </div>
  )
}

// ── Gender & Age breakdown ─────────────────────────────────────────────────────

function DemographicsSection({
  byGender,
  byAge,
}: {
  byGender: { name: string; value: number }[]
  byAge: { name: string; participants: number }[]
}) {
  const totalGender = byGender.reduce((s, g) => s + g.value, 0)
  const totalAge = byAge.reduce((s, a) => s + a.participants, 0)
  const genderColours = ['#376A6B', '#E8713C', '#5A9798']
  const ageColours = ['#376A6B', '#E8713C', '#5A9798', '#B8860B']

  return (
    <div className="mb-20 grid md:grid-cols-2 gap-10">
      {/* Gender */}
      <div>
        <SectionHeading
          title="Gender Breakdown"
          subtitle="Proportion of participants across all sessions."
        />
        <div className="space-y-3">
          {byGender.map((g, i) => {
            const pct = totalGender > 0 ? Math.round((g.value / totalGender) * 100) : 0
            return (
              <div key={g.name}>
                <div className="flex justify-between font-body text-sm text-ink mb-1">
                  <span>{g.name}</span>
                  <span className="font-semibold" style={{ color: genderColours[i] }}>{pct}%</span>
                </div>
                <div className="h-4 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: genderColours[i], transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Age */}
      <div>
        <SectionHeading
          title="Age Breakdown"
          subtitle="Age range of participants across all sessions."
        />
        <div className="space-y-3">
          {byAge.map((a, i) => {
            const pct = totalAge > 0 ? Math.round((a.participants / totalAge) * 100) : 0
            return (
              <div key={a.name}>
                <div className="flex justify-between font-body text-sm text-ink mb-1">
                  <span>{a.name}</span>
                  <span className="font-semibold" style={{ color: ageColours[i] }}>{pct}%</span>
                </div>
                <div className="h-4 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: ageColours[i], transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImpactDashboard() {
  const { data, loading, error } = useGoogleSheets()

  const totalFemale = data?.byGender.find(g => g.name === 'Female')?.value ?? 0
  const pctFemale = data && data.totalParticipants > 0
    ? Math.round((totalFemale / data.totalParticipants) * 100)
    : 0
  const numProgrammes = data?.byProgramme.length ?? 0
  const totalReturning = data ? data.totalParticipants - data.totalNew : 0

  return (
    <>
      <Helmet>
        <title>Our Impact — Lift Flintshire CIC</title>
        <meta name="description" content="Live impact data from Lift Flintshire CIC — total participants, sessions delivered, new vs returning, age and gender breakdowns across all programmes." />
        <meta property="og:title" content="Our Impact — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Transparency &amp; accountability
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Our Impact</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          We believe in being open about the difference we're making. Here's a live view of our programme data — updated directly from our session records.
        </p>
      </SectionWrapper>

      {/* Data */}
      <SectionWrapper variant="muted">
        {loading && <LoadingSkeleton />}
        {error && <ErrorState message={error} />}

        {data && (
          <>
            {/* ── Stat tiles ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">

              {/* Total participants — large */}
              <div className="col-span-2 rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#376A6B' }}>
                <p className="font-body text-sm font-semibold text-white/80">People supported</p>
                <div>
                  <StatNum value={data.totalParticipants} colour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Total participant attendances across all programmes</p>
                </div>
              </div>

              {/* Sessions */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#E8713C' }}>
                <p className="font-body text-sm font-semibold text-white/80">Sessions delivered</p>
                <div>
                  <StatNum value={data.totalSessions} colour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Coached sessions across all programmes</p>
                </div>
              </div>

              {/* Active this month */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#5A9798' }}>
                <p className="font-body text-sm font-semibold text-white/80">Active this month</p>
                <div>
                  <StatNum value={data.activeThisMonth} colour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Participants attending sessions right now</p>
                </div>
              </div>

              {/* New participants */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: '#111111' }}>
                <p className="font-body text-sm font-semibold text-white/70">New participants</p>
                <div>
                  <StatNum value={data.totalNew} colour="white" />
                  <p className="font-body text-xs text-white/50 mt-1">First-time attendees recorded</p>
                </div>
              </div>

              {/* Returning */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: '#E0EDEE' }}>
                <p className="font-body text-sm font-semibold text-teal/80">Returning participants</p>
                <div>
                  <StatNum value={totalReturning} colour="#376A6B" />
                  <p className="font-body text-xs text-teal/60 mt-1">Attendances from returning members</p>
                </div>
              </div>

              {/* % female */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E0D8' }}>
                <p className="font-body text-sm font-semibold text-ink-light">Female participants</p>
                <StatNum value={pctFemale} suffix="%" colour="#376A6B" />
              </div>

              {/* Active programmes */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E0D8' }}>
                <p className="font-body text-sm font-semibold text-ink-light">Active programmes</p>
                <div>
                  <StatNum value={numProgrammes} colour="#376A6B" />
                  <p className="font-body text-xs text-ink-light/60 mt-1">Running across Flintshire</p>
                </div>
              </div>
            </div>

            {/* ── Impact Areas Over Time ───────────────────────── */}
            {data.byAreaMonth.length > 1 && (
              <ImpactAreasChart byAreaMonth={data.byAreaMonth} />
            )}

            {/* ── Monthly Growth by programme ──────────────────── */}
            {data.byMonth.length > 1 && (
              <MonthlyTimeline byMonth={data.byMonth} allProgrammes={data.allProgrammes} />
            )}

            {/* ── Programme Reach ──────────────────────────────── */}
            <ProgrammeReach byProgramme={data.byProgramme} allProgrammes={data.allProgrammes} />

            {/* ── Demographics ─────────────────────────────────── */}
            <DemographicsSection byGender={data.byGender} byAge={data.byAge} />

            {/* ── Data note ────────────────────────────────────── */}
            <p className="font-body text-xs text-ink-light text-center mt-4">
              Data sourced from Lift Flintshire CIC session records via Google Sheets.
              Last updated: {data.lastUpdated}.
              {!import.meta.env.VITE_GOOGLE_SHEET_ID &&
                ' (Currently showing sample data — connect a Google Sheet to show live figures.)'}
            </p>
          </>
        )}
      </SectionWrapper>
    </>
  )
}
