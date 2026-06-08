import { Helmet } from 'react-helmet-async'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { useCountUp } from '../hooks/useCountUp'

const TEAL_PALETTE = ['#376A6B', '#5A9798', '#A8CBCC', '#E0EDEE']

// ── Subcomponents ─────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-44 bg-surface rounded-card border border-border" />
        ))}
      </div>
      <div className="h-72 bg-surface rounded-card border border-border mt-12" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 bg-surface rounded-card border border-border" />
        <div className="h-56 bg-surface rounded-card border border-border" />
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

function AnimatedStatCard({
  value,
  label,
  context,
}: {
  value: number
  label: string
  context: string
}) {
  const { value: count, ref } = useCountUp(value, 1800)
  return (
    <div ref={ref} className="bg-surface rounded-card border border-border p-8 text-center shadow-sm flex flex-col items-center">
      <div
        className="font-display font-black text-teal leading-none mb-2"
        style={{ fontSize: 'clamp(52px, 5vw, 72px)' }}
      >
        {count.toLocaleString()}
      </div>
      <p className="font-display font-bold text-xl text-ink mb-2">{label}</p>
      <p className="font-body text-sm text-ink-light leading-relaxed">{context}</p>
    </div>
  )
}

function ProgrammeBar({
  name,
  participants,
  max,
}: {
  name: string
  participants: number
  max: number
}) {
  const pct = max > 0 ? Math.round((participants / max) * 100) : 0
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-body text-sm font-medium text-ink">{name}</span>
        <span className="font-display font-bold text-lg text-teal leading-none">
          {participants.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full"
          style={{
            width: `${pct}%`,
            transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImpactDashboard() {
  const { data, loading, error } = useGoogleSheets()

  const maxProgramme = data
    ? Math.max(...data.byProgramme.map(p => p.participants), 1)
    : 1

  const sortedProgrammes = data
    ? [...data.byProgramme].sort((a, b) => b.participants - a.participants)
    : []

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
            {/* ── Animated key stats ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              <AnimatedStatCard
                value={data.totalParticipants}
                label="People supported"
                context="Individuals who've taken part in at least one Lift Flintshire programme"
              />
              <AnimatedStatCard
                value={data.totalSessions}
                label="Sessions delivered"
                context="Coached sessions run across all programmes since we started tracking"
              />
              <AnimatedStatCard
                value={data.activeThisMonth}
                label="Active this month"
                context="Participants attending sessions in the current calendar month"
              />
            </div>

            {/* ── Programme reach ─────────────────────────────────── */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                <div className="lg:col-span-3">
                  <h2 className="font-display font-bold text-h2 text-ink mb-2">Programme Reach</h2>
                  <p className="font-body text-sm text-ink-light mb-8 leading-relaxed max-w-md">
                    Total participants supported across each programme since we began recording.
                    Every bar represents real people who showed up.
                  </p>
                  <div>
                    {sortedProgrammes.map(p => (
                      <ProgrammeBar
                        key={p.name}
                        name={p.name}
                        participants={p.participants}
                        max={maxProgramme}
                      />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-surface rounded-card border border-border p-6 shadow-sm">
                  <h3 className="font-display font-bold text-h3 text-ink mb-5">By Programme</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={sortedProgrammes} margin={{ left: -10, bottom: 20 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontFamily: 'DM Sans', fontSize: 10, fill: '#444444' }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#444444' }} />
                      <Tooltip
                        contentStyle={{
                          fontFamily: 'DM Sans',
                          fontSize: 12,
                          borderRadius: 8,
                          border: '1px solid #E2E0D8',
                        }}
                      />
                      <Bar dataKey="participants" fill="#376A6B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── Who we serve ────────────────────────────────────── */}
            <h2 className="font-display font-bold text-h2 text-ink mb-8">Who We Serve</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
                <h3 className="font-display font-bold text-h3 text-ink mb-5">Gender Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={data.byGender}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                    >
                      {data.byGender.map((_, index) => (
                        <Cell key={index} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        fontFamily: 'DM Sans',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #E2E0D8',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
                <h3 className="font-display font-bold text-h3 text-ink mb-5">Age Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.byAge} margin={{ left: -10 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: '#444444' }}
                    />
                    <YAxis tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: '#444444' }} />
                    <Tooltip
                      contentStyle={{
                        fontFamily: 'DM Sans',
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #E2E0D8',
                      }}
                    />
                    <Bar dataKey="participants" fill="#5A9798" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

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
