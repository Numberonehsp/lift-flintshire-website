import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Badge } from '../components/ui/Badge'
import { responsiveImage } from '../lib/images'

const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Community First',
    body: 'Every decision we make starts with the community. We consult, listen, and adapt, because the people we serve know what they need better than anyone.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
    title: 'Inclusive by Design',
    body: 'Our programmes are built for everyone. We actively remove barriers, financial, physical, and social, so that nobody in Flintshire is left behind.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
        <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
        <line x1="2" y1="20" x2="22" y2="20" strokeLinecap="round" />
      </svg>
    ),
    title: 'Evidence-Led',
    body: 'We track our impact, publish our data, and use evidence to improve. Our Impact Dashboard is public because we believe in accountability.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Locally Rooted',
    body: 'We live and work here. Lift Flintshire exists because of Flintshire, and we reinvest everything we earn back into the communities that support us.',
  },
]

export default function About() {
  return (
    <>
      <Seo
        title="About Us · Lift Flintshire CIC"
        description="Learn about Lift Flintshire CIC, our story, values, and the team behind our community strength, fitness, and wellbeing programmes in North Wales."
        path="/about"
      />

      {/* Hero */}
      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Who we are</p>
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
              Lift Flintshire CIC was founded by people who believed that access to quality fitness and wellbeing support shouldn't depend on how much money you have or where you live. We saw a gap in Flintshire, communities with real need but limited provision, and we decided to do something about it.
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed mb-4">
              Starting with a single Stay Strong session for older adults in Mold, we've grown into a multi-programme organisation delivering hundreds of sessions each year across the county. Every programme we run is designed to be genuinely inclusive, not just in name, but in practice.
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed">
              As a Community Interest Company, our asset lock means that any surplus we generate is reinvested into the organisation. We exist to serve Flintshire, full stop.
            </p>
          </div>
          <div className="flex-1 w-full space-y-4">
            <img
              {...responsiveImage('/images/strong-paul-josh-coaching.jpg')}
              sizes="(min-width: 1024px) 512px, 100vw"
              width={1600}
              height={1200}
              alt="Lift Flintshire coach working with a participant"
              className="w-full aspect-[4/3] object-cover rounded-card"
              loading="lazy"
            />
            <img
              {...responsiveImage('/images/frc-park-run.jpeg')}
              sizes="(min-width: 1024px) 512px, 100vw"
              width={1600}
              height={1200}
              alt="Flintshire Run Club at a local parkrun"
              className="w-full aspect-[4/3] object-cover rounded-card"
              loading="lazy"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Objectives */}
      <SectionWrapper variant="light">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Our aim</p>
          <h2 className="font-display font-extrabold text-h2 text-ink mb-6">
            Four objectives
          </h2>
          <p className="font-body text-lg text-ink-light leading-relaxed">
            Our aim is simple: to improve the health, strength, and wellbeing of people across Flintshire by making fitness genuinely accessible, regardless of age, ability, income, or experience. We do this through four objectives.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
            <p className="font-display font-black text-h3 text-teal mb-2">01</p>
            <h3 className="font-display font-bold text-h3 text-ink mb-2">Reach underserved groups</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Deliver programmes for people who are too often left out of fitness spaces: older adults through Stay Strong, complete beginners through Couch to 5K, and women and girls through our Women's Run Club and Girls Gym Sessions.
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
              Create spaces where people connect as well as move: social running groups, group strength sessions, and clubs where no one is left behind, whatever pace or level they're starting from.
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

      {/* Values */}
      <SectionWrapper variant="muted">
        <h2 className="font-display font-extrabold text-h2 text-ink mb-10 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(v => (
            <div key={v.title} className="bg-surface rounded-card border border-border p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-pale flex items-center justify-center text-teal mb-4">
                {v.icon}
              </div>
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
            A Community Interest Company (CIC) is a special type of limited company designed for organisations that want to use their profits and assets for the public good. Unlike a charity, a CIC can trade freely, but like a charity, it is legally required to demonstrate community benefit.
          </p>
          <p className="font-body text-base text-ink-light leading-relaxed mb-4">
            The key feature of a CIC is the <strong className="text-ink">asset lock</strong>: our assets and profits must be used for community benefit and cannot be distributed to shareholders. This gives funders and partners confidence that every pound invested in Lift Flintshire goes back into the work.
          </p>
          <p className="font-body text-base text-ink-light leading-relaxed">
            CICs are regulated by the CIC Regulator and Companies House. We publish annual impact reports and welcome scrutiny of our work.
          </p>
        </div>
      </SectionWrapper>
    </>
  )
}
