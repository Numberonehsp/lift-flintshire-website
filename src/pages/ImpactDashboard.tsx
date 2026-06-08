import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { useCountUp } from '../hooks/useCountUp'
import type { MonthPoint } from '../hooks/useGoogleSheets'

const PROGRAMME_COLOURS = ['#376A6B', '#E8713C', '#5A9798', '#B8860B', '#A8CBCC', '#6B5B95']

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Monthly timeline (horizontal stacked bars, extinction-risk style) ──────────

function MonthlyTimeline({
  byMonth,
  allProgrammes,
}: {
  byMonth: MonthPoint[]
  allProgrammes: string[]
}) {
  const maxTotal = Math.max(...byMonth.map(m => m.total), 1)

  return (
    <div className="mb-20">
      <h2 className="font-display font-bold text-h2 text-ink mb-1">Monthly Growth</h2>
      <p className="font-body text-sm text-ink-light mb-8 leading-relaxed max-w-lg">
        Participant numbers each month, broken down by programme.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        {allProgrammes.map((prog, i) => (
          <div key={prog} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: PROGRAMME_COLOURS[i % PROGRAMME_COLOURS.length] }}
            />
            <span className="font-body text-xs text-ink-light">{prog}</span>
          </div>
        ))}
      </div>

      {/* Bar rows */}
      <div className="space-y-3">
        {byMonth.map(m => (
          <div key={m.month} className="flex items-center gap-3">
            {/* Month label */}
            <div className="w-14 flex-shrink-0 font-body text-xs font-semibold text-ink-light text-right">
              {m.month}
            </div>

            {/* Stacked bar */}
            <div className="flex-1 flex h-8 rounded overflow-hidden bg-surface-muted">
              {allProgrammes.map((prog, i) => {
                const val = typeof m[prog] === 'number' ? (m[prog] as number) : 0
                const pct = (val / maxTotal) * 100
                return pct > 0 ? (
                  <div
                    key={prog}
                    title={`${prog}: ${val}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: PROGRAMME_COLOURS[i % PROGRAMME_COLOURS.length],
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                ) : null
              })}
            </div>

            {/* Total */}
            <div className="w-10 flex-shrink-0 font-display font-bold text-sm text-teal text-right">
              {m.total}
            </div>
          </div>
        ))}
      </div>

      {/* X-axis label */}
      <div className="flex items-center gap-3 mt-2">
        <div className="w-14" />
        <div className="flex-1">
          <div className="flex justify-between font-body text-[10px] text-ink-light px-0">
            <span>0</span>
            <span>{Math.round(maxTotal / 2)}</span>
            <span>{maxTotal}</span>
          </div>
        </div>
        <div className="w-10" />
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        <div className="w-14" />
        <div className="flex-1 text-center font-body text-[10px] text-ink-light">
          Participants per month
        </div>
        <div className="w-10" />
      </div>
    </div>
  )
}

// ── Programme reach (horizontal bars) ─────────────────────────────────────────

function ProgrammeReach({
  byProgramme,
  allProgrammes,
}: {
  byProgramme: { name: string; participants: number }[]
  allProgrammes: string[]
}) {
  const max = Math.max(...byProgramme.map(p => p.participants), 1)
  const sorted = [...byProgramme].sort((a, b) => b.participants - a.participants)

  return (
    <div className="mb-20">
      <h2 className="font-display font-bold text-h2 text-ink mb-1">Programme Reach</h2>
      <p className="font-body text-sm text-ink-light mb-8 leading-relaxed max-w-lg">
        Total participants supported across each programme since we began recording.
      </p>
      <div className="space-y-4">
        {sorted.map(p => {
          const idx = allProgrammes.indexOf(p.name)
          const colour = PROGRAMME_COLOURS[idx >= 0 ? idx % PROGRAMME_COLOURS.length : 0]
          const pct = (p.participants / max) * 100
          return (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-40 flex-shrink-0 font-body text-sm text-ink text-right leading-tight">
                {p.name}
              </div>
              <div className="flex-1 h-8 bg-surface-muted rounded overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: colour,
                    transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
              <div
                className="w-12 flex-shrink-0 font-display font-bold text-base text-right"
                style={{ color: colour }}
              >
                {p.participants}
              </div>
            </div>
          )
        })}
      </div>
      {/* X-axis */}
      <div className="flex items-center gap-3 mt-2">
        <div className="w-40" />
        <div className="flex-1 flex justify-between font-body text-[10px] text-ink-light">
          <span>0</span>
          <span>{Math.round(max / 2)}</span>
          <span>{max}</span>
        </div>
        <div className="w-12" />
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        <div className="w-40" />
        <div className="flex-1 text-center font-body text-[10px] text-ink-light">
          Total participants
        </div>
        <div className="w-12" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImpactDashboard() {
  const { data, loading, error } = useGoogleSheets()

  const totalFemale = data
    ? data.byGender.find(g => g.name === 'Female')?.value ?? 0
    : 0
  const pctFemale = data && data.totalParticipants > 0
    ? Math.round((totalFemale / data.totalParticipants) * 100)
    : 0

  const numProgrammes = data ? data.byProgramme.length : 0

  return (
    <>
      <Helmet>
        <title>Impact Dashboard — Lift Flintshire CIC</title>
        <meta
          name="description"
          content="Live impact data from Lift Flintshire CIC — total participants, sessions delivered, age and gender breakdowns across all programmes."
        />
        <meta property="og:title" content="Impact Dashboard — Lift Flintshire CIC" />
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
            {/* ── Colourful stat tiles ────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
              {/* Large tile — total participants */}
              <div className="col-span-2 rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#376A6B' }}>
                <p className="font-body text-sm font-semibold text-white/80">People supported</p>
                <div>
                  <StatTileInner value={data.totalParticipants} textColour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Individuals who've taken part in at least one programme</p>
                </div>
              </div>

              {/* Sessions */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#E8713C' }}>
                <p className="font-body text-sm font-semibold text-white/80">Sessions delivered</p>
                <div>
                  <StatTileInner value={data.totalSessions} textColour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Coached sessions across all programmes</p>
                </div>
              </div>

              {/* Active this month */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[160px]" style={{ backgroundColor: '#5A9798' }}>
                <p className="font-body text-sm font-semibold text-white/80">Active this month</p>
                <div>
                  <StatTileInner value={data.activeThisMonth} textColour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Participants attending sessions right now</p>
                </div>
              </div>

              {/* % female */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: '#111111' }}>
                <p className="font-body text-sm font-semibold text-white/70">Female participants</p>
                <div>
                  <StatTileInner value={pctFemale} suffix="%" textColour="white" />
                </div>
              </div>

              {/* Programmes */}
              <div className="rounded-card p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: '#E0EDEE' }}>
                <p className="font-body text-sm font-semibold text-teal/80">Active programmes</p>
                <div>
                  <StatTileInner value={numProgrammes} textColour="#376A6B" />
                  <p className="font-body text-xs text-teal/60 mt-1">Different programmes running across Flintshire</p>
                </div>
              </div>

              {/* Age groups tile */}
              <div className="col-span-2 rounded-card p-6 min-h-[140px] flex flex-col justify-between" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E0D8' }}>
                <p className="font-body text-sm font-semibold text-ink-light mb-3">Age breakdown</p>
                <div className="flex gap-3 flex-wrap">
                  {data.byAge.map((g, i) => (
                    <div key={g.name} className="flex-1 min-w-[60px] text-center">
                      <div
                        className="font-display font-black leading-none"
                        style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: PROGRAMME_COLOURS[i % PROGRAMME_COLOURS.length] }}
                      >
                        {g.participants}
                      </div>
                      <div className="font-body text-[10px] text-ink-light mt-0.5">{g.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Monthly timeline ────────────────────────────────── */}
            {data.byMonth.length > 1 && (
              <MonthlyTimeline byMonth={data.byMonth} allProgrammes={data.allProgrammes} />
            )}

            {/* ── Programme reach ─────────────────────────────────── */}
            <ProgrammeReach byProgramme={data.byProgramme} allProgrammes={data.allProgrammes} />

            {/* ── Data note ───────────────────────────────────────── */}
            <p className="font-body text-xs text-ink-light text-center mt-4">
              Data sourced from Lift Flintshire CIC programme records via Google Sheets.
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

// Inline animated number (used inside manually constructed tiles above)
function StatTileInner({
  value,
  suffix = '',
  textColour,
}: {
  value: number
  suffix?: string
  textColour: string
}) {
  const { value: count, ref } = useCountUp(value, 1800)
  return (
    <div
      ref={ref}
      className="font-display font-black leading-none"
      style={{ fontSize: 'clamp(44px, 5vw, 64px)', color: textColour }}
    >
      {count.toLocaleString()}{suffix}
    </div>
  )
}
