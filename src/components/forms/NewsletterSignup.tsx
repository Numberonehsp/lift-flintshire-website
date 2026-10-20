import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../ui/Button'
import { newsletterInputError, subscribeSuccessMessage } from '../../lib/newsletter'
import type { NewsletterInputError } from '../../lib/newsletter'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface Props {
  /** `dark` for the footer and dark sections, `light` for light or muted sections. */
  tone?: 'dark' | 'light'
  className?: string
  /** Accessible name for the form; must differ when more than one sign-up form is on a page. */
  label?: string
}

const CONSENT_TEXT =
  "I'd like Lift Flintshire CIC to email me news, session updates and events. You can unsubscribe at any time."

const SUBMIT_ERROR = 'Sorry, we could not sign you up just now. Please try again later.'

async function subscribe(email: string, website: string) {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, 'marketing-consent': 'yes', website }),
  })
  if (!res.ok) throw new Error('Subscribe failed')
  // Older or proxied responses may have no JSON body; that just means the plain success message.
  const data: unknown = await res.json().catch(() => undefined)
  return subscribeSuccessMessage(data)
}

export function NewsletterSignup({ tone = 'light', className = '', label = 'Newsletter sign-up' }: Props) {
  const id = useId()
  const emailId = `${id}-email`
  const consentId = `${id}-consent`
  const errorId = `${id}-error`
  const honeypotId = `${id}-website`

  const [formState, setFormState] = useState<FormState>('idle')
  const [inputError, setInputError] = useState<NewsletterInputError | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const successRef = useRef<HTMLDivElement>(null)

  // The form disappears on success, which would drop keyboard focus to the page; move it to the message.
  useEffect(() => {
    if (formState === 'success') successRef.current?.focus()
  }, [formState])

  const dark = tone === 'dark'
  const labelClass = `block font-body font-medium text-sm mb-1 ${dark ? 'text-white' : 'text-ink'}`
  const inputClass = `w-full min-w-0 font-body text-sm rounded-btn px-4 py-3 min-h-[44px] focus:outline-none focus:ring-2 ${
    dark
      ? 'bg-white/10 border border-white/40 text-white placeholder:text-white/60 focus:ring-teal-light'
      : 'bg-surface border border-field text-ink placeholder:text-ink-light/70 focus:ring-teal'
  }`
  const consentTextClass = `font-body text-sm leading-relaxed cursor-pointer ${dark ? 'text-white/80' : 'text-ink'}`
  // danger (#B23B2E) is too dark to read on ink, so dark sections use a lighter red.
  const errorClass = `font-body text-xs mt-2 ${dark ? 'text-red-300' : 'text-danger'}`

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '')
    const consent = fd.get('marketing-consent') === 'yes'
    const website = String(fd.get('website') ?? '')

    const problem = newsletterInputError(email, consent)
    setInputError(problem)
    if (problem) {
      document.getElementById(problem.field === 'email' ? emailId : consentId)?.focus()
      return
    }

    setFormState('submitting')
    try {
      setSuccessMessage(await subscribe(email.trim(), website))
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div role="status" ref={successRef} tabIndex={-1} className={`focus:outline-none ${className}`}>
        <p className={`font-body font-semibold text-sm ${dark ? 'text-teal-light' : 'text-teal'}`}>
          {successMessage}
        </p>
      </div>
    )
  }

  const message = inputError?.message ?? (formState === 'error' ? SUBMIT_ERROR : null)

  return (
    <form onSubmit={handleSubmit} noValidate className={`relative ${className}`} aria-label={label}>
      <label htmlFor={emailId} className={labelClass}>Email address</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id={emailId}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          aria-invalid={inputError?.field === 'email' ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className={inputClass}
        />
        <Button
          type="submit"
          variant="primary"
          className="flex-shrink-0"
          disabled={formState === 'submitting'}
        >
          {formState === 'submitting' ? 'Signing up…' : 'Sign up'}
        </Button>
      </div>

      <div className="flex items-start gap-3 mt-3">
        <input
          id={consentId}
          type="checkbox"
          name="marketing-consent"
          value="yes"
          required
          aria-invalid={inputError?.field === 'consent' ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
        />
        <label htmlFor={consentId} className={consentTextClass}>
          {CONSENT_TEXT}
        </label>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots that fill it are ignored. */}
      <div aria-hidden="true" className="absolute left-[-10000px] top-auto w-px h-px overflow-hidden">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {message && (
        <p id={errorId} role="alert" className={errorClass}>
          {message}
        </p>
      )}
    </form>
  )
}
