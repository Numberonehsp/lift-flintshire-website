import { Badge } from './Badge'
import { Button } from './Button'
import { ImagePlaceholder } from './ImagePlaceholder'

// Programme card
interface ProgrammeCardProps {
  variant: 'programme'
  title: string
  description: string
  badge?: string
  href: string
  imageSrc?: string
  imagePosition?: string
}

// Event card
interface EventCardProps {
  variant: 'event'
  title: string
  date: string
  time: string
  location: string
  price: number
  description: string
  onRegister?: () => void
}

// Team card
interface TeamCardProps {
  variant: 'team'
  name: string
  role: string
}

type CardProps = ProgrammeCardProps | EventCardProps | TeamCardProps

function ProgrammeCard({ title, description, badge, href, imageSrc, imagePosition = 'object-center' }: ProgrammeCardProps) {
  return (
    <a
      href={href}
      className="group relative block rounded-card overflow-hidden shadow-sm hover:-translate-y-1.5 transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
      style={{ aspectRatio: '4/3' }}
    >
      {/* Background image */}
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover ${imagePosition} transition-transform duration-500 ease-out group-hover:scale-105`}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-muted flex items-center justify-center">
          <span className="font-body text-xs text-ink-light">Photography coming soon</span>
        </div>
      )}

      {/* Legibility scrim: kept dark enough that title and body text clear WCAG AA
          over any underlying photo, not just the dark ones. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/70 to-ink/20 transition-opacity duration-300 group-hover:opacity-95" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        {badge && (
          <span className="inline-block font-body font-semibold text-[10px] uppercase tracking-[0.1em] text-white bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
            {badge}
          </span>
        )}
        <h3 className="font-display font-bold text-h3 text-white leading-tight mb-1">{title}</h3>
        <p className="font-body text-sm text-white/90 leading-relaxed mb-3 line-clamp-2">{description}</p>
        <span className="font-body text-sm font-semibold text-teal-light group-hover:text-white transition-colors duration-200">
          Find out more →
        </span>
      </div>
    </a>
  )
}

function EventCard({ title, date, time, location, price, description, onRegister }: EventCardProps) {
  const dateObj = new Date(date + 'T00:00:00')
  const day = dateObj.toLocaleDateString('en-GB', { day: 'numeric' })
  const month = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const isFree = price === 0

  return (
    <div className="rounded-card border border-border bg-surface shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-shrink-0 w-12 h-12 bg-teal-pale rounded-lg flex flex-col items-center justify-center">
            <span className="font-display font-black text-teal text-lg leading-none">{day}</span>
            <span className="font-body font-semibold text-teal text-[10px] uppercase tracking-wider">{month}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-h3 text-ink leading-tight">{title}</h3>
            <p className="font-body text-xs text-ink-light mt-1">{time} · {location}</p>
          </div>
          <Badge className="flex-shrink-0">{isFree ? 'Free' : `£${price}`}</Badge>
        </div>
        <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{description}</p>
        <Button variant="primary" size="sm" onClick={onRegister} className="w-full">
          {isFree ? 'Register for free' : 'Register interest'}
        </Button>
        {!isFree && (
          <p className="font-body text-xs text-ink-light text-center mt-2">
            You'll receive a payment link by email after registering
          </p>
        )}
      </div>
    </div>
  )
}

function TeamCard({ name, role }: TeamCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface shadow-sm overflow-hidden">
      <ImagePlaceholder aspectRatio="square" />
      <div className="p-4 text-center">
        <h3 className="font-display font-bold text-h3 text-ink">{name}</h3>
        <Badge className="mt-2">{role}</Badge>
      </div>
    </div>
  )
}

export function Card(props: CardProps) {
  if (props.variant === 'programme') return <ProgrammeCard {...props} />
  if (props.variant === 'event') return <EventCard {...props} />
  return <TeamCard {...props} />
}
