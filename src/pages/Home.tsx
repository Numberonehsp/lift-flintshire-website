import { Seo } from '../components/Seo'
import { Link } from 'react-router-dom'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { WaveDivider } from '../components/layout/WaveDivider'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { programmes } from '../data/programmes'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import type { HeroStat } from '../hooks/useGoogleSheets'

const programmeImages: Record<string, string> = {
  'run-club':          '/images/frc-castle.jpeg',
  'couch-to-5k':       '/images/c25k-26.jpg',
  'womens-run-club':   '/images/women-run-club-2.jpeg',
  'stay-strong':       '/images/strong-paul-sled-pull.jpg',
  'weightlifting':     '/images/oly-coaching2.jpg',
  'girls-gym-session': '/images/oly-ohs.jpg',
}

const programmeImagePositions: Record<string, string> = {
  'stay-strong': 'object-top',
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
  const heroStats = sheetsData?.heroStats ?? []

  return (
    <>
      <Seo
        title="Lift Flintshire CIC — Community Strength, Fitness & Wellbeing"
        description="Lift Flintshire CIC delivers inclusive strength, fitness, and wellbeing programmes across Flintshire, North Wales. Open to everyone, regardless of age or ability."
        path="/"
        ogDescription="Building stronger communities, one session at a time. Stay Strong, Flintshire Run Club, and Flintshire Weightlifting Club."
      />

      {/* Hero — atmospheric photo background */}
      <section className="relative bg-ink overflow-hidden">
        <img
          src="/images/frc-castle.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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

      <WaveDivider fromColor="#111111" toColor="#376A6B" />

      {/* Mission strip */}
      <SectionWrapper variant="teal" innerClassName="text-center">
        <h2 className="font-display font-extrabold text-h2 text-white mb-4">
          Building stronger communities,<br className="hidden md:block" /> one session at a time.
        </h2>
        <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
          We're a Community Interest Company — which means every penny we raise goes back into delivering more sessions, reaching more people, and making Flintshire a healthier place to live.
        </p>
      </SectionWrapper>

      <WaveDivider fromColor="#376A6B" toColor="#FAFAF8" />

      {/* Aims and objectives */}
      <SectionWrapper variant="light">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Our aim</p>
          <h2 className="font-display font-extrabold text-h2 text-ink mb-6">
            A stronger, healthier Flintshire — open to everyone
          </h2>
          <p className="font-body text-lg text-ink-light leading-relaxed">
            Our aim is simple: to improve the health, strength, and wellbeing of people across Flintshire by making fitness genuinely accessible — regardless of age, ability, income, or experience. We do this through four objectives.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
            <p className="font-display font-black text-h3 text-teal mb-2">01</p>
            <h3 className="font-display font-bold text-h3 text-ink mb-2">Reach underserved groups</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Deliver programmes for people who are too often left out of fitness spaces — older adults through Stay Strong, complete beginners through Couch to 5K, and women and girls through our Women's Run Club and Girls Gym Sessions.
            </p>
          </div>
          <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
            <p className="font-display font-black text-h3 text-teal mb-2">02</p>
            <h3 className="font-display font-bold text-h3 text-ink mb-2">Remove the barriers to joining in</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Keep cost, location, and confidence from standing in anyone's way. Every programme starts free, sessions run at accessible community venues across the county, and every coach is trained to welcome complete beginners.
            </p>
          </div>
          <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
            <p className="font-display font-black text-h3 text-teal mb-2">03</p>
            <h3 className="font-display font-bold text-h3 text-ink mb-2">Build community, not just fitness</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Create spaces where people connect as well as move — social running groups, group strength sessions, and clubs where no one is left behind, whatever pace or level they're starting from.
            </p>
          </div>
          <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
            <p className="font-display font-black text-h3 text-teal mb-2">04</p>
            <h3 className="font-display font-bold text-h3 text-ink mb-2">Reinvest and prove our impact</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              As a Community Interest Company, every penny we raise goes back into running more sessions and reaching more people. We track and publish our impact data openly, because we believe in accountability.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <WaveDivider fromColor="#FAFAF8" toColor="#F0EFEA" />

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
              imagePosition={programmeImagePositions[p.id]}
            />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" href="/programmes-events">View all programmes</Button>
        </div>
      </SectionWrapper>

      <WaveDivider fromColor="#F0EFEA" toColor="#111111" />

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
