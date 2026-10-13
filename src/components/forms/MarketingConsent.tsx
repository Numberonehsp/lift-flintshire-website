interface MarketingConsentProps {
  id: string
  /** What the person is joining, for example "Couch to 5K news and updates". */
  topic?: string
  guardian?: boolean
}

/**
 * Optional, unticked marketing opt-in. Separate from gdpr-consent: only a ticked
 * box (value "yes") lets the server add the person to Brevo.
 */
export function MarketingConsent({ id, topic = 'news, session updates and events', guardian = false }: MarketingConsentProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        name="marketing-consent"
        value="yes"
        className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
      />
      <label htmlFor={id} className="font-body text-sm text-ink leading-relaxed cursor-pointer">
        {guardian
          ? `I am the parent or guardian and I'd like Lift Flintshire CIC to email me ${topic}.`
          : `I'd like Lift Flintshire CIC to email me ${topic}.`}{' '}
        <span className="text-ink-light">Optional. You can unsubscribe at any time from any email.</span>
      </label>
    </div>
  )
}
