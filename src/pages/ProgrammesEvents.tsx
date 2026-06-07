import { useState } from 'react'
import type { FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder'
import { programmes } from '../data/programmes'
import type { Programme } from '../data/programmes'
import type { Event } from '../data/events'
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
          <span><strong className="text-ink">{s.day}</strong> · {s.time} · {s.location} · <span className="text-teal font-medium">{s.cost}</span></span>
        </li>
      ))}
    </ul>
  )
}

const programmeImages: Record<string, string[]> = {
  'run-club':        ['/images/frc-castle.jpeg', '/images/frc-half-maz.jpeg'],
  'couch-to-5k':    ['/images/c25k-26.jpg'],
  'womens-run-club': ['/images/women-run-club-2.jpeg', '/images/women-track-social.jpg'],
  'stay-strong':     ['/images/strong-paul-sled-pull.jpg', '/images/strong-gail-deadlift.jpg'],
  'weightlifting':   ['/images/oly-coaching2.jpg', '/images/oly-coaching-tripext2.jpg'],
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
            <strong className="text-ink">Affiliated with British Weightlifting</strong> — our coaches hold British Weightlifting qualifications and our athletes can compete in sanctioned competitions.
          </p>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {programme.id === 'couch-to-5k' && (
          <Button variant="primary" href="/register/couch-to-5k">Register now — it's free</Button>
        )}
        {programme.id === 'womens-run-club' && (
          <Button variant="primary" href="/register/womens-run-club">Register now — it's free</Button>
        )}
        {programme.id !== 'couch-to-5k' && programme.id !== 'womens-run-club' && (
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
        <ImagePlaceholder aspectRatio="4/3" label={`${programme.title} — photography coming soon`} />
      )}
    </div>
  )

  return (
    <section id={programme.id}>
      <SectionWrapper variant={['run-club', 'weightlifting'].includes(programme.id) ? 'muted' : 'light'}>
        <div className={`flex flex-col ${imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-start`}>
          {content}
          {image}
        </div>
      </SectionWrapper>
    </section>
  )
}

function EventRegistrationForm({ event }: { event: Event }) {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    const formData = new FormData(e.currentTarget)
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      })
      setState('success')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-teal-pale rounded-card p-4 text-center">
        <p className="font-body font-semibold text-teal text-sm">
          ✓ {event.price === 0 ? "You're registered!" : 'Request received!'} We'll be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-netlify="true"
      name={`event-${event.id}`}
      className="space-y-3 mt-4"
    >
      <input type="hidden" name="form-name" value={`event-${event.id}`} />
      <input type="hidden" name="event-title" value={event.title} />
      <input
        type="text"
        name="name"
        placeholder="Your name"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px]"
      />
      <input
        type="email"
        name="email"
        placeholder="Your email address"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px]"
      />
      <Button type="submit" variant="primary" size="md" className="w-full" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending...' : event.price === 0 ? 'Register for free' : 'Register interest'}
      </Button>
      {state === 'error' && (
        <p className="font-body text-xs text-red-600 text-center">Something went wrong. Please try again or email us directly.</p>
      )}
      {event.price > 0 && (
        <p className="font-body text-xs text-ink-light text-center">
          You'll receive a payment link by email after registering.
        </p>
      )}
    </form>
  )
}

export default function ProgrammesEvents() {
  const { events, sessionsByProgramme } = useContentSheets()

  const programmesWithSessions = programmes.map(p => ({
    ...p,
    sessions: sessionsByProgramme[p.id]?.length ? sessionsByProgramme[p.id] : p.sessions,
  }))

  return (
    <>
      <Helmet>
        <title>Programmes &amp; Events — Lift Flintshire CIC</title>
        <meta name="description" content="Explore our programmes — Stay Strong for the over-60s, Flintshire Run Club, and Flintshire Weightlifting Club. Plus upcoming events and how to register." />
        <meta property="og:title" content="Programmes & Events — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Page hero */}
      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">What we offer</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">
          Programmes<br />&amp; Events
        </h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          From strength training for the over-60s to competitive weightlifting — we have a programme for everyone. All sessions are led by qualified coaches and are fully inclusive.
        </p>
      </SectionWrapper>

      {/* Programme sections */}
      {programmesWithSessions.map((p, i) => (
        <ProgrammeSection key={p.id} programme={p} imageLeft={i % 2 !== 0} />
      ))}

      {/* Events section */}
      <div id="events">
        <SectionWrapper variant="dark" innerClassName="pb-4">
          <h2 className="font-display font-extrabold text-h2 text-white">Upcoming Events</h2>
          <p className="font-body text-lg text-white/70 mt-2">
            Register below — free events are confirmed instantly, paid events receive a payment link by email.
          </p>
        </SectionWrapper>

        <SectionWrapper variant="muted" innerClassName="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="rounded-card border border-border bg-surface shadow-sm p-5">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-pale rounded-lg flex flex-col items-center justify-center">
                    <span className="font-display font-black text-teal text-lg leading-none">
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric' })}
                    </span>
                    <span className="font-body font-semibold text-teal text-[10px] uppercase tracking-wider">
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-h3 text-ink leading-tight">{event.title}</h3>
                    <p className="font-body text-xs text-ink-light mt-1">{event.time} · {event.location}</p>
                  </div>
                  <Badge>{event.price === 0 ? 'Free' : `£${event.price}`}</Badge>
                </div>
                <p className="font-body text-sm text-ink-light mb-3 leading-relaxed">{event.description}</p>
                <EventRegistrationForm event={event} />
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

    </>
  )
}
