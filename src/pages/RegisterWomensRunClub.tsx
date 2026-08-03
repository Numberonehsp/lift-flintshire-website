import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { RegistrationForm } from '../components/forms/RegistrationForm'
import { WOMENS_RUN_CLUB_NEXT_SESSION, formatSessionDate, sessionHasPassed } from '../data/nextSessionDates'

const PROGRAMME_LABEL = "Women's Run Club"
const FORM_NAME = 'register-womens-run-club'

const INTRO =
  "Register below for our Women's Run Club sessions. " +
  "We will try to run the first Saturday of every month but keep an eye out for changes — all abilities welcome, walkers included. " +
  "Please complete all sections including the health declaration and waiver before your first session."

function NextSessionInfo() {
  if (sessionHasPassed(WOMENS_RUN_CLUB_NEXT_SESSION)) {
    return (
      <div className="bg-teal-pale rounded-card p-4 border border-teal/20">
        <p className="font-body font-semibold text-sm text-teal mb-1">Next session</p>
        <p className="font-body text-sm text-ink-light">
          Next date to be announced soon — email us at{' '}
          <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
            hello@liftflintshire.co.uk
          </a>{' '}
          for info.
        </p>
      </div>
    )
  }

  const dateLabel = formatSessionDate(WOMENS_RUN_CLUB_NEXT_SESSION)

  return (
    <div className="bg-teal-pale rounded-card p-4 border border-teal/20">
      <p className="font-body font-semibold text-sm text-teal mb-1">Next session</p>
      <p className="font-body text-sm text-ink-light mb-3">
        <strong className="text-ink">{dateLabel}</strong>
      </p>
      <ul className="font-body text-sm text-ink-light space-y-1">
        <li><strong className="text-ink">Time:</strong> 10:00–11:00am</li>
        <li><strong className="text-ink">Location:</strong> Deeside Athletics Track</li>
        <li><strong className="text-ink">Cost:</strong> Free</li>
        <li><strong className="text-ink">Who:</strong> Women and non-binary people of all abilities</li>
      </ul>
    </div>
  )
}

export default function RegisterWomensRunClub() {
  return (
    <>
      <Seo
        title="Register — Women's Run Club · Lift Flintshire CIC"
        description="Register for the free Lift Flintshire Women's Run Club. A monthly social group run in Flintshire for women and non-binary people of all abilities."
        path="/register/womens-run-club"
        ogTitle="Register for Women's Run Club — Lift Flintshire CIC"
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Free · We will try to run the first Saturday of every month but keep an eye out for changes
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">
          Women's Run Club — Register
        </h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          A safe, welcoming space to run, walk, and connect. Open to women and non-binary people of all abilities — we will try to run the first Saturday of every month but keep an eye out for changes.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main form */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-extrabold text-h2 text-ink mb-6">Registration Form</h2>
            <RegistrationForm
              programme="womens-run-club"
              formName={FORM_NAME}
              programmeLabel={PROGRAMME_LABEL}
              intro={INTRO}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NextSessionInfo />

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-2">A note on our sessions</p>
              <p className="font-body text-sm text-ink-light leading-relaxed">
                Our Women's Run Club is designed to be a safe and supportive space. Sessions are led by a qualified female coach. No one gets left behind — we always finish as a group.
              </p>
            </div>

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-2">What happens next?</p>
              <ol className="font-body text-sm text-ink-light space-y-2 list-decimal list-inside">
                <li>We'll confirm your registration by email within 2 working days.</li>
                <li>You'll get a reminder before the next session with the exact meeting point.</li>
                <li>Turn up in comfortable clothes and trainers — we'll handle the rest.</li>
              </ol>
            </div>

            <div className="bg-surface rounded-card border border-border p-5">
              <p className="font-body font-semibold text-sm text-ink mb-1">Questions?</p>
              <p className="font-body text-sm text-ink-light">
                Email us at{' '}
                <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
                  hello@liftflintshire.co.uk
                </a>
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
