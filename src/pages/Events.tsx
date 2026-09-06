import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Badge } from '../components/ui/Badge'
import { useContentSheets } from '../hooks/useContentSheets'
import type { Event } from '../data/events'

function eventDate(event: Event): Date {
  return new Date(event.date + 'T00:00:00')
}

function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function EventListCard({ event, muted = false }: { event: Event; muted?: boolean }) {
  const date = eventDate(event)
  const day = date.toLocaleDateString('en-GB', { day: 'numeric' })
  const month = date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const priceLabel = event.price === 0 ? 'Free' : `From £${event.price}`

  return (
    <Link
      to={`/events/${event.id}`}
      className={`group block rounded-card border border-border bg-surface shadow-sm overflow-hidden transition-transform duration-200 ${
        muted ? 'opacity-60' : 'hover:-translate-y-1'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-shrink-0 w-12 h-12 bg-teal-pale rounded-lg flex flex-col items-center justify-center">
            <span className="font-display font-black text-teal text-lg leading-none">{day}</span>
            <span className="font-body font-semibold text-teal text-[10px] uppercase tracking-wider">{month}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-h3 text-ink leading-tight">{event.title}</h3>
            <p className="font-body text-xs text-ink-light mt-1">{formatEventDate(date)} · {event.location}</p>
          </div>
          <Badge className="flex-shrink-0">{priceLabel}</Badge>
        </div>
        <p className="font-body text-sm text-ink-light leading-relaxed line-clamp-2">{event.description}</p>
        {!muted && (
          <span className="inline-block font-body text-sm font-semibold text-teal mt-4 group-hover:underline">
            {event.price === 0 ? 'Find out more' : 'View tickets'} →
          </span>
        )}
      </div>
    </Link>
  )
}

export default function Events() {
  const { events, loading } = useContentSheets()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = events
    .filter(e => eventDate(e) >= today)
    .sort((a, b) => eventDate(a).getTime() - eventDate(b).getTime())
  const past = events
    .filter(e => eventDate(e) < today)
    .sort((a, b) => eventDate(b).getTime() - eventDate(a).getTime())

  return (
    <>
      <Seo
        title="Events · Lift Flintshire CIC"
        description="Upcoming community running events from Lift Flintshire CIC in Flintshire, North Wales."
        path="/events"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">What's on</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Events</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Community running events organised by Lift Flintshire CIC, book your place below.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        {loading ? (
          <p className="font-body text-ink-light">Loading events…</p>
        ) : upcoming.length === 0 ? (
          <p className="font-body text-ink-light">
            No events on sale right now, follow us for the next one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(event => (
              <EventListCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {past.length > 0 && (
        <SectionWrapper variant="muted">
          <h2 className="font-display font-bold text-h3 text-ink mb-6">Previous events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map(event => (
              <EventListCard key={event.id} event={event} muted />
            ))}
          </div>
        </SectionWrapper>
      )}
    </>
  )
}
