import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useContentSheets } from '../hooks/useContentSheets'
import { useTicketAvailability } from '../hooks/useTicketAvailability'

function formatEventDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { events, loading: eventsLoading } = useContentSheets()
  const { statuses, loading: ticketsLoading } = useTicketAvailability(id)

  const event = events.find(e => e.id === id)
  const cancelled = searchParams.get('cancelled') === '1'
  const anyAvailable = statuses.some(s => s.status === 'available')

  if (eventsLoading) {
    return (
      <SectionWrapper variant="light">
        <p className="font-body text-ink-light">Loading…</p>
      </SectionWrapper>
    )
  }

  if (!event) {
    return (
      <>
        <Seo title="Event not found · Lift Flintshire CIC" description="This event may have been removed or the link is incorrect." path="/events" noindex />
        <SectionWrapper variant="light">
          <h1 className="font-display font-bold text-h2 text-ink mb-4">Event not found</h1>
          <p className="font-body text-ink-light mb-6">
            This event may have been removed or the link is incorrect.
          </p>
          <Button variant="primary" href="/events">Back to events</Button>
        </SectionWrapper>
      </>
    )
  }

  return (
    <>
      <Seo
        title={`${event.title} · Lift Flintshire CIC`}
        description={event.description}
        path={`/events/${event.id}`}
      />

      <SectionWrapper variant="dark">
        <Link to="/events" className="font-body text-sm text-white/60 hover:text-white mb-4 inline-block">
          ← All events
        </Link>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">{event.title}</h1>
        <p className="font-body text-lg text-white/70 max-w-2xl leading-relaxed mb-4">{event.description}</p>
        <ul className="font-body text-sm text-white/70 space-y-1">
          <li><strong className="text-white">Date:</strong> {formatEventDate(event.date)}</li>
          {event.time && <li><strong className="text-white">Time:</strong> {event.time}</li>}
          {event.location && <li><strong className="text-white">Location:</strong> {event.location}</li>}
        </ul>
      </SectionWrapper>

      <SectionWrapper variant="light">
        {cancelled && (
          <div className="mb-6 rounded-card border border-amber-300 bg-amber-50 p-4">
            <p className="font-body text-sm text-amber-800">
              Checkout cancelled, your place was not reserved.
            </p>
          </div>
        )}

        <h2 className="font-display font-bold text-h3 text-ink mb-6">Tickets</h2>

        {ticketsLoading ? (
          <p className="font-body text-ink-light">Loading ticket availability…</p>
        ) : statuses.length === 0 ? (
          <p className="font-body text-ink-light">Ticket information for this event isn't available yet.</p>
        ) : !anyAvailable ? (
          <div className="rounded-card border border-border bg-surface-muted p-6 text-center">
            <p className="font-body font-semibold text-ink mb-1">This event is fully booked</p>
            <p className="font-body text-sm text-ink-light">Check back, a place may free up if someone cancels.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statuses.map(({ tier, status }) => (
              <div
                key={tier.tierId}
                className={`flex items-center justify-between gap-4 rounded-card border p-4 ${
                  status === 'available' ? 'border-teal bg-teal-pale' : 'border-border bg-surface opacity-60'
                }`}
              >
                <div>
                  <p className="font-display font-bold text-ink">{tier.label}</p>
                  <p className="font-body text-sm text-ink-light">£{(tier.pricePence / 100).toFixed(2)}</p>
                </div>
                {status === 'available' ? (
                  <Button variant="primary" href={`/events/${event.id}/enter`}>Enter now</Button>
                ) : status === 'sold_out' ? (
                  <Badge>Sold out</Badge>
                ) : (
                  <span className="font-body text-xs text-ink-light text-right max-w-[10rem]">
                    Available once earlier tickets sell out
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="font-body text-xs text-ink-light mt-6">
          Prices include all card and booking fees, no extras at checkout. Tickets are
          non-refundable but may be transferred to another runner; contact{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
            hello@liftflintshire.co.uk
          </a>.
        </p>
      </SectionWrapper>
    </>
  )
}
