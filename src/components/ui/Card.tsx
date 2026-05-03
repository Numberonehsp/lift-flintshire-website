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

const base = 'rounded-card border border-border bg-surface shadow-sm overflow-hidden'

function ProgrammeCard({ title, description, badge, href }: ProgrammeCardProps) {
  return (
    <div className={base}>
      <ImagePlaceholder aspectRatio="video" />
      <div className="p-5">
        {badge && <Badge className="mb-3">{badge}</Badge>}
        <h3 className="font-display font-bold text-h3 text-ink mb-2">{title}</h3>
        <p className="font-body text-sm text-ink-light mb-4 leading-relaxed">{description}</p>
        <Button variant="ghost" href={href} size="sm">Find out more →</Button>
      </div>
    </div>
  )
}

function EventCard({ title, date, time, location, price, description, onRegister }: EventCardProps) {
  const dateObj = new Date(date)
  const day = dateObj.toLocaleDateString('en-GB', { day: 'numeric' })
  const month = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const isFree = price === 0

  return (
    <div className={base}>
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
    <div className={base}>
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
