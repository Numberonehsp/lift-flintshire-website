import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { RegistrationForm } from '../components/forms/RegistrationForm'

const PROGRAMME_LABEL = 'Couch to 5K'
const FORM_NAME = 'register-couch-to-5k'

const INTRO =
  'Register below to secure your place on our free Couch to 5K programme. ' +
  'The programme runs over 8 weeks and is open to complete beginners — no running experience needed. ' +
  'Please complete all sections including the health declaration and waiver before your first session.'

function SessionInfo() {
  return (
    <div className="bg-teal-pale rounded-card p-4 border border-teal/20">
      <p className="font-body font-semibold text-sm text-teal mb-1">Programme details</p>
      <ul className="font-body text-sm text-ink-light space-y-1">
        <li><strong className="text-ink">Duration:</strong> 8 weeks</li>
        <li><strong className="text-ink">Sessions:</strong> 3 per week (1 guided group run and 2 optional group or homework runs)</li>
        <li><strong className="text-ink">Cost:</strong> Free</li>
        <li><strong className="text-ink">What to bring:</strong> Trainers and comfortable clothing</li>
      </ul>
    </div>
  )
}

export default function RegisterCouchTo5k() {
  return (
    <>
      <Helmet>
        <title>Register — Couch to 5K · Lift Flintshire CIC</title>
        <meta
          name="description"
          content="Register for the free Lift Flintshire Couch to 5K programme. An 8-week beginner running programme in Flintshire, North Wales."
        />
        <meta property="og:title" content="Register for Couch to 5K — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Free programme · Beginners welcome
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">
          Couch to 5K — Register
        </h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Eight weeks from your sofa to your first 5K. Join our free, coach-led programme and run your first 5K in Flintshire.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main form */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-extrabold text-h2 text-ink mb-6">Registration Form</h2>
            <RegistrationForm
              programme="couch-to-5k"
              formName={FORM_NAME}
              programmeLabel={PROGRAMME_LABEL}
              intro={INTRO}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SessionInfo />

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-2">What happens next?</p>
              <ol className="font-body text-sm text-ink-light space-y-2 list-decimal list-inside">
                <li>We'll confirm your registration by email within 2 working days.</li>
                <li>You'll receive session times, location, and a welcome pack.</li>
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
