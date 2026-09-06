import { useEffect, useRef, useState } from 'react'
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

async function submitForm(formName: string, data: Record<string, string>) {
  const body = new URLSearchParams({ 'form-name': formName, ...data }).toString()
  const res = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Submit failed')
}

const inputClass =
  'w-full font-body text-sm border border-field rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/70'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'
const sectionHeadingClass = 'font-display font-bold text-h3 text-ink mb-4 mt-8 first:mt-0 pb-2 border-b border-border'

const WAIVER_INTRO =
  'Physical activity involves inherent risks. By submitting this form I confirm that:'

const WAIVER_POINTS = [
  'I am voluntarily participating in Lift Flintshire CIC activities and accept responsibility for my own safety.',
  'To the best of my knowledge I am medically fit to participate, or have sought appropriate medical advice before doing so.',
  'I will inform a Lift Flintshire CIC coach of any changes to my health before participating in a session.',
  'I understand that Lift Flintshire CIC, its coaches, staff, and volunteers shall not be held liable for any injury, illness, loss, or damage sustained during participation, except where caused by their negligence or wilful misconduct.',
  'I consent to emergency medical treatment being sought on my behalf in the event of a medical emergency.',
]

const STEP_LABELS = ['About you', 'Health & safety', 'Consents']

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = n < step
          const current = n === step
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? 'bg-teal text-white'
                    : current
                    ? 'bg-teal text-white ring-2 ring-teal ring-offset-2'
                    : 'bg-surface-muted text-ink-light border border-border'
                }`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : n}
              </div>
              <span className={`font-body text-xs hidden sm:block ${current ? 'text-ink font-medium' : 'text-ink-light'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
        />
      </div>
      <p className="font-body text-xs text-ink-light mt-2">Step {step} of {STEP_LABELS.length}</p>
    </div>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessState({ programmeLabel }: { programmeLabel: string }) {
  return (
    <div className="bg-teal-pale rounded-card p-8 md:p-10 text-center max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mx-auto mb-5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-display font-bold text-h2 text-teal mb-2">You're registered!</h2>
      <p className="font-body text-sm text-ink-light mb-6 leading-relaxed">
        Thanks for registering for <strong className="text-ink">{programmeLabel}</strong>.
        We'll be in touch within 2 working days to confirm your place.
      </p>

      <div className="text-left bg-surface rounded-card p-5 border border-teal/20 mb-5">
        <p className="font-body font-semibold text-sm text-ink mb-3">What happens next</p>
        <ol className="font-body text-sm text-ink-light space-y-2 list-decimal list-inside leading-relaxed">
          <li>We'll confirm your registration by email within 2 working days.</li>
          <li>You'll receive session times, location, and anything else you need.</li>
          <li>Turn up in comfortable clothing and trainers, and we'll handle the rest.</li>
        </ol>
      </div>

      <a
        href="https://instagram.com/LiftFlintshire"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-body text-sm font-semibold text-teal hover:underline mb-5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
        Follow us on Instagram for updates
      </a>

      <p className="font-body text-xs text-ink-light">
        Questions? Email{' '}
        <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
          hello@liftflintshire.co.uk
        </a>
      </p>
    </div>
  )
}

// ── Main form component ───────────────────────────────────────────────────────
const RADIO_GROUP_MESSAGES: Record<string, string> = {
  'has-medical-conditions': 'Please choose Yes or No so we know whether to ask for details.',
  'has-injuries': 'Please choose Yes or No so we know whether to ask for details.',
}

export function RegistrationForm({ programme, formName, programmeLabel, intro, extraFields }: Props) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [step, setStep] = useState(1)
  const [hasMedical, setHasMedical] = useState<'yes' | 'no' | ''>('')
  const [hasInjury, setHasInjury] = useState<'yes' | 'no' | ''>('')
  const [radioErrors, setRadioErrors] = useState<Record<string, string>>({})

  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const isFirstRender = useRef(true)

  // Move focus to the step heading on every step change so screen-reader and
  // keyboard users land at the top of the new content instead of on a button
  // that has scrolled away. Skips the initial mount.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    stepHeadingRef.current?.focus()
  }, [step])

  function validateCurrentStep(): boolean {
    const stepEl = document.getElementById(`${formName}-step-${step}`)
    if (!stepEl) return true

    const inputs = Array.from(
      stepEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea'
      )
    )
    for (const el of inputs) {
      if (!el.checkValidity()) {
        el.reportValidity()
        return false
      }
    }

    // Required radio groups: surface a visible, announced message per group
    // rather than failing silently.
    const radioNames = new Set<string>()
    stepEl
      .querySelectorAll<HTMLInputElement>('input[type="radio"][required]')
      .forEach(r => radioNames.add(r.name))

    const nextErrors: Record<string, string> = {}
    for (const name of radioNames) {
      if (!stepEl.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)) {
        nextErrors[name] = RADIO_GROUP_MESSAGES[name] ?? 'Please choose an option.'
      }
    }
    setRadioErrors(nextErrors)
    const firstMissing = Object.keys(nextErrors)[0]
    if (firstMissing) {
      stepEl.querySelector<HTMLInputElement>(`input[name="${firstMissing}"]`)?.focus()
      return false
    }

    return true
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setRadioErrors({})
      setStep(s => s + 1)
    }
  }

  function handleBack() {
    setRadioErrors({})
    setStep(s => s - 1)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitForm(formName, Object.fromEntries(fd.entries()) as Record<string, string>)
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return <SuccessState programmeLabel={programmeLabel} />
  }

  return (
    <form onSubmit={handleSubmit} name={formName}>
      <input type="hidden" name="form-name" value={formName} />
      <input type="hidden" name="programme" value={programme} />

      <ProgressBar step={step} />

      {/* Announced on step change; also the element focus moves to, so keyboard
          and screen-reader users are told where they are. */}
      <div
        ref={stepHeadingRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {`Step ${step} of ${STEP_LABELS.length}: ${STEP_LABELS[step - 1]}`}
      </div>

      {/* ═══════════════════════════════════════════════════════
          STEP 1 — About you
      ═══════════════════════════════════════════════════════ */}
      <div
        id={`${formName}-step-1`}
        role="group"
        aria-label={`Step 1 of ${STEP_LABELS.length}: ${STEP_LABELS[0]}`}
        style={{ display: step === 1 ? 'block' : 'none' }}
      >
        <p className="font-body text-sm text-ink-light leading-relaxed mb-6">{intro}</p>

        <h2 className={sectionHeadingClass}>Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
          <label htmlFor={`${formName}-referral`} className={labelClass}>How did you hear about us?</label>
          <select id={`${formName}-referral`} name="referral-source" required className={inputClass}>
            <option value="">Select an option</option>
            <option value="social-media">Social media (Facebook, Instagram)</option>
            <option value="word-of-mouth">Word of mouth (friend or family)</option>
            <option value="gp-referral">GP or health professional referral</option>
            <option value="flintshire-council">Flintshire County Council</option>
            <option value="school">School</option>
            <option value="internet-search">Internet search</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STEP 2 — Health & safety
      ═══════════════════════════════════════════════════════ */}
      <div
        id={`${formName}-step-2`}
        role="group"
        aria-label={`Step 2 of ${STEP_LABELS.length}: ${STEP_LABELS[1]}`}
        style={{ display: step === 2 ? 'block' : 'none' }}
      >
        <h2 className={sectionHeadingClass}>Emergency Contact</h2>

        <div className="mb-4">
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
        <div className="mb-4">
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
        <div className="mb-4">
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

        <h2 className={sectionHeadingClass}>Health &amp; Medical Declaration</h2>
        <p className="font-body text-xs text-ink-light leading-relaxed mb-4">
          This information is kept strictly confidential and used only to help our coaches support you safely.
        </p>

        <fieldset
          className="mb-4 m-0 border-0 p-0"
          aria-describedby={radioErrors['has-medical-conditions'] ? `${formName}-medical-error` : undefined}
        >
          <legend className={labelClass}>
            Do you have any medical conditions, disabilities, or health concerns we should know about?
          </legend>
          <div className="flex gap-4 mt-1">
            {(['yes', 'no'] as const).map(val => (
              <label key={val} className="flex items-center gap-2 py-1.5 font-body text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="has-medical-conditions"
                  value={val}
                  required
                  checked={hasMedical === val}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setHasMedical(e.target.value as 'yes' | 'no')}
                  className="accent-teal h-[18px] w-[18px]"
                />
                {val === 'yes' ? 'Yes' : 'No'}
              </label>
            ))}
          </div>
          {radioErrors['has-medical-conditions'] && (
            <p id={`${formName}-medical-error`} role="alert" className="font-body text-xs text-danger mt-1">
              {radioErrors['has-medical-conditions']}
            </p>
          )}
          {hasMedical === 'yes' && (
            <div className="mt-3">
              <label htmlFor={`${formName}-medical-details`} className={labelClass}>Please provide details</label>
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
        </fieldset>

        <fieldset
          className="mb-4 m-0 border-0 p-0"
          aria-describedby={radioErrors['has-injuries'] ? `${formName}-injuries-error` : undefined}
        >
          <legend className={labelClass}>Do you have any current injuries or physical limitations?</legend>
          <div className="flex gap-4 mt-1">
            {(['yes', 'no'] as const).map(val => (
              <label key={val} className="flex items-center gap-2 py-1.5 font-body text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="has-injuries"
                  value={val}
                  required
                  checked={hasInjury === val}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setHasInjury(e.target.value as 'yes' | 'no')}
                  className="accent-teal h-[18px] w-[18px]"
                />
                {val === 'yes' ? 'Yes' : 'No'}
              </label>
            ))}
          </div>
          {radioErrors['has-injuries'] && (
            <p id={`${formName}-injuries-error`} role="alert" className="font-body text-xs text-danger mt-1">
              {radioErrors['has-injuries']}
            </p>
          )}
          {hasInjury === 'yes' && (
            <div className="mt-3">
              <label htmlFor={`${formName}-injury-details`} className={labelClass}>Please provide details</label>
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
        </fieldset>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STEP 3 — Consents & Waiver
      ═══════════════════════════════════════════════════════ */}
      <div
        id={`${formName}-step-3`}
        role="group"
        aria-label={`Step 3 of ${STEP_LABELS.length}: ${STEP_LABELS[2]}`}
        style={{ display: step === 3 ? 'block' : 'none' }}
      >
        <h2 className={sectionHeadingClass}>Consents &amp; Waiver</h2>

        {/* GDPR */}
        <div className="bg-surface-muted rounded-card p-4 border border-border mb-4">
          <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Data Protection (GDPR)</p>
          <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
            Lift Flintshire CIC will store and process the personal data provided in this form for the purpose of administering your participation in our programmes.
            Your data will be kept securely, retained for no longer than necessary, and will not be shared with third parties without your explicit consent, except where required by law.
            You have the right to access, correct, or request deletion of your data at any time by emailing{' '}
            <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">hello@liftflintshire.co.uk</a>.
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
              I consent to Lift Flintshire CIC storing and processing my personal data as described above.{' '}
              <span className="text-teal font-medium">(Required)</span>
            </label>
          </div>
        </div>

        {/* Photo consent */}
        <div className="bg-surface-muted rounded-card p-4 border border-border mb-4">
          <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Photography &amp; Video</p>
          <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
            We occasionally take photographs and video footage during sessions for use on our website and social media.
            You are never obliged to be photographed and may withdraw consent at any time by speaking to a coach or emailing us.
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
              I consent to being photographed or filmed during sessions for Lift Flintshire CIC marketing purposes.{' '}
              <span className="text-ink-light font-normal">(Optional)</span>
            </label>
          </div>
        </div>

        {/* Waiver */}
        <div className="bg-surface-muted rounded-card p-4 border border-border mb-4">
          <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Participation Waiver</p>
          <p className="font-body text-xs text-ink-light leading-relaxed mb-2">{WAIVER_INTRO}</p>
          <ol className="font-body text-xs text-ink-light leading-relaxed list-decimal pl-5 space-y-1.5 mb-4">
            {WAIVER_POINTS.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ol>
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
              I have read and agree to the participation waiver above.{' '}
              <span className="text-teal font-medium">(Required)</span>
            </label>
          </div>
          <div>
            <label htmlFor={`${formName}-initials`} className={labelClass}>Please enter your initials to confirm</label>
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
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <div className={`flex gap-3 mt-6 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
        {step > 1 && (
          <Button type="button" variant="outline" onClick={handleBack}>
            ← Back
          </Button>
        )}
        {step < 3 ? (
          <Button type="button" variant="primary" onClick={handleNext}>
            Continue →
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={formState === 'submitting'}
          >
            {formState === 'submitting' ? 'Submitting…' : 'Complete registration'}
          </Button>
        )}
      </div>

      {formState === 'error' && (
        <p role="alert" className="font-body text-xs text-danger text-center mt-3">
          Something went wrong and your registration was not sent. Please try again, or email{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="underline">hello@liftflintshire.co.uk</a>.
        </p>
      )}
    </form>
  )
}
