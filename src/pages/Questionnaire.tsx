import { useState } from 'react'
import type { FormEvent } from 'react'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'

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
  'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'

type Rating = '1' | '2' | '3' | '4' | '5' | ''

interface StarRatingProps {
  name: string
  label: string
  required?: boolean
}

function StarRating({ name, label, required }: StarRatingProps) {
  const [selected, setSelected] = useState<Rating>('')
  const [hovered, setHovered] = useState<Rating>('')

  const labels: Record<string, string> = { '1': 'Poor', '2': 'Fair', '3': 'Good', '4': 'Very good', '5': 'Excellent' }

  return (
    <div>
      <p className={labelClass}>
        {label}
        {required && <span className="text-teal font-medium"> *</span>}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {(['1', '2', '3', '4', '5'] as Rating[]).map(val => {
          const active = hovered ? Number(val) <= Number(hovered) : Number(val) <= Number(selected)
          return (
            <button
              key={val}
              type="button"
              aria-label={`${val} star${val !== '1' ? 's' : ''} — ${labels[val]}`}
              onClick={() => setSelected(val)}
              onMouseEnter={() => setHovered(val)}
              onMouseLeave={() => setHovered('')}
              className="focus:outline-none focus:ring-2 focus:ring-teal rounded"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill={active ? '#376A6B' : 'none'}
                stroke={active ? '#376A6B' : '#CBD5E1'}
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )
        })}
        {(hovered || selected) && (
          <span className="font-body text-xs text-ink-light ml-2">{labels[hovered || selected]}</span>
        )}
      </div>
      {/* Hidden input carries the rating value into FormData on submit */}
      <input type="hidden" name={name} value={selected} required={required} />
    </div>
  )
}

function QuestionnaireForm() {
  const [formState, setFormState] = useState<FormState>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitForm('programme-questionnaire', Object.fromEntries(fd.entries()) as Record<string, string>)
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
        <h2 className="font-display font-bold text-h2 text-teal mb-3">Thank you!</h2>
        <p className="font-body text-sm text-ink-light leading-relaxed">
          Your feedback helps us improve and is genuinely appreciated. We'll use it to keep making our sessions better.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      name="programme-questionnaire"
      className="space-y-6 max-w-2xl"
    >
      <input type="hidden" name="form-name" value="programme-questionnaire" />

      <p className="font-body text-sm text-ink-light leading-relaxed">
        This short questionnaire takes about 3 minutes to complete. Your responses are anonymous unless you choose to share your name. All feedback is used to improve our sessions.
      </p>

      {/* Which programme */}
      <div>
        <label htmlFor="q-programme" className={labelClass}>
          Which programme are you giving feedback on? <span className="text-teal font-medium">*</span>
        </label>
        <select id="q-programme" name="programme" required className={inputClass}>
          <option value="">Select a programme</option>
          <option value="couch-to-5k">Couch to 5K</option>
          <option value="womens-run-club">Women's Run Club</option>
          <option value="stay-strong">Stay Strong</option>
          <option value="run-club">Flintshire Run Club</option>
          <option value="weightlifting">Flintshire Weightlifting Club</option>
        </select>
      </div>

      {/* Session date */}
      <div>
        <label htmlFor="q-date" className={labelClass}>
          Approximate date of session <span className="text-teal font-medium">*</span>
        </label>
        <input
          id="q-date"
          type="date"
          name="session-date"
          required
          max={new Date().toISOString().split('T')[0]}
          className={inputClass}
        />
      </div>

      {/* Ratings */}
      <div className="space-y-5 bg-surface-muted rounded-card p-5 border border-border">
        <p className="font-body font-semibold text-sm text-ink">How would you rate the following?</p>
        <StarRating name="rating-overall" label="Overall session experience" required />
        <StarRating name="rating-coaching" label="Quality of coaching" required />
        <StarRating name="rating-welcome" label="How welcome did you feel?" required />
        <StarRating name="rating-venue" label="Venue / meeting location" />
      </div>

      {/* Would recommend */}
      <div>
        <p className={labelClass}>
          Would you recommend this programme to a friend? <span className="text-teal font-medium">*</span>
        </p>
        <div className="flex gap-6 mt-1">
          {[
            { value: 'yes', label: 'Yes, definitely' },
            { value: 'maybe', label: 'Possibly' },
            { value: 'no', label: "Probably not" },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input type="radio" name="would-recommend" value={opt.value} required className="accent-teal h-4 w-4" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Wellbeing impact */}
      <div>
        <p className={labelClass}>Has participating affected your physical or mental wellbeing?</p>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { value: 'improved-both', label: 'Yes — improved both physical and mental wellbeing' },
            { value: 'improved-physical', label: 'Yes — improved physical wellbeing' },
            { value: 'improved-mental', label: 'Yes — improved mental wellbeing' },
            { value: 'no-change', label: "No noticeable change yet" },
            { value: 'too-early', label: "Too early to say" },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input type="radio" name="wellbeing-impact" value={opt.value} className="accent-teal h-4 w-4 flex-shrink-0" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* What went well */}
      <div>
        <label htmlFor="q-went-well" className={labelClass}>
          What did you enjoy most about the session?
        </label>
        <textarea
          id="q-went-well"
          name="what-went-well"
          rows={3}
          placeholder="Tell us what worked well…"
          className={`${inputClass} min-h-[80px] resize-y`}
        />
      </div>

      {/* Improvements */}
      <div>
        <label htmlFor="q-improve" className={labelClass}>
          Is there anything we could improve?
        </label>
        <textarea
          id="q-improve"
          name="improvements"
          rows={3}
          placeholder="Honest feedback helps us get better…"
          className={`${inputClass} min-h-[80px] resize-y`}
        />
      </div>

      {/* Optional name/email */}
      <div className="bg-surface-muted rounded-card p-4 border border-border">
        <p className="font-body font-semibold text-xs text-ink uppercase tracking-wide mb-2">Optional — Leave your details</p>
        <p className="font-body text-xs text-ink-light mb-4 leading-relaxed">
          If you'd like us to follow up on your feedback or get in touch about future sessions, you can share your details below. This is entirely optional.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="q-name" className={labelClass}>Name <span className="text-ink-light font-normal">(optional)</span></label>
            <input id="q-name" type="text" name="name" placeholder="Jane Smith" className={inputClass} />
          </div>
          <div>
            <label htmlFor="q-email" className={labelClass}>Email <span className="text-ink-light font-normal">(optional)</span></label>
            <input id="q-email" type="email" name="email" placeholder="jane@example.com" className={inputClass} />
          </div>
        </div>
        <div className="flex items-start gap-3 mt-4">
          <input
            id="q-contact-consent"
            type="checkbox"
            name="contact-consent"
            value="yes"
            className="mt-0.5 h-4 w-4 accent-teal flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="q-contact-consent" className="font-body text-xs text-ink-light leading-relaxed cursor-pointer">
            I'm happy for Lift Flintshire CIC to use these details to follow up on my feedback or contact me about sessions.
          </label>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={formState === 'submitting'}
      >
        {formState === 'submitting' ? 'Submitting…' : 'Send feedback'}
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

export default function Questionnaire() {
  return (
    <>
      <Seo
        title="Feedback — Lift Flintshire CIC"
        description="Share your feedback on a Lift Flintshire CIC programme session. Your responses help us keep improving."
        path="/questionnaire"
        ogTitle="Session Feedback — Lift Flintshire CIC"
        noindex
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Help us improve
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Session Feedback</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Takes about 3 minutes. Every piece of feedback shapes how we run our sessions — thank you.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <QuestionnaireForm />
      </SectionWrapper>
    </>
  )
}
