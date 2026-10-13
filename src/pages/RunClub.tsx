import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { ProgrammeSection } from '../components/programmes/ProgrammeSection'
import { useProgrammesWithSessions } from '../components/programmes/useProgrammesWithSessions'
import { StickyJoinBar } from '../components/layout/StickyJoinBar'
import { RUN_CLUB_JOIN_URL } from '../data/links'

export default function RunClub() {
  const programmes = useProgrammesWithSessions('run-club')
  const club = programmes.find(p => p.id === 'run-club')
  const couch = programmes.find(p => p.id === 'couch-to-5k')
  const womens = programmes.find(p => p.id === 'womens-run-club')

  return (
    <>
      <Seo
        title="Flintshire Run Club · Lift Flintshire CIC"
        description="Flintshire Run Club: free guided group runs for every pace, plus Couch to 5K and Women's Track Running. Open to everyone, beginners welcome."
        path="/run-club"
      />

      <SectionWrapper variant="dark">
        <div className="flex flex-col items-center gap-8 lg:flex-row-reverse lg:justify-between lg:gap-16">
          <img
            src="/images/logo-run-club.svg"
            alt="Flintshire Run Club logo"
            width={500}
            height={500}
            className="w-40 sm:w-48 lg:w-72 h-auto flex-shrink-0"
          />
          <div>
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Lift Flintshire</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Flintshire Run Club</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed mb-8">
          Running for every pace, every person. Three guided sessions a week, plus our Couch to 5K programme and Women's Track Running sessions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg" href={RUN_CLUB_JOIN_URL}>Join Run Club</Button>
          <Button variant="outline" size="lg" href="#couch-to-5k" className="border-white/40 text-white hover:bg-white/10">
            New to running? Couch to 5K
          </Button>
        </div>
          </div>
        </div>
      </SectionWrapper>

      {club && (
        <ProgrammeSection
          programme={club}
          actions={[{ label: 'Join Run Club', href: RUN_CLUB_JOIN_URL }]}
        />
      )}
      {couch && (
        <ProgrammeSection
          programme={couch}
          imageLeft
          muted
          actions={[{ label: "Register now, it's free", href: '/register/couch-to-5k' }]}
        />
      )}
      {womens && (
        <ProgrammeSection
          programme={womens}
          actions={[{ label: "Register now, it's free", href: '/register/womens-run-club' }]}
        />
      )}

      <StickyJoinBar label="Join Run Club" href={RUN_CLUB_JOIN_URL} />
    </>
  )
}
