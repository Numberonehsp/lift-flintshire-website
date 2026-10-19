import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { ProgrammeSection } from '../components/programmes/ProgrammeSection'
import { useProgrammesWithSessions } from '../components/programmes/useProgrammesWithSessions'
import { StickyJoinBar } from '../components/layout/StickyJoinBar'
import { InstagramIcon } from '../components/ui/InstagramIcon'
import { RUN_CLUB_JOIN_URL, RUN_CLUB_INSTAGRAM_URL } from '../data/links'

const MEMBERSHIP_INCLUDES = [
  'A £20 voucher for Run Club merch',
  'Two scheduled runs a week: Tuesday 18:00 at Hawarden (Tinkersdale Car Park) and Thursday 18:00 at Number One HSP, CH5 2TF, unless stated in the WhatsApp group',
  'Regular socials',
  'Weekend club runs, announced in the WhatsApp group',
]

function MembershipIncludes() {
  return (
    <div className="mt-6 p-4 bg-teal-pale rounded-card border border-teal/20">
      <p className="font-display font-bold text-h3 text-ink mb-1">What membership includes</p>
      <p className="font-body text-sm text-ink-light mb-3">
        <strong className="text-ink">Free to try, then £30 a year.</strong> Your annual membership includes:
      </p>
      <ul className="space-y-2">
        {MEMBERSHIP_INCLUDES.map(item => (
          <li key={item} className="flex items-start gap-3 font-body text-sm text-ink-light">
            <svg className="flex-shrink-0 mt-0.5 text-teal" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="font-body text-sm text-ink-light mt-3">
        WhatsApp group details are shared when you join.
      </p>
    </div>
  )
}

export default function RunClub() {
  const programmes = useProgrammesWithSessions('run-club')
  const club = programmes.find(p => p.id === 'run-club')
  const couch = programmes.find(p => p.id === 'couch-to-5k')
  const womens = programmes.find(p => p.id === 'womens-run-club')

  return (
    <>
      <Seo
        title="Flintshire Run Club · Lift Flintshire CIC"
        description="Flintshire Run Club: two scheduled runs a week plus weekend club runs, free to try then £30 a year. Plus Couch to 5K and Women's Track Running. Beginners welcome."
        path="/run-club"
      />

      <SectionWrapper variant="dark">
        <div className="flex flex-col items-center gap-8 lg:flex-row-reverse lg:justify-between lg:gap-16">
          <img
            src="/images/logo-run-club.svg"
            alt="Flintshire Run Club logo"
            width={301}
            height={163}
            className="w-56 sm:w-64 lg:w-80 h-auto flex-shrink-0"
          />
          <div>
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Lift Flintshire</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Flintshire Run Club</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed mb-8">
          Running for every pace, every person. Two scheduled runs a week plus weekend club runs, and our Couch to 5K programme and Women's Track Running sessions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg" href={RUN_CLUB_JOIN_URL}>Join Run Club</Button>
          <Button variant="outline" size="lg" href="#couch-to-5k" className="border-white/40 text-white hover:bg-white/10">
            New to running? Couch to 5K
          </Button>
        </div>
        <a
          href={RUN_CLUB_INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 font-body font-semibold text-white/80 hover:text-teal-light transition-colors"
        >
          <InstagramIcon />
          @FlintshireRunClub
          <span className="sr-only">, Flintshire Run Club on Instagram (opens in a new tab)</span>
        </a>
          </div>
        </div>
      </SectionWrapper>

      {club && (
        <ProgrammeSection
          programme={club}
          actions={[{ label: 'Join Run Club', href: RUN_CLUB_JOIN_URL }]}
        >
          <MembershipIncludes />
        </ProgrammeSection>
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
