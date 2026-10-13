import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { ProgrammeSection } from '../components/programmes/ProgrammeSection'
import { useProgrammesWithSessions } from '../components/programmes/useProgrammesWithSessions'

export default function Wellbeing() {
  const programmes = useProgrammesWithSessions('wellbeing')
  const strong = programmes.find(p => p.id === 'stay-strong')
  const girls = programmes.find(p => p.id === 'girls-gym-session')

  return (
    <>
      <Seo
        title="Wellbeing Programmes · Lift Flintshire CIC"
        description="Wellbeing programmes from Lift Flintshire CIC: Stay Strong for adults aged 55 and over, and free Girls Gym Sessions for schools and sports teams."
        path="/wellbeing"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">What else we offer</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Wellbeing Programmes</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Strength and confidence for the people who are too often left out of fitness spaces. All sessions are led by qualified coaches and are fully inclusive.
        </p>
      </SectionWrapper>

      {strong && (
        <ProgrammeSection
          programme={strong}
          actions={[{ label: 'Register your interest', href: '/contact' }]}
        />
      )}
      {girls && (
        <ProgrammeSection
          programme={girls}
          imageLeft
          muted
          actions={[{ label: 'Enquire about a school or team session', href: '/contact?subject=school-team' }]}
        />
      )}
    </>
  )
}
