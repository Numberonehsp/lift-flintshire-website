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

const inputClass = 'w-full font-body text-sm border border-border rounded-btn px-4 py-3 bg-surface focus:outline-none focus:ring-2 focus:ring-teal min-h-[44px] placeholder:text-ink-light/60'
const labelClass = 'block font-body font-medium text-sm text-ink mb-1'

function ContactForm() {
  const [state, setState] = useState<FormState>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    const fd = new FormData(e.currentTarget)
    try {
      await submitForm('contact', Object.fromEntries(fd.entries()) as Record<string, string>)
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
    <form onSubmit={handleSubmit} name="contact" className="space-y-4">
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
          Something went wrong. Please try again or email us directly at hello@liftflintshire.co.uk
        </p>
      )}
    </form>
  )
}


export default function Contact() {
  return (
    <>
      <Seo
        title="Contact — Lift Flintshire CIC"
        description="Get in touch with Lift Flintshire CIC. Questions, volunteering, partnerships — we'd love to hear from you. We respond within two working days."
        path="/contact"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Get involved</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Get in Touch</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Whether you have a question, want to volunteer, or are interested in partnering with us — we'd love to hear from you.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2 className="font-display font-extrabold text-h2 text-ink mb-6">Send us a message</h2>
            <ContactForm />
          </div>
          <div className="space-y-6">
            <div className="bg-surface rounded-card border border-border p-6">
              <p className="font-body font-semibold text-sm text-ink mb-1">Email us directly</p>
              <a href="mailto:hello@liftflintshire.co.uk" className="font-body text-teal hover:underline text-sm">
                hello@liftflintshire.co.uk
              </a>
              <p className="font-body text-xs text-ink-light mt-2">We aim to respond within two working days.</p>
            </div>
            <div className="bg-surface rounded-card border border-border p-6">
              <p className="font-body font-semibold text-sm text-ink mb-2">Want to get involved?</p>
              <p className="font-body text-sm text-ink-light leading-relaxed">
                We're always looking for volunteers, coaches, and community partners. Drop us a message using the form and tell us a bit about yourself.
              </p>
            </div>
            <div className="bg-surface rounded-card border border-border p-6">
              <p className="font-body font-semibold text-sm text-ink mb-2">Register for a programme</p>
              <p className="font-body text-sm text-ink-light leading-relaxed mb-3">
                Ready to join? You can register directly for our Couch to 5K, Women's Run Club, and Youth Strength &amp; Conditioning programmes.
              </p>
              <div className="flex flex-col gap-2">
                <a href="/register/couch-to-5k" className="font-body text-sm text-teal hover:underline font-medium">Register for Couch to 5K →</a>
                <a href="/register/womens-run-club" className="font-body text-sm text-teal hover:underline font-medium">Register for Women's Run Club →</a>
                <a href="/register/youth-strength-conditioning" className="font-body text-sm text-teal hover:underline font-medium">Register for Youth Strength &amp; Conditioning →</a>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
