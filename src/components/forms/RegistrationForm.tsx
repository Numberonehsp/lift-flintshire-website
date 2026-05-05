import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Button } from '../ui/Button'

export type RegistrationProgramme = 'couch-to-5k' | 'womens-run-club'

interface Props {
  programme: RegistrationProgramme
  formName: string
  programmeLabel: string
  intro: string
  extraFields?: React.ReactNode
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

async function submitNetlifyForm(formName: string, data: Record<string, string>) {
  const body = new URLSearchParams({ 'form-name': formName, ...data }).toString()
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Submit failed')
}

const inputClass =
  'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'
const sectionHeadingClass = 'font-display font-bold text-h3 text-ink mb-4 mt-8 pb-2 border-b border-border'

const WAIVER_TEXT = `Physical activity involves inherent risks. By submitting this form I confirm that:

1. I am voluntarily participating in Lift Flintshire CIC activities and accept responsibility for my own safety.
2. To the best of my knowledge I am medically fit to participate, or have sought appropriate medical advice before doing so.
3. I will inform a Lift Flintshire CIC coach of any changes to my health before participating in a session.
4. I understand that Lift Flintshire CIC, its coaches, staff, and volunteers shall not be held liable for any injury, illness, loss, or damage sustained during participation, except where caused by their negligence or wilful misconduct.
5. I consent to emergency medical treatment being sought on my behalf in the event of a medical emergency.`

export function RegistrationForm({ programme, formName, programmeLabel, intro, extraFields }: Props) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [hasMedical, setHasMedical] = useState<'yes' | 'no' | ''>('')
  const [hasInjury, setHasInjury] = useState<'yes' | 'no' | ''>('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitNetlifyForm(formName, Object.fromEntries(fd.entries()) as Record<string, string>)
      setFormState('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-teal-pale rounded-card p-10 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-h2 text-teal mb-3">You're registered!</h2>
        <p className="font-body text-sm text-ink-light mb-2 leading-relaxed">
          Thank you for registering for <strong>{programmeLabel}</strong>. We'll be in touch shortly with session details.
        </p>
        <p className="font-body text-xs text-ink-light">
          Questions? Email us at{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
            hello@liftflintshire.co.uk
          </a>
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-netlify="true"
      name={formName}
      className="space-y-4 max-w-2xl"
    >
      <input type="hidden" name="form-name" value={formName} />
      <input type="hidden" name="programme" value={programme} />

      <p className="font-body text-sm text-ink-light leading-relaxed">{intro}</p>

      {/* ── Personal Information ── */}
      <h2 className={sectionHeadingClass}>Personal Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${formName}-first-name`} className={labelClass}>First name</label>
          <input
            id={`${formName}-first-name`}
            type="text"
            name="first-name"
            required
            autoComplete="given-name"
            placeholder="Jane"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${formName}-last-name`} className={labelClass}>Last name</label>
          <input
            id={`${formName}-last-name`}
            type="text"
            name="last-name"
            required
            autoComplete="family-name"
            placeholder="Smith"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${formName}-dob`} className={labelClass}>Date of birth</label>
        <input
          id={`${formName}-dob`}
          type="date"
          name="date-of-birth"
          required
          max={new Date().toISOString().split('T')[0]}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formName}-email`} className={labelClass}>Email address</label>
        <input
          id={`${formName}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formName}-phone`} className={labelClass}>Phone number</label>
        <input
          id={`${formName}-phone`}
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          placeholder="07700 000000"
          className={inputClass}
        />
      </div>

      {extraFields}

      {/* ── Emergency Contact ── */}
      <h2 className={sectionHeadingClass}>Emergency Contact</h2>

      <div>
        <label htmlFor={`${formName}-ec-name`} className={labelClass}>Full name</label>
        <input
          id={`${formName}-ec-name`}
          type="text"
          name="emergency-contact-name"
          required
          placeholder="John Smith"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${formName}-ec-relationship`} className={labelClass}>Relationship to you</label>
        <input
          id={`${formName}-ec-relationship`}
          type="text"
          name="emergency-contact-relationship"
          required
          placeholder="Partner, parent, sibling…"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${formName}-ec-phone`} className={labelClass}>Phone number</label>
        <input
          id={`${formName}-ec-phone`}
          type="tel"
          name="emergency-contact-phone"
          required
          placeholder="07700 000001"
          className={inputClass}
        />
      </div>

      {/* ── Health & Medical Declaration ── */}
      <h2 className={sectionHeadingClass}>Health &amp; Medical Declaration</h2>
      <p className="font-body text-xs text-ink-light leading-relaxed -mt-2">
        This information is kept strictly confidential and is used only to help our coaches support you safely.
      </p>

      <div>
        <p className={labelClass}>
          Do you have any medical conditions, disabilities, or health concerns we should know about?
        </p>
        <div className="flex gap-6 mt-1">
          {(['yes', 'no'] as const).map(val => (
            <label key={val} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input
                type="radio"
                name="has-medical-conditions"
                value={val}
                required
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
            <label htmlFor={`${formName}-medical-details`} className={labelClass}>
              Please provide details
            </label>
            <textarea
              id={`${formName}-medical-details`}
              name="medical-conditions-details"
              required
              rows={3}
              placeholder="Please describe your condition(s) and any relevant treatment or medication."
              className={`${inputClass} min-h-[80px] resize-y`}
            />
          </div>
        )}
      </div>

      <div>
        <p className={labelClass}>
          Do you have any current injuries or physical limitations?
        </p>
        <div className="flex gap-6 mt-1">
          {(['yes', 'no'] as const).map(val => (
            <label key={val} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input
                type="radio"
                name="has-injuries"
                value={val}
                required
                checked={hasInjury === val}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setHasInjury(e.target.value as 'yes' | 'no')}
                className="accent-teal h-4 w-4"
              />
              {val === 'yes' ? 'Yes' : 'No'}
            </label>
          ))}
        </div>
        {hasInjury === 'yes' && (
          <div className="mt-3">
            <label htmlFor={`${formName}-injury-details`} className={labelClass}>
              Please provide details
            </label>
            <textarea
              id={`${formName}-injury-details`}
              name="injury-details"
              required
              rows={3}
              placeholder="Please describe the injury/limitation and any relevant medical advice you have received."
              className={`${inputClass} min-h-[80px] resize-y`}
            />
          </div>
        )}
      </div>

      {/* ── Waiver, GDPR & Consents ── */}
      <h2 className={sectionHeadingClass}>Consents &amp; Waiver</h2>

      {/* GDPR */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Data Protection (GDPR)</p>
        <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
          Lift Flintshire CIC will store and process the personal data provided in this form for the purpose of administering your participation in our programmes. Your data will be kept securely, retained for no longer than necessary, and will not be shared with third parties without your explicit consent, except where required by law. You have the right to access, correct, or request deletion of your data at any time by emailing{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
            hello@liftflintshire.co.uk
          </a>.
        </p>
        <div className="flex items-start gap-3">
          <input
            id={`${formName}-gdpr`}
            type="checkbox"
            name="gdpr-consent"
            value="yes"
            required
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor={`${formName}-gdpr`} className="font-body text-sm text-ink leading-relaxed cursor-pointer">
            I consent to Lift Flintshire CIC storing and processing my personal data as described above. <span className="text-teal font-medium">(Required)</span>
          </label>
        </div>
      </div>

      {/* Photo consent */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Photography &amp; Video</p>
        <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
          We occasionally take photographs and video footage during sessions for use on our website and social media. You are never obliged to be photographed and may withdraw consent at any time by speaking to a coach or emailing us.
        </p>
        <div className="flex items-start gap-3">
          <input
            id={`${formName}-photo`}
            type="checkbox"
            name="photo-consent"
            value="yes"
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor={`${formName}-photo`} className="font-body text-sm text-ink leading-relaxed cursor-pointer">
            I consent to being photographed or filmed during sessions for Lift Flintshire CIC marketing purposes. <span className="text-ink-light font-normal">(Optional)</span>
          </label>
        </div>
      </div>

      {/* Waiver */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Participation Waiver</p>
        <pre className="font-body text-xs text-ink-light leading-relaxed whitespace-pre-wrap mb-4">{WAIVER_TEXT}</pre>
        <div className="flex items-start gap-3 mb-4">
          <input
            id={`${formName}-waiver`}
            type="checkbox"
            name="waiver-agreed"
            value="yes"
            required
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor={`${formName}-waiver`} className="font-body text-sm text-ink leading-relaxed cursor-pointer">
            I have read and agree to the participation waiver above. <span className="text-teal font-medium">(Required)</span>
          </label>
        </div>
        <div>
          <label htmlFor={`${formName}-initials`} className={labelClass}>
            Please enter your initials to confirm your agreement
          </label>
          <input
            id={`${formName}-initials`}
            type="text"
            name="waiver-initials"
            required
            maxLength={5}
            placeholder="e.g. JS"
            className={`${inputClass} max-w-[120px] uppercase`}
            style={{ textTransform: 'uppercase' }}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        disabled={formState === 'submitting'}
      >
        {formState === 'submitting' ? 'Submitting…' : 'Complete registration'}
      </Button>

      {formState === 'error' && (
        <p className="font-body text-xs text-red-600 text-center">
          Something went wrong. Please try again or email{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="underline">
            hello@liftflintshire.co.uk
          </a>
          .
        </p>
      )}
    </form>
  )
}
