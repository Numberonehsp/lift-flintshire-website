import type { ReactNode } from 'react'
import { SectionWrapper } from '../layout/SectionWrapper'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'
import type { Programme } from '../../data/programmes'

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
  'run-club':            ['/images/frc-castle.jpeg', '/images/frc-half-maz.jpeg'],
  'couch-to-5k':         ['/images/c25k-26.jpg'],
  'womens-run-club':     ['/images/women-track-frc-flag.jpg', '/images/women-track-social.jpg'],
  'stay-strong':         ['/images/strong-paul-sled-pull.jpg', '/images/strong-gail-deadlift.jpg'],
  'weightlifting':       ['/images/oly-coaching2.jpg', '/images/oly-coaching-tripext2.jpg'],
  'youth-weightlifting': ['/images/oly-coaching.jpg'],
  'girls-gym-session':   ['/images/oly-ohs.jpg'],
}

export interface ProgrammeAction {
  label: string
  href: string
}

interface ProgrammeSectionProps {
  programme: Programme
  /** Primary and optional secondary action buttons. */
  actions: ProgrammeAction[]
  imageLeft?: boolean
  muted?: boolean
  children?: ReactNode
}

export function ProgrammeSection({
  programme,
  actions,
  imageLeft = false,
  muted = false,
  children,
}: ProgrammeSectionProps) {
  const images = programmeImages[programme.id]

  const content = (
    <div className="flex-1">
      <Badge className="mb-4">{programme.badge}</Badge>
      <h2 className="font-display font-extrabold text-h2 text-ink mb-2">{programme.title}</h2>
      <p className="font-body text-lg text-ink-light mb-4 leading-relaxed">{programme.tagline}</p>
      <p className="font-body text-base text-ink-light mb-4 leading-relaxed">{programme.description}</p>
      <p className="font-display font-bold text-h3 text-ink mb-1">Who is it for?</p>
      <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{programme.targetAudience}</p>
      <p className="font-display font-bold text-h3 text-ink mb-1">What to expect</p>
      <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{programme.whatToExpect}</p>
      <p className="font-display font-bold text-h3 text-ink mb-1">Sessions</p>
      <SessionDetails sessions={programme.sessions} />
      {children}
      <div className="mt-6 flex flex-wrap gap-3">
        {actions.map((a, i) => (
          <Button key={a.href} variant={i === 0 ? 'primary' : 'outline'} href={a.href}>
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  )

  const image = (
    <div className="flex-1 space-y-4 w-full">
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

  return (
    <section id={programme.id} className="scroll-mt-24">
      <SectionWrapper variant={muted ? 'muted' : 'light'}>
        <div className={`flex flex-col ${imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-start`}>
          {content}
          {image}
        </div>
      </SectionWrapper>
    </section>
  )
}
