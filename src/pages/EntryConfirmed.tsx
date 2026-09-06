import { useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { Button } from '../components/ui/Button'

export default function EntryConfirmed() {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')

  return (
    <>
      <Seo
        title="Entry confirmed · Lift Flintshire CIC"
        description="Your event entry has been confirmed."
        path="/events/entry-confirmed"
        noindex
      />

      <SectionWrapper variant="light" innerClassName="max-w-xl text-center">
        <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-display font-bold text-h2 text-teal mb-2">Entry confirmed!</h1>

        {ref && (
          <p className="font-body text-lg text-ink mb-4">
            Your entry reference is <strong className="text-teal">{ref}</strong>
          </p>
        )}

        <p className="font-body text-sm text-ink-light mb-8 leading-relaxed">
          A confirmation email with your entry reference is on its way, do check your spam
          folder if it doesn't arrive shortly. We'll be in touch with final instructions
          closer to the event.
        </p>

        <Button variant="primary" href="/events">Back to events</Button>
      </SectionWrapper>
    </>
  )
}
