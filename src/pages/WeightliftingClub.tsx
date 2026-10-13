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
        <div className="flex flex-col items-center gap-8 lg:flex-row-reverse lg:justify-between lg:gap-16">
          <img
            src="/images/logo-weightlifting-club.svg"
            alt="Flintshire Weightlifting Club logo"
            width={500}
            height={500}
            className="w-40 sm:w-48 lg:w-72 h-auto flex-shrink-0"
          />
          <div>
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
          </div>
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
