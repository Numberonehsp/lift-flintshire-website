import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { programmes } from '../data/programmes'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import type { HeroStat } from '../hooks/useGoogleSheets'
import { useContentSheets } from '../hooks/useContentSheets'

const programmeImages: Record<string, string> = {
  'run-club': '/images/run-club-1.jpeg',
  'couch-to-5k':    '/images/c25k26.jpeg',
  'womens-run-club': '/images/women-track-frc-flag.jpeg',
  'stay-strong':     '/images/paul-sled-pull.jpeg',
  'weightlifting':   '/images/oly-coaching2.jpeg',
}

function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="border-t border-white/10 mt-10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map(s => (
        <StatCard key={s.label} value={s.value} label={s.label} />
      ))}
    </div>
  )
}

export default function Home() {
  const { data: sheetsData } = useGoogleSheets()
  const { events } = useContentSheets()
  const heroStats = sheetsData?.heroStats ?? []
  const upcomingEvents = events.slice(0, 3)

  return (
    <>
      <Helmet>
        <title>Lift Flintshire CIC — Community Strength, Fitness &amp; Wellbeing</title>
        <meta name="description" content="Lift Flintshire CIC delivers inclusive strength, fitness, and wellbeing programmes across Flintshire, North Wales. Open to everyone, regardless of age or ability." />
        <meta property="og:title" content="Lift Flintshire CIC — Community Strength, Fitness & Wellbeing" />
        <meta property="og:description" content="Building stronger communities, one session at a time. Stay Strong, Flintshire Run Club, and Flintshire Weightlifting Club." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <section className="bg-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
            Strength · Fitness · Wellbeing · Flintshire
          </p>
          <h1 className="font-display font-black text-hero text-white uppercase leading-none mb-6">
            Lifting<br />
            <span className="text-teal">Communities</span><br />
            Together
          </h1>
          <p className="font-body text-lg text-white/70 leading-relaxed max-w-xl mb-8">
            Lift Flintshire CIC delivers inclusive strength, fitness, and wellbeing programmes across Flintshire — open to everyone, regardless of age or ability. We believe movement changes lives.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" href="/programmes-events" size="lg">View our programmes</Button>
            <Button variant="outline" href="/contact" size="lg" className="border-white/40 text-white hover:bg-white/10">Get in touch</Button>
          </div>
          {heroStats.length > 0 && <HeroStats stats={heroStats} />}
        </div>
      </section>

      {/* Mission strip */}
      <SectionWrapper variant="teal" innerClassName="text-center">
        <h2 className="font-display font-extrabold text-h2 text-white mb-4">
          Building stronger communities,<br className="hidden md:block" /> one session at a time.
        </h2>
        <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
          We're a Community Interest Company — which means every penny we raise goes back into delivering more sessions, reaching more people, and making Flintshire a healthier place to live.
        </p>
      </SectionWrapper>

      {/* Programmes preview */}
      <SectionWrapper variant="muted">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display font-extrabold text-h2 text-ink">Our Programmes</h2>
          <Link to="/programmes-events" className="font-body font-medium text-sm text-teal hover:underline hidden md:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programmes.map(p => (
            <Card
              key={p.id}
              variant="programme"
              title={p.title}
              description={p.tagline}
              badge={p.badge}
              href={`/programmes-events#${p.id}`}
              imageSrc={programmeImages[p.id]}
            />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" href="/programmes-events">View all programmes</Button>
        </div>
      </SectionWrapper>

      {/* Events preview — only shown when events exist */}
      {upcomingEvents.length > 0 && (
        <SectionWrapper variant="light">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display font-extrabold text-h2 text-ink">Upcoming Events</h2>
            <Link to="/programmes-events#events" className="font-body font-medium text-sm text-teal hover:underline hidden md:block">
              View all events →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <Card
                key={event.id}
                variant="event"
                title={event.title}
                date={event.date}
                time={event.time}
                location={event.location}
                price={event.price}
                description={event.description}
              />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" href="/programmes-events#events">View all events</Button>
          </div>
        </SectionWrapper>
      )}

      {/* Social strip */}
      <SectionWrapper variant="dark" innerClassName="text-center">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Follow our journey</p>
        <h2 className="font-display font-extrabold text-h2 text-white mb-6">
          Stay connected with<br className="hidden md:block" /> the Lift Flintshire community
        </h2>
        <div className="flex justify-center gap-6">
          <a
            href="https://instagram.com/LiftFlintshire"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-body font-semibold text-white/80 hover:text-teal transition-colors min-h-[44px]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>
        </div>
      </SectionWrapper>
    </>
  )
}
