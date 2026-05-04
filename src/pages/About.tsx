import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'
import { Badge } from '../components/ui/Badge'

const values = [
  {
    icon: '🤝',
    title: 'Community First',
    body: 'Every decision we make starts with the community. We consult, listen, and adapt — because the people we serve know what they need better than anyone.',
  },
  {
    icon: '🌍',
    title: 'Inclusive by Design',
    body: 'Our programmes are built for everyone. We actively remove barriers — financial, physical, and social — so that nobody in Flintshire is left behind.',
  },
  {
    icon: '📊',
    title: 'Evidence-Led',
    body: 'We track our impact, publish our data, and use evidence to improve. Our Impact Dashboard is public because we believe in accountability.',
  },
  {
    icon: '📍',
    title: 'Locally Rooted',
    body: 'We live and work here. Lift Flintshire exists because of Flintshire — and we reinvest everything we earn back into the communities that support us.',
  },
]

const team = [
  { name: 'Team Member', role: 'Director' },
  { name: 'Team Member', role: 'Head Coach' },
  { name: 'Team Member', role: 'Programme Coordinator' },
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us — Lift Flintshire CIC</title>
        <meta name="description" content="Learn about Lift Flintshire CIC — our story, values, and the team behind our community strength, fitness, and wellbeing programmes in North Wales." />
        <meta property="og:title" content="About Us — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Who we are</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">About Lift<br />Flintshire</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          We're a not-for-profit Community Interest Company on a mission to make strength, fitness, and wellbeing accessible to everyone in Flintshire.
        </p>
      </SectionWrapper>

      {/* Our story */}
      <SectionWrapper variant="light">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-h2 text-ink mb-6">Our Story</h2>
            <p className="font-body text-base text-ink-light leading-relaxed mb-4">
              Lift Flintshire CIC was founded by people who believed that access to quality fitness and wellbeing support shouldn't depend on how much money you have or where you live. We saw a gap in Flintshire — communities with real need but limited provision — and we decided to do something about it.
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed mb-4">
              Starting with a single Stay Strong session for older adults in Mold, we've grown into a multi-programme organisation delivering hundreds of sessions each year across the county. Every programme we run is designed to be genuinely inclusive — not just in name, but in practice.
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed">
              As a Community Interest Company, our asset lock means that any surplus we generate is reinvested into the organisation. We exist to serve Flintshire — full stop.
            </p>
          </div>
          <div className="flex-1 w-full">
            <ImagePlaceholder aspectRatio="4/3" label="Lift Flintshire in action — photography coming soon" />
          </div>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper variant="muted">
        <h2 className="font-display font-extrabold text-h2 text-ink mb-10 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(v => (
            <div key={v.title} className="bg-surface rounded-card border border-border p-6 shadow-sm">
              <span className="text-3xl mb-4 block" aria-hidden="true">{v.icon}</span>
              <h3 className="font-display font-bold text-h3 text-ink mb-2">{v.title}</h3>
              <p className="font-body text-sm text-ink-light leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* What is a CIC */}
      <SectionWrapper variant="light" className="bg-teal-pale">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4">For funders &amp; referrers</Badge>
          <h2 className="font-display font-extrabold text-h2 text-ink mb-6">What is a Community Interest Company?</h2>
          <p className="font-body text-base text-ink-light leading-relaxed mb-4">
            A Community Interest Company (CIC) is a special type of limited company designed for organisations that want to use their profits and assets for the public good. Unlike a charity, a CIC can trade freely — but like a charity, it is legally required to demonstrate community benefit.
          </p>
          <p className="font-body text-base text-ink-light leading-relaxed mb-4">
            The key feature of a CIC is the <strong className="text-ink">asset lock</strong>: our assets and profits must be used for community benefit and cannot be distributed to shareholders. This gives funders and partners confidence that every pound invested in Lift Flintshire goes back into the work.
          </p>
          <p className="font-body text-base text-ink-light leading-relaxed">
            CICs are regulated by the CIC Regulator and Companies House. We publish annual impact reports and welcome scrutiny of our work.
          </p>
        </div>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper variant="muted">
        <h2 className="font-display font-extrabold text-h2 text-ink mb-10 text-center">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <div key={i} className="rounded-card border border-border bg-surface shadow-sm overflow-hidden">
              <ImagePlaceholder aspectRatio="square" label="Team photo coming soon" />
              <div className="p-4 text-center">
                <h3 className="font-display font-bold text-h3 text-ink">{member.name}</h3>
                <Badge className="mt-2">{member.role}</Badge>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Partners */}
      <SectionWrapper variant="light">
        <h2 className="font-display font-extrabold text-h2 text-ink mb-8 text-center">Our Partners</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-36 h-16 bg-surface-muted border-2 border-dashed border-border rounded-card flex items-center justify-center">
              <span className="font-body text-xs text-ink-light">Partner logo {i}</span>
            </div>
          ))}
        </div>
        <p className="font-body text-xs text-ink-light text-center mt-6">Partner logos to be added.</p>
      </SectionWrapper>
    </>
  )
}
