import { useState } from 'react'
import type { FormEvent } from 'react'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const FORM_NAME = 'enquiry-youth-strength-conditioning'

async function submitForm(data: Record<string, string>) {
  const body = new URLSearchParams({ 'form-name': FORM_NAME, ...data }).toString()
  const res = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Submit failed')
}

const inputClass =
  'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'

const SCHOOL_YEARS = [
  'Year 7 (age 11–12)',
  'Year 8 (age 12–13)',
  'Year 9 (age 13–14)',
  'Year 10 (age 14–15)',
  'Year 11 (age 15–16)',
  'Sixth Form / Year 12 (age 16–17)',
  'Sixth Form / Year 13 (age 17–18)',
]

function EnquiryFormContent() {
  const [formState, setFormState] = useState<FormState>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitForm(Object.fromEntries(fd.entries()) as Record<string, string>)
      setFormState('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-teal-pale rounded-card p-10 max-w-xl">
        <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-h2 text-teal mb-3">Enquiry received!</h2>
        <p className="font-body text-base text-ink-light mb-6 leading-relaxed">
          Thank you for your interest in Youth Strength &amp; Conditioning. We'll be in touch within 2 working days to tell you about upcoming sessions and answer any questions.
        </p>
        <p className="font-body text-xs text-ink-light">
          Questions in the meantime? Email{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
            hello@liftflintshire.co.uk
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} name={FORM_NAME} className="space-y-4 max-w-2xl">
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <input type="hidden" name="programme" value="youth-strength-conditioning" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="guardian-first-name" className={labelClass}>Parent / guardian first name</label>
          <input id="guardian-first-name" type="text" name="guardian-first-name" required autoComplete="given-name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="guardian-last-name" className={labelClass}>Parent / guardian last name</label>
          <input id="guardian-last-name" type="text" name="guardian-last-name" required autoComplete="family-name" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="guardian-email" className={labelClass}>Email address</label>
          <input id="guardian-email" type="email" name="guardian-email" required autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="guardian-phone" className={labelClass}>
            Phone number <span className="text-ink-light font-normal">(optional)</span>
          </label>
          <input id="guardian-phone" type="tel" name="guardian-phone" autoComplete="tel" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="yp-first-name" className={labelClass}>Young person's first name</label>
          <input id="yp-first-name" type="text" name="yp-first-name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="yp-school-year" className={labelClass}>School year</label>
          <select id="yp-school-year" name="yp-school-year" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select a year</option>
            {SCHOOL_YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Anything you'd like us to know? <span className="text-ink-light font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="e.g. days that would suit, or questions about the sessions"
          className={`${inputClass} min-h-[100px] resize-y`}
        />
      </div>

      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body text-xs text-ink-light leading-relaxed mb-3">
          Lift Flintshire CIC will use these details only to reply to your enquiry and tell you about Youth Strength &amp; Conditioning sessions.
          We won't share them with third parties except where required by law. You can ask us to access, correct, or delete them at any time by emailing{' '}
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
            I'm the parent or guardian, and I consent to Lift Flintshire CIC contacting me about this enquiry. <span className="text-teal font-medium">(Required)</span>
          </label>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={formState === 'submitting'}>
        {formState === 'submitting' ? 'Sending…' : 'Send enquiry'}
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

export default function EnquireYouthStrengthConditioning() {
  return (
    <>
      <Seo
        title="Enquire · Youth Strength & Conditioning · Lift Flintshire CIC"
        description="Interested in Lift Flintshire's free Youth Strength & Conditioning sessions for Years 7–13? Send an enquiry and we'll be in touch."
        path="/enquire/youth-strength-conditioning"
        ogTitle="Enquire about Youth Strength & Conditioning · Lift Flintshire CIC"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">
          Free · Years 7–13
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">
          Youth Strength &amp; Conditioning enquiry
        </h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Free, coach-led strength and movement sessions for young people, no experience needed. Tell us you're interested and we'll get in touch.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-display font-extrabold text-h2 text-ink mb-2">Enquiry Form</h2>
            <p className="font-body text-sm text-ink-light mb-6">
              This form should be completed by a parent or guardian.
            </p>
            <EnquiryFormContent />
          </div>

          <div className="space-y-6">
            <div className="bg-teal-pale rounded-card p-4 border border-teal/20">
              <p className="font-body font-semibold text-sm text-teal mb-2">About the sessions</p>
              <ul className="font-body text-sm text-ink-light space-y-1">
                <li><strong className="text-ink">Who:</strong> Young people in Years 7–13 (ages 11–18)</li>
                <li><strong className="text-ink">Location:</strong> Number One HSP, CH5 2TF, Flintshire</li>
                <li><strong className="text-ink">Cost:</strong> Free</li>
              </ul>
            </div>

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-2">What happens next?</p>
              <ol className="font-body text-sm text-ink-light space-y-2 list-decimal list-inside">
                <li>We'll reply within 2 working days.</li>
                <li>We'll tell you about upcoming sessions and answer your questions.</li>
                <li>If it's a good fit, we'll sort out registration and consent together.</li>
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
