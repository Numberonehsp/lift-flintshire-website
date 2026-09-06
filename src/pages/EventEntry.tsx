import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'
import { useContentSheets } from '../hooks/useContentSheets'
import { useTicketAvailability } from '../hooks/useTicketAvailability'

const inputClass =
  'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'

const WAIVER_TEXT = `Physical activity involves inherent risks. By submitting this form I confirm that:

1. I am voluntarily participating in this Lift Flintshire CIC event and accept responsibility for my own safety.
2. To the best of my knowledge I am medically fit to participate, or have sought appropriate medical advice before doing so.
3. I understand that Lift Flintshire CIC, its coaches, staff, and volunteers shall not be held liable for any injury, illness, loss, or damage sustained during participation, except where caused by their negligence or wilful misconduct.
4. I consent to emergency medical treatment being sought on my behalf in the event of a medical emergency.`

type SubmitState = 'idle' | 'submitting' | 'error' | 'conflict'

export default function EventEntry() {
  const { id } = useParams<{ id: string }>()
  const { events, loading: eventsLoading } = useContentSheets()
  const { statuses, loading: ticketsLoading } = useTicketAvailability(id)
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [hasMedical, setHasMedical] = useState<'yes' | 'no' | ''>('')

  const event = events.find(e => e.id === id)
  const availableTier = statuses.find(s => s.status === 'available')?.tier

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!event || !availableTier) return
    setState('submitting')

    const fd = new FormData(e.currentTarget)
    const fields = Object.fromEntries(fd.entries()) as Record<string, string>

    try {
      const res = await fetch('/api/create-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          eventId: event.id,
          eventTitle: event.title,
          tierId: availableTier.tierId,
        }),
      })
      const json = await res.json() as { url?: string; error?: string }

      if (res.status === 409) {
        setErrorMessage(json.error ?? 'That ticket is no longer available.')
        setState('conflict')
        return
      }
      if (!res.ok || !json.url) {
        setState('error')
        return
      }
      window.location.href = json.url
    } catch {
      setState('error')
    }
  }

  if (eventsLoading || ticketsLoading) {
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
          <Button variant="primary" href="/events">Back to events</Button>
        </SectionWrapper>
      </>
    )
  }

  if (!availableTier) {
    return (
      <>
        <Seo title={`Fully booked · ${event.title}, Lift Flintshire CIC`} description={`There are no tickets currently available for ${event.title}.`} path={`/events/${event.id}`} noindex />
        <SectionWrapper variant="light">
          <h1 className="font-display font-bold text-h2 text-ink mb-4">This event is fully booked</h1>
          <p className="font-body text-ink-light mb-6">
            There are no tickets currently available for {event.title}.
          </p>
          <Button variant="primary" href={`/events/${event.id}`}>Back to event</Button>
        </SectionWrapper>
      </>
    )
  }

  const priceLabel = (availableTier.pricePence / 100).toFixed(2)

  return (
    <>
      <Seo
        title={`Enter · ${event.title}, Lift Flintshire CIC`}
        description={`Book your place at ${event.title}.`}
        path={`/events/${event.id}/enter`}
        noindex
      />

      <SectionWrapper variant="dark">
        <Link to={`/events/${event.id}`} className="font-body text-sm text-white/60 hover:text-white mb-4 inline-block">
          ← Back to event
        </Link>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-2">{event.title}</h1>
        <p className="font-body text-white/70">{availableTier.label}, £{priceLabel}</p>
      </SectionWrapper>

      <SectionWrapper variant="light" innerClassName="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-teal-pale rounded-card p-4 border border-teal/20 mb-6 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-ink">{availableTier.label}</p>
              <p className="font-body text-xs text-ink-light">
                Price includes all card and booking fees, no extras at checkout.
              </p>
            </div>
            <p className="font-display font-black text-teal text-2xl">£{priceLabel}</p>
          </div>

          <h2 className="font-display font-bold text-h3 text-ink mb-4 pb-2 border-b border-border">
            Your details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="first-name" className={labelClass}>First name</label>
              <input id="first-name" type="text" name="first-name" required autoComplete="given-name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="last-name" className={labelClass}>Last name</label>
              <input id="last-name" type="text" name="last-name" required autoComplete="family-name" className={inputClass} />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className={labelClass}>Email address</label>
            <input id="email" type="email" name="email" required autoComplete="email" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="phone" className={labelClass}>Phone number</label>
              <input id="phone" type="tel" name="phone" autoComplete="tel" className={inputClass} />
            </div>
            <div>
              <label htmlFor="date-of-birth" className={labelClass}>Date of birth</label>
              <input
                id="date-of-birth"
                type="date"
                name="date-of-birth"
                required
                max={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="gender" className={labelClass}>Gender (optional)</label>
            <select id="gender" name="gender" className={inputClass}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <h2 className="font-display font-bold text-h3 text-ink mb-4 mt-8 pb-2 border-b border-border">
            Emergency contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="emergency-name" className={labelClass}>Full name</label>
              <input id="emergency-name" type="text" name="emergency-name" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="emergency-phone" className={labelClass}>Phone number</label>
              <input id="emergency-phone" type="tel" name="emergency-phone" required className={inputClass} />
            </div>
          </div>

          <h2 className="font-display font-bold text-h3 text-ink mb-4 mt-8 pb-2 border-b border-border">
            Health &amp; medical declaration
          </h2>

          <div className="mb-4">
            <p className={labelClass}>Do you have any medical conditions we should know about?</p>
            <div className="flex gap-6 mt-1">
              {(['yes', 'no'] as const).map(val => (
                <label key={val} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="has-medical-conditions"
                    value={val}
                    checked={hasMedical === val}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setHasMedical(e.target.value as 'yes' | 'no')}
                    className="accent-teal h-4 w-4"
                  />
                  {val === 'yes' ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
            {hasMedical === 'yes' && (
              <div className="mt-3">
                <label htmlFor="medical-details" className={labelClass}>Please provide details</label>
                <textarea
                  id="medical-details"
                  name="medical-details"
                  rows={3}
                  placeholder="Leave blank if none"
                  className={`${inputClass} min-h-[80px] resize-y`}
                />
              </div>
            )}
          </div>

          <h2 className="font-display font-bold text-h3 text-ink mb-4 mt-8 pb-2 border-b border-border">
            Consents &amp; waiver
          </h2>

          <div className="bg-surface-muted rounded-card p-4 border border-border mb-4">
            <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">
              Participation waiver
            </p>
            <pre className="font-body text-xs text-ink-light leading-relaxed whitespace-pre-wrap mb-4">{WAIVER_TEXT}</pre>
            <div className="flex items-start gap-3">
              <input id="waiver-agreed" type="checkbox" name="waiver-agreed" value="yes" required className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer" />
              <label htmlFor="waiver-agreed" className="font-body text-sm text-ink leading-relaxed cursor-pointer">
                I have read and agree to the participation waiver above.{' '}
                <span className="text-teal font-medium">(Required)</span>
              </label>
            </div>
          </div>

          <div className="bg-surface-muted rounded-card p-4 border border-border mb-4">
            <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">
              Photography &amp; video
            </p>
            <div className="flex items-start gap-3">
              <input id="photo-consent" type="checkbox" name="photo-consent" value="yes" className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer" />
              <label htmlFor="photo-consent" className="font-body text-sm text-ink leading-relaxed cursor-pointer">
                I consent to being photographed or filmed during the event for Lift Flintshire CIC marketing purposes.{' '}
                <span className="text-ink-light font-normal">(Optional)</span>
              </label>
            </div>
          </div>

          <div className="bg-surface-muted rounded-card p-4 border border-border mb-6">
            <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">
              Data protection (GDPR)
            </p>
            <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
              Lift Flintshire CIC will store and process the personal data provided in this form to
              administer your entry. See our{' '}
              <Link to="/privacy" className="text-teal hover:underline">privacy policy</Link> for details.
            </p>
            <div className="flex items-start gap-3">
              <input id="gdpr-consent" type="checkbox" name="gdpr-consent" value="yes" required className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer" />
              <label htmlFor="gdpr-consent" className="font-body text-sm text-ink leading-relaxed cursor-pointer">
                I consent to Lift Flintshire CIC storing and processing my personal data as described above.{' '}
                <span className="text-teal font-medium">(Required)</span>
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === 'submitting'}>
            {state === 'submitting' ? 'Redirecting to secure payment…' : `Pay £${priceLabel} and confirm entry`}
          </Button>

          {state === 'conflict' && (
            <p className="font-body text-sm text-amber-700 text-center mt-3">
              {errorMessage}{' '}
              <button type="button" onClick={() => window.location.reload()} className="underline font-medium">
                Refresh this page
              </button>.
            </p>
          )}
          {state === 'error' && (
            <p className="font-body text-xs text-red-600 text-center mt-3">
              Something went wrong starting checkout. Please try again or email{' '}
              <a href="mailto:hello@liftflintshire.co.uk" className="underline">hello@liftflintshire.co.uk</a>.
            </p>
          )}
        </form>
      </SectionWrapper>
    </>
  )
}
