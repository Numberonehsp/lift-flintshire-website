import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const FORM_NAME = 'register-girls-gym-session'

async function submitNetlifyForm(data: Record<string, string>) {
  const body = new URLSearchParams({ 'form-name': FORM_NAME, ...data }).toString()
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

const PARENTAL_CONSENT_TEXT = `Physical activity involves inherent risks. By submitting this form I confirm on behalf of the young person named above that:

1. I am the parent or legal guardian of the young person named in this form, and I give full consent for them to participate in Lift Flintshire CIC activities.
2. To the best of my knowledge the young person is medically fit to participate, or I have sought appropriate medical advice before registering them.
3. I will inform a Lift Flintshire CIC coach of any changes to the young person's health before they participate in a session.
4. I understand that Lift Flintshire CIC, its coaches, staff, and volunteers shall not be held liable for any injury, illness, loss, or damage sustained during participation, except where caused by their negligence or wilful misconduct.
5. I consent to emergency medical treatment being sought on behalf of the young person in the event of a medical emergency.`

const SCHOOL_YEARS = [
  'Year 7 (age 11–12)',
  'Year 8 (age 12–13)',
  'Year 9 (age 13–14)',
  'Year 10 (age 14–15)',
  'Year 11 (age 15–16)',
  'Sixth Form / Year 12 (age 16–17)',
  'Sixth Form / Year 13 (age 17–18)',
]

function RegistrationFormContent() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [hasMedical, setHasMedical] = useState<'yes' | 'no' | ''>('')
  const [hasInjury, setHasInjury] = useState<'yes' | 'no' | ''>('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitNetlifyForm(Object.fromEntries(fd.entries()) as Record<string, string>)
      setFormState('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-teal-pale rounded-card p-10 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-h2 text-teal mb-3">Registration received!</h2>
        <p className="font-body text-base text-ink-light mb-6 leading-relaxed">
          Thank you for registering. We're looking forward to welcoming the young person to a Girls Gym Session.
        </p>
        <div className="mb-6">
          <p className="font-body font-semibold text-sm text-ink mb-3">What happens next</p>
          <ol className="space-y-2">
            {[
              "We'll confirm the registration by email within 2 working days.",
              "We'll share the exact date, time, and location of the session.",
              "Turn up in comfortable clothes and trainers — we'll handle the rest.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white font-display font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="font-body text-sm text-ink-light leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://instagram.com/LiftFlintshire"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-body font-semibold text-sm text-white bg-teal hover:bg-teal-dark rounded-btn px-5 py-3 transition-colors min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Follow us on Instagram
          </a>
          <a
            href="mailto:hello@liftflintshire.co.uk"
            className="flex items-center justify-center font-body font-semibold text-sm text-teal border border-teal/40 rounded-btn px-5 py-3 hover:bg-teal/5 transition-colors min-h-[44px]"
          >
            hello@liftflintshire.co.uk
          </a>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-netlify="true"
      name={FORM_NAME}
      className="space-y-4 max-w-2xl"
    >
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <input type="hidden" name="programme" value="girls-gym-session" />

      <div className="bg-teal-pale border border-teal/20 rounded-card p-4">
        <p className="font-body text-sm text-ink leading-relaxed">
          <strong>This form is for parents and guardians</strong> to register a young person for our free gym session.
          All fields are required unless marked optional. Please read the health declaration and waiver carefully before submitting.
        </p>
      </div>

      {/* ── Young Person's Details ── */}
      <h2 className={sectionHeadingClass}>Young Person's Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="yp-first-name" className={labelClass}>First name</label>
          <input
            id="yp-first-name"
            type="text"
            name="yp-first-name"
            required
            autoComplete="given-name"
            placeholder="Ella"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="yp-last-name" className={labelClass}>Last name</label>
          <input
            id="yp-last-name"
            type="text"
            name="yp-last-name"
            required
            autoComplete="family-name"
            placeholder="Jones"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="yp-dob" className={labelClass}>Date of birth</label>
        <input
          id="yp-dob"
          type="date"
          name="yp-date-of-birth"
          required
          max={new Date().toISOString().split('T')[0]}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="yp-gender" className={labelClass}>Gender</label>
        <select id="yp-gender" name="yp-gender" required className={inputClass}>
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label htmlFor="yp-school-year" className={labelClass}>School year</label>
        <select id="yp-school-year" name="yp-school-year" required className={inputClass}>
          <option value="">Select school year</option>
          {SCHOOL_YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="referral-source" className={labelClass}>How did you hear about us?</label>
        <select id="referral-source" name="referral-source" required className={inputClass}>
          <option value="">Select an option</option>
          <option value="social-media">Social media</option>
          <option value="word-of-mouth">Word of mouth</option>
          <option value="school">School</option>
          <option value="gp-referral">GP referral</option>
          <option value="flintshire-council">Flintshire Council</option>
          <option value="internet-search">Internet search</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* ── Parent / Guardian Details ── */}
      <h2 className={sectionHeadingClass}>Parent / Guardian Details</h2>
      <p className="font-body text-xs text-ink-light -mt-2 leading-relaxed">
        As the parent or guardian, you are responsible for providing consent for this registration. Your details will be used as the primary contact.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="guardian-first-name" className={labelClass}>Your first name</label>
          <input
            id="guardian-first-name"
            type="text"
            name="guardian-first-name"
            required
            autoComplete="given-name"
            placeholder="Sarah"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="guardian-last-name" className={labelClass}>Your last name</label>
          <input
            id="guardian-last-name"
            type="text"
            name="guardian-last-name"
            required
            autoComplete="family-name"
            placeholder="Jones"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="guardian-relationship" className={labelClass}>Your relationship to the young person</label>
        <select id="guardian-relationship" name="guardian-relationship" required className={inputClass}>
          <option value="">Select relationship</option>
          <option value="parent-mother">Parent (mother)</option>
          <option value="parent-father">Parent (father)</option>
          <option value="legal-guardian">Legal guardian</option>
          <option value="other">Other responsible adult</option>
        </select>
      </div>

      <div>
        <label htmlFor="guardian-email" className={labelClass}>Your email address</label>
        <input
          id="guardian-email"
          type="email"
          name="guardian-email"
          required
          autoComplete="email"
          placeholder="sarah.jones@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="guardian-phone" className={labelClass}>Your phone number</label>
        <input
          id="guardian-phone"
          type="tel"
          name="guardian-phone"
          required
          autoComplete="tel"
          placeholder="07700 000000"
          className={inputClass}
        />
      </div>

      {/* ── Emergency Contact ── */}
      <h2 className={sectionHeadingClass}>Emergency Contact</h2>
      <p className="font-body text-xs text-ink-light -mt-2 leading-relaxed">
        If the emergency contact is yourself (the parent/guardian above), you can enter your details again here.
      </p>

      <div>
        <label htmlFor="ec-name" className={labelClass}>Full name</label>
        <input
          id="ec-name"
          type="text"
          name="emergency-contact-name"
          required
          placeholder="John Jones"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="ec-relationship" className={labelClass}>Relationship to young person</label>
        <input
          id="ec-relationship"
          type="text"
          name="emergency-contact-relationship"
          required
          placeholder="Parent, guardian, sibling…"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="ec-phone" className={labelClass}>Phone number</label>
        <input
          id="ec-phone"
          type="tel"
          name="emergency-contact-phone"
          required
          placeholder="07700 000001"
          className={inputClass}
        />
      </div>

      {/* ── Health & Medical Declaration ── */}
      <h2 className={sectionHeadingClass}>Health &amp; Medical Declaration</h2>
      <p className="font-body text-xs text-ink-light -mt-2 leading-relaxed">
        This information is kept strictly confidential and is used only to help our coaches support the young person safely.
      </p>

      <div>
        <p className={labelClass}>
          Does the young person have any medical conditions, disabilities, or health concerns we should know about?
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
            <label htmlFor="medical-details" className={labelClass}>Please provide details</label>
            <textarea
              id="medical-details"
              name="medical-conditions-details"
              required
              rows={3}
              placeholder="Please describe the condition(s) and any relevant treatment or medication."
              className={`${inputClass} min-h-[80px] resize-y`}
            />
          </div>
        )}
      </div>

      <div>
        <p className={labelClass}>
          Does the young person have any current injuries or physical limitations?
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
            <label htmlFor="injury-details" className={labelClass}>Please provide details</label>
            <textarea
              id="injury-details"
              name="injury-details"
              required
              rows={3}
              placeholder="Please describe the injury/limitation and any relevant medical advice."
              className={`${inputClass} min-h-[80px] resize-y`}
            />
          </div>
        )}
      </div>

      {/* ── Consents & Waiver ── */}
      <h2 className={sectionHeadingClass}>Parental Consent &amp; Waiver</h2>

      {/* GDPR */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Data Protection (GDPR)</p>
        <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
          Lift Flintshire CIC will store and process the personal data provided in this form solely for the purpose of administering participation in our programmes.
          Data is kept securely and will not be shared with third parties without explicit consent, except where required by law.
          As the parent or guardian, you have the right to access, correct, or request deletion of your child's data at any time by emailing{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
            hello@liftflintshire.co.uk
          </a>.
        </p>
        <div className="flex items-start gap-3">
          <input
            id="gdpr-consent"
            type="checkbox"
            name="gdpr-consent"
            value="yes"
            required
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="gdpr-consent" className="font-body text-sm text-ink leading-relaxed cursor-pointer">
            I consent to Lift Flintshire CIC storing and processing the personal data provided above as described. <span className="text-teal font-medium">(Required)</span>
          </label>
        </div>
      </div>

      {/* Photo consent */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Photography &amp; Video</p>
        <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
          We occasionally take photographs or video footage during sessions for use on our website and social media.
          The young person is never obliged to be photographed and you may withdraw consent at any time by speaking to a coach or emailing us.
        </p>
        <div className="flex items-start gap-3">
          <input
            id="photo-consent"
            type="checkbox"
            name="photo-consent"
            value="yes"
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="photo-consent" className="font-body text-sm text-ink leading-relaxed cursor-pointer">
            I consent to the young person being photographed or filmed during sessions for Lift Flintshire CIC marketing purposes. <span className="text-ink-light font-normal">(Optional)</span>
          </label>
        </div>
      </div>

      {/* Parental consent waiver */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Parental Consent &amp; Participation Waiver</p>
        <pre className="font-body text-xs text-ink-light leading-relaxed whitespace-pre-wrap mb-4">{PARENTAL_CONSENT_TEXT}</pre>
        <div className="flex items-start gap-3 mb-4">
          <input
            id="waiver-agreed"
            type="checkbox"
            name="waiver-agreed"
            value="yes"
            required
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="waiver-agreed" className="font-body text-sm text-ink leading-relaxed cursor-pointer">
            I am the parent or legal guardian of the young person named above. I have read and agree to the participation waiver. <span className="text-teal font-medium">(Required)</span>
          </label>
        </div>
        <div>
          <label htmlFor="guardian-initials" className={labelClass}>
            Please enter your initials to confirm
          </label>
          <input
            id="guardian-initials"
            type="text"
            name="guardian-initials"
            required
            maxLength={5}
            placeholder="e.g. SJ"
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

export default function RegisterGirlsGymSession() {
  return (
    <>
      <Helmet>
        <title>Register — Girls Gym Session · Lift Flintshire CIC</title>
        <meta
          name="description"
          content="Register your daughter for a free gym session with Lift Flintshire CIC. Open to high school girls of all abilities. Parental consent required."
        />
        <meta property="og:title" content="Register for Girls Gym Session — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Free · High school girls
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">
          Girls Gym Session — Register
        </h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          A free, fun gym session for high school girls — no experience needed. Led by qualified coaches in a welcoming, supportive environment.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main form */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-extrabold text-h2 text-ink mb-2">Registration Form</h2>
            <p className="font-body text-sm text-ink-light mb-6">
              This form should be completed by a parent or guardian. All sections are required unless marked optional.
            </p>
            <RegistrationFormContent />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-teal-pale rounded-card p-4 border border-teal/20">
              <p className="font-body font-semibold text-sm text-teal mb-2">Session details</p>
              <ul className="font-body text-sm text-ink-light space-y-1">
                <li><strong className="text-ink">Who:</strong> High school girls (Years 7–13)</li>
                <li><strong className="text-ink">Cost:</strong> Free</li>
                <li><strong className="text-ink">What to bring:</strong> Comfortable clothing and trainers</li>
              </ul>
            </div>

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-2">What to expect</p>
              <p className="font-body text-sm text-ink-light leading-relaxed">
                A beginner-friendly gym session coached by our qualified team. No previous experience needed — sessions are relaxed, social, and designed to build confidence as well as fitness.
              </p>
            </div>

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-2">What happens next?</p>
              <ol className="font-body text-sm text-ink-light space-y-2 list-decimal list-inside">
                <li>We'll confirm the registration by email within 2 working days.</li>
                <li>We'll share the exact date, time, and location of the session.</li>
                <li>Turn up in comfortable clothes and trainers — we'll handle the rest.</li>
              </ol>
            </div>

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-1">Questions?</p>
              <p className="font-body text-sm text-ink-light">
                Email us at{' '}
                <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
                  hello@liftflintshire.co.uk
                </a>{' '}
                and we'll get back to you within 2 working days.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
