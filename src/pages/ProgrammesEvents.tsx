import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'
import { programmes } from '../data/programmes'
import type { Programme } from '../data/programmes'
import { useContentSheets } from '../hooks/useContentSheets'

function SessionDetails({ sessions }: { sessions: Programme['sessions'] }) {
  return (
    <ul className="space-y-2 mt-4">
      {sessions.map((s, i) => (
        <li key={i} className="flex items-start gap-3 font-body text-sm text-ink-light">
          <svg className="flex-shrink-0 mt-0.5 text-teal" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>
            <strong className="text-ink">{s.day}</strong> · {s.time} · {s.location} ·{' '}
            <span className="text-teal font-medium">{s.cost}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const programmeImages: Record<string, string[]> = {
  'run-club':          ['/images/frc-castle.jpeg', '/images/frc-half-maz.jpeg'],
  'couch-to-5k':       ['/images/c25k-26.jpg'],
  'womens-run-club':   ['/images/women-track-frc-flag.jpg', '/images/women-track-social.jpg'],
  'stay-strong':       ['/images/strong-paul-sled-pull.jpg', '/images/strong-gail-deadlift.jpg'],
  'weightlifting':     ['/images/oly-coaching2.jpg', '/images/oly-coaching-tripext2.jpg'],
  'girls-gym-session': ['/images/oly-ohs.jpg'],
}

const REGISTER_DIRECTLY = ['couch-to-5k', 'womens-run-club', 'youth-strength-conditioning']

// Condenses the full cost string ("4 weeks Free, then £16 per month") into something
// that fits a snapshot card — the exact terms are shown in the programme's own section.
function shortCost(cost: string): string {
  const c = cost.trim()
  if (/^free$/i.test(c)) return 'Free'
  if (/free/i.test(c)) return 'Free to start'
  const price = c.match(/£\d+/)
  return price ? `From ${price[0]}` : c
}

// Quick-jump cards shown at the top of the page so visitors can scan every programme
// and go straight to the one they want instead of scrolling through all of them.
function ProgrammeSnapshot({ programmes }: { programmes: Programme[] }) {
  return (
    <nav aria-label="Programme quick links" className="mt-12 md:mt-14">
      <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
        Jump to a programme
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {programmes.map(p => {
          const cost = p.sessions[0]?.cost
          const isFree = cost ? /free/i.test(cost) : false
          return (
            <li key={p.id}>
              <a
                href={`#${p.id}`}
                className="group flex h-full flex-col justify-between gap-5 rounded-card border border-white/10 bg-white/[0.04] p-4 transition-colors duration-150 hover:border-teal-light hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light"
              >
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.08em] text-teal-light mb-1.5">
                    {p.badge}
                  </p>
                  {/* Not a heading, this is a nav card, and each programme already has an h2 below */}
                  <p className="font-display font-bold text-xl text-white leading-tight">
                    {p.title}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cost && (
                      <span
                        className={`font-body text-[11px] rounded-full px-2 py-0.5 ${
                          isFree ? 'bg-teal/25 text-teal-light' : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {shortCost(cost)}
                      </span>
                    )}
                    {REGISTER_DIRECTLY.includes(p.id) && (
                      <span className="font-body text-[11px] rounded-full px-2 py-0.5 bg-white/10 text-white/70">
                        Register online
                      </span>
                    )}
                  </div>
                  <svg
                    className="flex-shrink-0 text-white/40 transition-all duration-150 group-hover:text-teal-light group-hover:translate-y-0.5"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function ProgrammeSection({ programme, imageLeft = false }: { programme: Programme; imageLeft?: boolean }) {
  const images = programmeImages[programme.id]

  const content = (
    <div className="flex-1">
      <Badge className="mb-4">{programme.badge}</Badge>
      <h2 className="font-display font-extrabold text-h2 text-ink mb-2">{programme.title}</h2>
      <p className="font-body text-lg text-ink-light mb-4 leading-relaxed">{programme.tagline}</p>
      <p className="font-body text-base text-ink-light mb-4 leading-relaxed">{programme.description}</p>
      <h3 className="font-display font-bold text-h3 text-ink mb-1">Who is it for?</h3>
      <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{programme.targetAudience}</p>
      <h3 className="font-display font-bold text-h3 text-ink mb-1">What to expect</h3>
      <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{programme.whatToExpect}</p>
      <h3 className="font-display font-bold text-h3 text-ink mb-1">Sessions</h3>
      <SessionDetails sessions={programme.sessions} />

      {programme.id === 'weightlifting' && (
        <div className="flex items-center gap-3 mt-6 p-4 bg-teal-pale rounded-card border border-teal/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal flex-shrink-0" aria-hidden="true">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <p className="font-body text-sm text-ink-light">
            <strong className="text-ink">Affiliated with British Weightlifting</strong>, our coaches hold British Weightlifting qualifications and our athletes can compete in sanctioned competitions.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {REGISTER_DIRECTLY.includes(programme.id) ? (
          <Button variant="primary" href={`/register/${programme.id}`}>
            Register now, it's free
          </Button>
        ) : programme.id === 'girls-gym-session' ? (
          <Button variant="primary" href="/contact">Contact us to arrange a session for your school</Button>
        ) : (
          <Button variant="primary" href="/contact">Register your interest</Button>
        )}
      </div>
    </div>
  )

  const image = (
    <div className="flex-1 space-y-4">
      {images ? (
        images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${programme.title} session`}
            className="w-full aspect-[4/3] object-cover rounded-card"
            loading="lazy"
          />
        ))
      ) : (
        <ImagePlaceholder aspectRatio="4/3" label={`${programme.title}, photography coming soon`} />
      )}
    </div>
  )

  const mutedIds = ['run-club', 'weightlifting', 'girls-gym-session']

  // scroll-mt keeps the heading clear of the fixed header when jumped to from the snapshot nav
  return (
    <section id={programme.id} className="scroll-mt-24">
      <SectionWrapper variant={mutedIds.includes(programme.id) ? 'muted' : 'light'}>
        <div className={`flex flex-col ${imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-start`}>
          {content}
          {image}
        </div>
      </SectionWrapper>
    </section>
  )
}

export default function ProgrammesEvents() {
  const { sessionsByProgramme } = useContentSheets()

  const programmesWithSessions = programmes.map(p => ({
    ...p,
    sessions: sessionsByProgramme[p.id]?.length ? sessionsByProgramme[p.id] : p.sessions,
  }))

  return (
    <>
      <Seo
        title="Programmes · Lift Flintshire CIC"
        description="Explore our programmes, Stay Strong for the over-60s, Flintshire Run Club, Girls Gym Sessions, Couch to 5K, and Flintshire Weightlifting Club. Open to everyone."
        path="/programmes-events"
      />

      {/* Page hero */}
      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">What we offer</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Our Programmes</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          From strength training for the over-60s to free gym sessions for young women, we have a programme for everyone. All sessions are led by qualified coaches and are fully inclusive.
        </p>

        <ProgrammeSnapshot programmes={programmesWithSessions} />
      </SectionWrapper>

      {programmesWithSessions.map((p, i) => (
        <ProgrammeSection key={p.id} programme={p} imageLeft={i % 2 !== 0} />
      ))}
    </>
  )
}
