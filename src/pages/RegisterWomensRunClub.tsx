import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'
import { RegistrationForm } from '../components/forms/RegistrationForm'

const PROGRAMME_LABEL = "Women's Run Club"
const FORM_NAME = 'register-womens-run-club'

const INTRO =
  "Register below for our Women's Run Club sessions. " +
  "We meet on the first Saturday of every month for a welcoming, social group run — all abilities welcome, walkers included. " +
  "Please complete all sections including the health declaration and waiver before your first session."

function NextSessionInfo() {
  function getNextFirstSaturday(): string {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    const dayOfWeek = d.getDay()
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
    d.setDate(1 + daysUntilSaturday)
    if (d <= now) {
      d.setMonth(d.getMonth() + 1)
      d.setDate(1)
      const nextDay = d.getDay()
      const nextDaysUntil = (6 - nextDay + 7) % 7
      d.setDate(1 + nextDaysUntil)
    }
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="bg-teal-pale rounded-card p-4 border border-teal/20">
      <p className="font-body font-semibold text-sm text-teal mb-1">Next session</p>
      <p className="font-body text-sm text-ink-light mb-3">
        <strong className="text-ink">{getNextFirstSaturday()}</strong>
      </p>
      <ul className="font-body text-sm text-ink-light space-y-1">
        <li><strong className="text-ink">Time:</strong> 9:00–10:00am</li>
        <li><strong className="text-ink">Location:</strong> Mold Town Centre</li>
        <li><strong className="text-ink">Cost:</strong> Free</li>
        <li><strong className="text-ink">Who:</strong> Women and non-binary people of all abilities</li>
      </ul>
    </div>
  )
}

export default function RegisterWomensRunClub() {
  return (
    <>
      <Helmet>
        <title>Register — Women's Run Club · Lift Flintshire CIC</title>
        <meta
          name="description"
          content="Register for the free Lift Flintshire Women's Run Club. A monthly social group run in Flintshire for women and non-binary people of all abilities."
        />
        <meta property="og:title" content="Register for Women's Run Club — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">
          Free · First Saturday of every month
        </p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">
          Women's Run Club — Register
        </h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          A safe, welcoming space to run, walk, and connect. Open to women and non-binary people of all abilities — every first Saturday of the month.
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
