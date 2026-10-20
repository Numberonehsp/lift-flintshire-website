import { useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { NewsletterSignup } from '../components/forms/NewsletterSignup'

export default function Newsletter() {
  // Brevo's double opt-in link sends people back here with ?confirmed=1.
  const [params] = useSearchParams()
  const confirmed = params.get('confirmed') === '1'

  return (
    <>
      <Seo
        title="Newsletter · Lift Flintshire CIC"
        description="Sign up to the Lift Flintshire newsletter for news, session updates and events across Flintshire. No spam, unsubscribe any time."
        path="/newsletter"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Newsletter</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Stay in the loop</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Get Lift Flintshire news, session updates and events straight to your inbox.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="max-w-xl mx-auto">
          {confirmed && (
            <div role="status" className="mb-8 rounded-card border border-teal bg-teal-pale p-4">
              <p className="font-body font-semibold text-sm text-teal">
                Thanks, you're confirmed. Look out for our next newsletter.
              </p>
            </div>
          )}
          <h2 className="font-display font-extrabold text-h2 text-ink mb-4">Sign up</h2>
          <p className="font-body text-base text-ink-light leading-relaxed mb-6">
            News, session updates and events from across our programmes. No spam, and you can unsubscribe any time.
          </p>
          <NewsletterSignup tone="light" label="Newsletter sign-up" />
        </div>
      </SectionWrapper>
    </>
  )
}
