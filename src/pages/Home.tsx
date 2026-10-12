import { Seo } from '../components/Seo'
import { Link } from 'react-router-dom'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { WaveDivider } from '../components/layout/WaveDivider'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Testimonial } from '../components/ui/Testimonial'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { buildHeroStats } from '../lib/heroStats'

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

export default function Home() {
  const { data: sheetsData, loading: statsLoading, fallbackHeroStats, isSample } = useGoogleSheets()
  // Never show figures built from the bundled sample rows on the public home page.
  const liveStats = sheetsData && !isSample ? buildHeroStats(sheetsData) : []
  const heroStats = liveStats.length > 0 ? liveStats : fallbackHeroStats

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
          src="/images/women-run-club-1.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">
            Strength · Fitness · Wellbeing · Flintshire
          </p>
          <h1 className="font-display font-black text-hero text-white uppercase leading-none mb-6">
            Lifting<br />
            <span className="text-teal-light">Communities</span><br />
            Together
          </h1>
          <p className="font-body text-lg text-white/70 leading-relaxed max-w-xl mb-8">
            Lift Flintshire CIC delivers inclusive strength, fitness, and wellbeing programmes across Flintshire, open to everyone regardless of age or ability. We believe movement changes lives.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" href="/run-club" size="lg">Join Run Club</Button>
            <Button variant="outline" href="/weightlifting-club" size="lg" className="border-white/40 text-white hover:bg-white/10">Weightlifting Club</Button>
          </div>
          {heroStats.length > 0 ? (
            <HeroStats stats={heroStats} />
          ) : (
            // Hold the stats block's height while the live feed loads to avoid layout shift.
            statsLoading && <div className="mt-10 min-h-[9rem]" aria-hidden="true" />
          )}
        </div>
      </section>

      <WaveDivider fromColor="#111111" toColor="#376A6B" />

      {/* Mission strip */}
      <SectionWrapper variant="teal" innerClassName="text-center">
        <h2 className="font-display font-extrabold text-h2 text-white mb-4">
          Building stronger communities,<br className="hidden md:block" /> one session at a time.
        </h2>
        <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
          We're a Community Interest Company, which means every penny we raise goes back into delivering more sessions, reaching more people, and making Flintshire a healthier place to live.
        </p>
      </SectionWrapper>

      {/* Aims */}
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

      {/* Entry cards */}
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

      {/* Testimonial */}
      <SectionWrapper variant="dark">
        <Testimonial
          placeholder
          quote="Replace this with a real quote from a member, with their permission."
          attribution="Member name, programme"
        />
      </SectionWrapper>

      {/* Social strip */}
      <SectionWrapper variant="dark" innerClassName="text-center">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Follow our journey</p>
        <h2 className="font-display font-extrabold text-h2 text-white mb-6">
          Stay connected with<br className="hidden md:block" /> the Lift Flintshire community
        </h2>
        <div className="flex justify-center gap-6">
          <a
            href="https://instagram.com/LiftFlintshire"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-body font-semibold text-white/80 hover:text-teal-light transition-colors min-h-[44px]"
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
