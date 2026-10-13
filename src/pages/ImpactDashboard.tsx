import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { Testimonial } from '../components/ui/Testimonial'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { useCountUp } from '../hooks/useCountUp'
import { isInProgressMonth } from '../lib/months'
import type { MonthPoint } from '../hooks/useGoogleSheets'

// Distinct hues so adjacent series stay separable for low-vision and colour-blind
// readers (no two near-identical teals). Colour is always paired with a text label.
const PROGRAMME_COLOURS = ['#376A6B', '#E8713C', '#B8860B', '#8A6BB0', '#4A6FA5', '#B5556D']

const AREA_COLOURS: Record<string, string> = {
  Running:       '#E8713C',
  Weightlifting: '#376A6B',
  Community:     '#8A6BB0',
  Other:         '#B8860B',
}

const IMPACT_AREAS = ['Running', 'Weightlifting', 'Community']

// Screen-reader-only equivalent of a chart: the same numbers as a real table.
function ChartDataTable({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: string[]
  rows: (string | number)[][]
}) {
  return (
    <div className="sr-only">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

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

// Animated number inside a stat tile. Screen readers get the final value
// straight away; the counting animation is visual only.
function StatNum({ value, suffix = '', colour }: { value: number; suffix?: string; colour: string }) {
  const { value: count, ref } = useCountUp(value, 1800)
  return (
    <div
      ref={ref}
      className="font-display font-black leading-none"
      style={{ fontSize: 'clamp(44px, 5vw, 64px)', color: colour }}
    >
      <span className="sr-only">{value.toLocaleString()}{suffix}</span>
      <span aria-hidden="true">{count.toLocaleString()}{suffix}</span>
    </div>
  )
}

// Horizontal stacked bar chart (shared by monthly and area charts)
function StackedBarChart({
  rows,
  keys,
  colours,
  label,
  caption,
}: {
  rows: MonthPoint[]
  keys: string[]
  colours: (key: string, i: number) => string
  label: string
  caption: string
}) {
  const maxTotal = Math.max(...rows.map(m => m.total), 1)
  const isPartial = (m: MonthPoint) => isInProgressMonth(m.monthKey as string | undefined)
  const anyPartial = rows.some(isPartial)

  return (
    <>
      <ChartDataTable
        caption={caption}
        columns={['Month', ...keys, 'Total']}
        rows={rows.map(m => [
          isPartial(m) ? `${m.month} (in progress)` : m.month,
          ...keys.map(k => (typeof m[k] === 'number' ? (m[k] as number) : 0)),
          m.total,
        ])}
      />
      <div className="space-y-3" aria-hidden="true">
        {rows.map(m => {
          const partial = isPartial(m)
          return (
            <div key={m.month} className="flex items-center gap-3">
              <div className="w-14 flex-shrink-0 font-body text-xs font-semibold text-ink-light text-right">
                {m.month}
                {partial && <span className="block font-normal text-[10px]">so far</span>}
              </div>
              <div
                className={`flex-1 flex h-8 rounded overflow-hidden bg-surface-muted ${
                  partial ? 'outline outline-2 outline-dashed outline-ink-light/50' : ''
                }`}
              >
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
                      }}
                    />
                  ) : null
                })}
              </div>
              <div className="w-10 flex-shrink-0 font-display font-bold text-sm text-teal text-right">
                {m.total}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-2" aria-hidden="true">
        <div className="w-14" />
        <div className="flex-1 flex justify-between font-body text-[10px] text-ink-light">
          <span>0</span><span>{Math.round(maxTotal / 2)}</span><span>{maxTotal}</span>
        </div>
        <div className="w-10" />
      </div>
      <div className="flex items-center gap-3 mt-0.5" aria-hidden="true">
        <div className="w-14" />
        <div className="flex-1 text-center font-body text-[10px] text-ink-light">{label}</div>
        <div className="w-10" />
      </div>
      {anyPartial && (
        <p className="font-body text-xs text-ink-light text-center mt-3">
          Dashed bar: month still in progress.
        </p>
      )}
    </>
  )
}

// ── Monthly Growth (by programme) ──────────────────────────────────────────────

function MonthlyTimeline({ byMonth, allProgrammes }: { byMonth: MonthPoint[]; allProgrammes: string[] }) {
  return (
    <div>
      <SectionHeading
        title="Attendances by programme"
        subtitle="Attendances each month, coloured by programme, showing which sessions drive growth over time."
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
        label="Attendances per month"
        caption="Attendances by programme: attendances each month broken down by programme."
      />
    </div>
  )
}

// ── Impact Areas Monthly (Running / Weightlifting / Community) ─────────────────

function ImpactAreasChart({ byAreaMonth }: { byAreaMonth: MonthPoint[] }) {
  const areas = IMPACT_AREAS.filter(a => byAreaMonth.some(m => (m[a] as number) > 0))

  return (
    <div className="mb-8">
      <SectionHeading
        title="Impact Areas Over Time"
        subtitle="Attendances each month across our three pillars: Running, Weightlifting and Community."
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
        label="Attendances per month"
        caption="Impact Areas Over Time: monthly attendances split across Running, Weightlifting and Community."
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
        subtitle="Total participant attendances across each programme since we began recording."
      />
      <ChartDataTable
        caption="Programme Reach: total participant attendances per programme."
        columns={['Programme', 'Participants']}
        rows={sorted.map(p => [p.name, p.participants])}
      />
      <div className="space-y-4" aria-hidden="true">
        {sorted.map(p => {
          const idx = allProgrammes.indexOf(p.name)
          const colour = PROGRAMME_COLOURS[idx >= 0 ? idx % PROGRAMME_COLOURS.length : 0]
          const pct = (p.participants / max) * 100
          return (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-44 flex-shrink-0 font-body text-sm text-ink text-right leading-tight">{p.name}</div>
              <div className="flex-1 h-8 bg-surface-muted rounded overflow-hidden">
                <div
                  className="h-full w-full origin-left rounded"
                  style={{ transform: `scaleX(${pct / 100})`, backgroundColor: colour, transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </div>
              <div className="w-12 flex-shrink-0 font-display font-bold text-base text-right" style={{ color: colour }}>
                {p.participants}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-2" aria-hidden="true">
        <div className="w-44" />
        <div className="flex-1 flex justify-between font-body text-[10px] text-ink-light">
          <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
        </div>
        <div className="w-12" />
      </div>
      <div className="flex items-center gap-3 mt-0.5" aria-hidden="true">
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
  const genderColours = ['#376A6B', '#E8713C', '#8A6BB0']
  const ageColours = ['#376A6B', '#E8713C', '#8A6BB0', '#B8860B']

  return (
    <div className="mb-16 grid md:grid-cols-2 gap-10">
      {/* Gender */}
      <div>
        <h3 className="font-display font-bold text-h3 text-ink mb-4">Gender</h3>
        <div className="space-y-3">
          {byGender.map((g, i) => {
            const pct = totalGender > 0 ? Math.round((g.value / totalGender) * 100) : 0
            return (
              <div key={g.name}>
                <div className="flex justify-between font-body text-sm text-ink mb-1">
                  <span>{g.name}</span>
                  <span className="font-semibold" style={{ color: genderColours[i] }}>{pct}%</span>
                </div>
                <div className="h-4 bg-surface-muted rounded-full overflow-hidden" aria-hidden="true">
                  <div
                    className="h-full w-full origin-left rounded-full"
                    style={{ transform: `scaleX(${pct / 100})`, backgroundColor: genderColours[i], transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Age */}
      <div>
        <h3 className="font-display font-bold text-h3 text-ink mb-4">Age</h3>
        <div className="space-y-3">
          {byAge.map((a, i) => {
            const pct = totalAge > 0 ? Math.round((a.participants / totalAge) * 100) : 0
            return (
              <div key={a.name}>
                <div className="flex justify-between font-body text-sm text-ink mb-1">
                  <span>{a.name}</span>
                  <span className="font-semibold" style={{ color: ageColours[i] }}>{pct}%</span>
                </div>
                <div className="h-4 bg-surface-muted rounded-full overflow-hidden" aria-hidden="true">
                  <div
                    className="h-full w-full origin-left rounded-full"
                    style={{ transform: `scaleX(${pct / 100})`, backgroundColor: ageColours[i], transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
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
  const { data, loading, error, isSample } = useGoogleSheets()

  const totalFemale = data?.byGender.find(g => g.name === 'Female')?.value ?? 0
  const pctFemale = data && data.totalParticipants > 0
    ? Math.round((totalFemale / data.totalParticipants) * 100)
    : 0
  const totalAge = data?.byAge.reduce((s, a) => s + a.participants, 0) ?? 0
  const underEighteen = data?.byAge.find(a => a.name === 'Under 18')?.participants ?? 0
  const underEighteenPct = totalAge > 0 ? Math.round((underEighteen / totalAge) * 100) : 0
  const numProgrammes = data?.byProgramme.length ?? 0
  const totalReturning = data ? data.totalParticipants - data.totalNew : 0

  return (
    <>
      <Seo
        title="Our Impact · Lift Flintshire CIC"
        description="Live impact data from Lift Flintshire CIC, total participants, sessions delivered, new vs returning, age and gender breakdowns across all programmes."
        path="/impact"
      />

      {/* Hero */}
      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">
          Transparency &amp; accountability
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Our Impact</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          We believe in being open about the difference we're making. These figures come live from our session records.
        </p>
        {data && (
          <p className="font-body text-xs text-white/60 max-w-xl mt-3">
            Data from Lift Flintshire CIC session records. Last updated: {data.lastUpdated}.
            {isSample &&
              ' (Currently showing sample data, connect a Google Sheet to show live figures.)'}
          </p>
        )}
        <Button variant="primary" onClick={() => window.print()} className="mt-6 print:hidden">
          Download summary (PDF)
        </Button>
      </SectionWrapper>

      {/* Data */}
      <SectionWrapper variant="muted">
        {loading && <LoadingSkeleton />}
        {error && <ErrorState message={error} />}

        {data && (
          <>
            {/* ── Headline numbers ───────────────────────────────── */}
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
                <p className="font-body text-sm font-semibold text-white/70">Programmes delivered</p>
                <StatNum value={numProgrammes} colour="white" />
              </div>
            </div>

            {/* ── Secondary numbers ──────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="rounded-card p-5 flex flex-col justify-between min-h-[110px]" style={{ backgroundColor: '#5A9798' }}>
                <p className="font-body text-sm font-semibold text-white/80">Active this month</p>
                <div>
                  <StatNum value={data.activeThisMonth} colour="white" />
                  <p className="font-body text-xs text-white/60 mt-1">Attendances so far this month</p>
                </div>
              </div>
              <div className="rounded-card p-5 flex flex-col justify-between min-h-[110px]" style={{ backgroundColor: '#111111' }}>
                <p className="font-body text-sm font-semibold text-white/70">New participants</p>
                <div>
                  <StatNum value={data.totalNew} colour="white" />
                  <p className="font-body text-xs text-white/50 mt-1">First-time attendees recorded</p>
                </div>
              </div>
              <div className="rounded-card p-5 flex flex-col justify-between min-h-[110px]" style={{ backgroundColor: '#E0EDEE' }}>
                <p className="font-body text-sm font-semibold text-teal/80">Returning participants</p>
                <div>
                  <StatNum value={totalReturning} colour="#376A6B" />
                  <p className="font-body text-xs text-teal/60 mt-1">Attendances from returning members</p>
                </div>
              </div>
              <div className="rounded-card border border-border bg-surface p-5 flex flex-col justify-between min-h-[110px]">
                <p className="font-body text-sm font-semibold text-ink-light">Female participants</p>
                <StatNum value={pctFemale} suffix="%" colour="#376A6B" />
              </div>
            </div>

            <p className="font-body text-sm text-ink-light max-w-2xl mb-20">
              <strong className="text-ink">How we count.</strong> An attendance is one person at one session, so someone who comes to four sessions counts four times. Session records come from our coaches after each session and are entered by our team.
            </p>

            {/* ── Who we reach ───────────────────────────────────── */}
            <h2 className="font-display font-bold text-h2 text-ink mb-1">Who we reach</h2>
            <p className="font-body text-sm text-ink-light max-w-lg mb-8">
              {pctFemale}% of attendances are by women and girls, and {underEighteenPct}% are by under-18s.
            </p>
            <DemographicsSection byGender={data.byGender} byAge={data.byAge} />

            {/* ── Attendances over time ──────────────────────────── */}
            {data.byAreaMonth.length > 1 && (
              <ImpactAreasChart byAreaMonth={data.byAreaMonth} />
            )}

            {data.byMonth.length > 1 && (
              <details className="mb-20 group">
                <summary className="cursor-pointer font-body font-semibold text-teal min-h-[44px] flex items-center">
                  See attendances by programme
                </summary>
                <div className="pt-6">
                  <MonthlyTimeline byMonth={data.byMonth} allProgrammes={data.allProgrammes} />
                </div>
              </details>
            )}

            {/* ── Programme Reach ──────────────────────────────── */}
            <ProgrammeReach byProgramme={data.byProgramme} allProgrammes={data.allProgrammes} />
          </>
        )}
      </SectionWrapper>

      {/* In their words. print:hidden keeps the placeholder quote out of the funder PDF;
          remove it once a real, permission-cleared testimonial is in place. */}
      <SectionWrapper variant="dark" className="print:hidden">
        <h2 className="font-display font-bold text-h2 text-white text-center mb-8">In their words</h2>
        <Testimonial
          placeholder
          quote="Replace this with a real quote from a participant, with their permission."
          attribution="Participant name, programme"
        />
      </SectionWrapper>
    </>
  )
}
