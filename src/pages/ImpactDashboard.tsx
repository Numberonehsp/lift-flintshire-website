import { Helmet } from 'react-helmet-async'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { StatCard } from '../components/ui/StatCard'
import { useGoogleSheets } from '../hooks/useGoogleSheets'

const TEAL_PALETTE = ['#376A6B', '#5A9798', '#E0EDEE']

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-surface-muted rounded-card" />
        ))}
      </div>
      <div className="h-64 bg-surface-muted rounded-card mt-8" />
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

  return (
    <>
      <Helmet>
        <title>Impact Dashboard — Lift Flintshire CIC</title>
        <meta name="description" content="Live impact data from Lift Flintshire CIC — total participants, sessions delivered, age and gender breakdowns across all programmes." />
        <meta property="og:title" content="Impact Dashboard — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Transparency &amp; accountability</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Our Impact</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          We believe in being open about the difference we're making. Here's a live view of our programme data — updated directly from our session records.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="muted">
        {loading && <LoadingSkeleton />}
        {error && <ErrorState message={error} />}

        {data && (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { value: data.totalParticipants.toLocaleString(), label: 'Total participants supported' },
                { value: data.totalSessions.toLocaleString(), label: 'Sessions delivered' },
                { value: data.activeThisMonth.toLocaleString(), label: 'Active participants this month' },
              ].map(s => (
                <div key={s.label} className="bg-surface rounded-card border border-border p-8 text-center shadow-sm">
                  <StatCard value={s.value} label={s.label} />
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Participants by programme */}
              <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
                <h2 className="font-display font-bold text-h3 text-ink mb-6">Participants by Programme</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.byProgramme} margin={{ left: -10 }}>
                    <XAxis dataKey="name" tick={{ fontFamily: 'DM Sans', fontSize: 11 }} />
                    <YAxis tick={{ fontFamily: 'DM Sans', fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <Bar dataKey="participants" fill="#376A6B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gender breakdown */}
              <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
                <h2 className="font-display font-bold text-h3 text-ink mb-6">Gender Breakdown</h2>
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
                    <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Age breakdown */}
              <div className="bg-surface rounded-card border border-border p-6 shadow-sm lg:col-span-2">
                <h2 className="font-display font-bold text-h3 text-ink mb-6">Age Breakdown</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.byAge} margin={{ left: -10 }}>
                    <XAxis dataKey="name" tick={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <YAxis tick={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <Bar dataKey="participants" fill="#5A9798" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data note */}
            <p className="font-body text-xs text-ink-light text-center mt-8">
              Data sourced from Lift Flintshire CIC programme records via Google Sheets.
              Last updated: {data.lastUpdated}.
              {!import.meta.env.VITE_GOOGLE_SHEET_ID && ' (Currently showing sample data — connect a Google Sheet to show live figures.)'}
            </p>
          </>
        )}
      </SectionWrapper>
    </>
  )
}
