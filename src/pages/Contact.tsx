import { useState } from 'react'
import type { FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'

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

const inputClass = 'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'

function ContactForm() {
  const [state, setState] = useState<FormState>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitNetlifyForm('contact', Object.fromEntries(fd.entries()) as Record<string, string>)
      setState('success')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-teal-pale rounded-card p-8 text-center">
        <h3 className="font-display font-bold text-h3 text-teal mb-2">Message sent!</h3>
        <p className="font-body text-sm text-ink-light">Thank you for getting in touch. We aim to respond within two working days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-netlify="true" name="contact" className="space-y-4">
      <input type="hidden" name="form-name" value="contact" />
      <div>
        <label htmlFor="contact-name" className={labelClass}>Full name</label>
        <input id="contact-name" type="text" name="name" required placeholder="Jane Smith" className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-email" className={labelClass}>Email address</label>
        <input id="contact-email" type="email" name="email" required placeholder="jane@example.com" className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-phone" className={labelClass}>Phone number <span className="text-ink-light font-normal">(optional)</span></label>
        <input id="contact-phone" type="tel" name="phone" placeholder="07700 000000" className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-subject" className={labelClass}>Subject</label>
        <select id="contact-subject" name="subject" required className={inputClass}>
          <option value="">Select a subject</option>
          <option>General Enquiry</option>
          <option>Volunteering</option>
          <option>Partnership</option>
          <option>Media</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>Message</label>
        <textarea id="contact-message" name="message" required rows={5} placeholder="How can we help?" className={`${inputClass} min-h-[120px] resize-y`} />
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending...' : 'Send message'}
      </Button>
      {state === 'error' && (
        <p className="font-body text-xs text-red-600 text-center">
          Something went wrong. Please try again or email us directly at hello@liftflintshire.org
        </p>
      )}
    </form>
  )
}

function ReferralForm() {
  const [state, setState] = useState<FormState>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitNetlifyForm('referral', Object.fromEntries(fd.entries()) as Record<string, string>)
      setState('success')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-teal-pale rounded-card p-8 text-center">
        <h3 className="font-display font-bold text-h3 text-teal mb-2">Referral submitted!</h3>
        <p className="font-body text-sm text-ink-light">
          Thank you for the referral. We'll contact you and the client within three working days to arrange an introduction.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-netlify="true" name="referral" className="space-y-4">
      <input type="hidden" name="form-name" value="referral" />
      <p className="font-body text-sm text-ink-light mb-2">
        For GPs, social prescribers, and health &amp; care professionals referring clients to our programmes.
      </p>
      <div>
        <label htmlFor="ref-name" className={labelClass}>Your name</label>
        <input id="ref-name" type="text" name="referrer-name" required placeholder="Dr. A. Jones" className={inputClass} />
      </div>
      <div>
        <label htmlFor="ref-org" className={labelClass}>Your organisation</label>
        <input id="ref-org" type="text" name="referrer-organisation" required placeholder="Mold Medical Practice" className={inputClass} />
      </div>
      <div>
        <label htmlFor="ref-email" className={labelClass}>Your email</label>
        <input id="ref-email" type="email" name="referrer-email" required placeholder="a.jones@nhswales.nhs.uk" className={inputClass} />
      </div>
      <div>
        <label htmlFor="ref-phone" className={labelClass}>Your phone</label>
        <input id="ref-phone" type="tel" name="referrer-phone" placeholder="01352 000000" className={inputClass} />
      </div>
      <hr className="border-border" />
      <div>
        <label htmlFor="client-name" className={labelClass}>Client first name</label>
        <input id="client-name" type="text" name="client-first-name" required placeholder="First name only" className={inputClass} />
      </div>
      <div>
        <label htmlFor="client-age" className={labelClass}>Client age group</label>
        <select id="client-age" name="client-age-group" required className={inputClass}>
          <option value="">Select age group</option>
          <option>Under 30</option>
          <option>30–60</option>
          <option>Over 60</option>
        </select>
      </div>
      <div>
        <label htmlFor="ref-reason" className={labelClass}>Reason for referral</label>
        <textarea
          id="ref-reason"
          name="reason"
          required
          rows={4}
          placeholder="Please describe why you are referring this client and any relevant health or social context."
          className={`${inputClass} min-h-[100px] resize-y`}
        />
      </div>
      <div>
        <label htmlFor="ref-programme" className={labelClass}>Programme of interest</label>
        <select id="ref-programme" name="programme" required className={inputClass}>
          <option value="">Select a programme</option>
          <option>Stay Strong</option>
          <option>Flintshire Run Club</option>
          <option>Flintshire Weightlifting Club</option>
          <option>Not Sure</option>
        </select>
      </div>
      <div className="flex items-start gap-3">
        <input id="consent" type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-teal flex-shrink-0" />
        <label htmlFor="consent" className="font-body text-sm text-ink-light leading-relaxed">
          The client has given their informed consent to this referral and understands that Lift Flintshire CIC will contact them about our programmes.
        </label>
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Submitting...' : 'Submit referral'}
      </Button>
      {state === 'error' && (
        <p className="font-body text-xs text-red-600 text-center">
          Something went wrong. Please try again or call us directly.
        </p>
      )}
    </form>
  )
}

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact &amp; Referral — Lift Flintshire CIC</title>
        <meta name="description" content="Get in touch with Lift Flintshire CIC or refer a client via our GP and agency referral form. We respond within two working days." />
        <meta property="og:title" content="Contact & Referral — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Get involved</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Get in Touch</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Whether you have a question, want to volunteer, or are a health professional looking to refer a client — we'd love to hear from you.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2 className="font-display font-extrabold text-h2 text-ink mb-6">General Enquiry</h2>
            <ContactForm />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-h2 text-ink mb-6">GP / Agency Referral</h2>
            <ReferralForm />
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
