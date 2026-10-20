import { Seo } from '../components/Seo'
import { SectionWrapper } from '../components/layout/SectionWrapper'

const headingClass = 'font-display font-bold text-h3 text-ink mt-10 mb-3'
const subheadingClass = 'font-body font-semibold text-sm text-ink mt-6 mb-2'
const bodyClass = 'font-body text-sm text-ink-light leading-relaxed mb-3'
const listClass = 'font-body text-sm text-ink-light leading-relaxed mb-3 space-y-1 list-disc list-inside'

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy — Lift Flintshire CIC"
        description="Privacy Policy for Lift Flintshire CIC — how we collect, use, and protect your personal data in line with UK GDPR."
        path="/privacy"
        noindex
      />

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal-light mb-4">Transparency</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Privacy Policy</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          How Lift Flintshire CIC collects, uses, and protects your personal data.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="max-w-3xl">

          <p className={bodyClass}>
            This Privacy Policy explains how <strong>Lift Flintshire Community Interest Company</strong> ("Lift Flintshire CIC", "we", "us", "our") collects and uses your personal data when you visit our website or use our services. It applies to all personal data we process and reflects our obligations under the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>.
          </p>
          <p className={bodyClass}>
            Last updated: <strong>October 2026</strong>
          </p>

          {/* Who we are */}
          <h2 className={headingClass}>1. Who we are</h2>
          <p className={bodyClass}>
            Lift Flintshire CIC is a Community Interest Company registered in England and Wales, delivering inclusive strength, fitness, and wellbeing programmes across Flintshire, North Wales.
          </p>
          <p className={bodyClass}>
            <strong>Data Controller:</strong> Lift Flintshire CIC<br />
            <strong>Contact:</strong>{' '}
            <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
              hello@liftflintshire.co.uk
            </a>
          </p>
          <p className={bodyClass}>
            Lift Flintshire CIC is exempt from paying the ICO data protection fee under the <strong>not-for-profit exemption</strong>, as we only process personal data necessary to establish and maintain membership or participation in our programmes. This exemption does not affect your rights under UK GDPR as set out in this policy.
          </p>

          {/* What data we collect */}
          <h2 className={headingClass}>2. What personal data we collect and why</h2>

          <h3 className={subheadingClass}>Contact enquiries</h3>
          <p className={bodyClass}>When you use our contact form, we collect your name, email address, phone number (optional), and message. We use this to respond to your enquiry. The legal basis is our <strong>legitimate interests</strong> in responding to communications.</p>

          <h3 className={subheadingClass}>Programme registration (Couch to 5K and Women's Run Club)</h3>
          <p className={bodyClass}>When you register for a programme, we collect:</p>
          <ul className={listClass}>
            <li>Name, date of birth, email address, and phone number</li>
            <li>Emergency contact name, relationship, and phone number</li>
            <li>Health and medical information, including existing conditions and injuries</li>
            <li>Consents given — including GDPR consent, photo/video consent, and your signed participation waiver</li>
          </ul>
          <p className={bodyClass}>
            Girls Gym Sessions are booked by schools and sports teams through our contact form, which collects only the details described under "Contact enquiries" above. We do not take individual registrations for them.
          </p>
          <p className={bodyClass}>
            Health and medical information is <strong>special category data</strong> under UK GDPR. We collect it solely to enable our coaches to support your safe participation. The legal basis for processing this data is your <strong>explicit consent</strong> (or, for young people, the consent of their parent or guardian), given when the registration form is completed.
          </p>

          <h3 className={subheadingClass}>Youth Weightlifting enquiries</h3>
          <p className={bodyClass}>When a parent or guardian sends an enquiry about Youth Weightlifting, we collect their name, email address, phone number (optional), the young person's first name and school year, and any message they choose to add. We use this only to reply to the enquiry and tell you about sessions. We do not collect health information at this stage. The legal basis is your <strong>consent</strong>. If the young person goes on to take part, we will ask for registration and health details separately.</p>

          <h3 className={subheadingClass}>Session feedback (questionnaire)</h3>
          <p className={bodyClass}>When you complete our feedback questionnaire, we collect your ratings and comments. You may optionally provide your name and email for follow-up. The legal basis is your <strong>consent</strong>.</p>

          {/* How we store data */}
          <h2 className={headingClass}>3. How and where we store your data</h2>
          <p className={bodyClass}>We use the following services to store and process your data:</p>
          <ul className={listClass}>
            <li><strong>Vercel</strong> — our website and form submission service are hosted on Vercel's infrastructure (USA). Vercel Inc. participates in the EU–US Data Privacy Framework and provides appropriate safeguards for international transfers.</li>
            <li><strong>Resend</strong> — form submissions are emailed to us via Resend, an email delivery service (USA). Resend relies on Standard Contractual Clauses to provide appropriate safeguards for international transfers.</li>
            <li><strong>Brevo</strong> — if you choose to receive email updates from us (see section 6), your email address and the details listed there are held by Brevo, the email service we use to send them. We send Brevo only those details, never health, medical, emergency contact, date of birth or waiver information.</li>
            <li><strong>Google Sheets</strong> — participant registration records are also saved to a private Google Sheet accessible only to authorised Lift Flintshire CIC staff. Google LLC participates in the EU–US Data Privacy Framework. Contact enquiries are not saved to this sheet.</li>
          </ul>
          <p className={bodyClass}>
            All data is stored securely and access is restricted to authorised personnel only. We do not use unsecured email to transmit sensitive participant data.
          </p>

          {/* Retention */}
          <h2 className={headingClass}>4. How long we keep your data</h2>
          <ul className={listClass}>
            <li><strong>Contact enquiries:</strong> deleted after 12 months</li>
            <li><strong>Registration and health data:</strong> retained for the duration of your participation and deleted 3 years after your last session, unless you request earlier deletion</li>
            <li><strong>Session feedback:</strong> anonymised responses kept indefinitely; identified responses deleted after 12 months</li>
            <li><strong>Email updates:</strong> your email address stays on our mailing lists until you unsubscribe or ask us to remove it (see section 6)</li>
          </ul>

          {/* Sharing */}
          <h2 className={headingClass}>5. Who we share your data with</h2>
          <p className={bodyClass}>
            We do not sell, rent, or share your personal data with third parties for marketing purposes. We may share data in the following limited circumstances:
          </p>
          <ul className={listClass}>
            <li>With our technology providers (Vercel, Resend, Brevo, Google) as described above, for the purposes of operating our website and storing records</li>
            <li>Where required by law, for example in response to a court order or regulatory obligation</li>
            <li>In an emergency, with emergency services if we need to share your emergency contact or medical information</li>
          </ul>

          {/* Email updates */}
          <h2 className={headingClass}>6. Email updates</h2>
          <p className={bodyClass}>
            If you want to hear from us, we can email you news about our programmes and events. This is optional and we only do it if you ask us to.
          </p>

          <h3 className={subheadingClass}>How you opt in</h3>
          <ul className={listClass}>
            <li>By ticking the unticked email updates box on a registration form, an event entry form or the Youth Weightlifting enquiry form, or</li>
            <li>By entering your email address in the newsletter sign-up form on our website and confirming the tick box. We may ask you to confirm your email address by clicking a link we email you before we add you to the list.</li>
          </ul>
          <p className={bodyClass}>
            We never add anyone to our mailing lists automatically. Ticking the privacy or health consent boxes on a form is separate and does not sign you up. The legal basis is your <strong>consent</strong>, and registering or entering an event works the same whether or not you tick the box.
          </p>

          <h3 className={subheadingClass}>What we send to Brevo, and what we record</h3>
          <p className={bodyClass}>
            Our email service provider is <strong>Brevo</strong>, which acts as a data processor on our behalf. When you opt in, we send Brevo:
          </p>
          <ul className={listClass}>
            <li>Your email address, and your first name and last name where the form collected them (the newsletter form collects only an email address)</li>
            <li>The date and time you gave consent, and which form it came from (for example the newsletter sign-up, a programme registration or an event entry)</li>
            <li>The mailing lists you are on: the general newsletter, plus the programme or event you registered or entered, so we can email people about that programme or event</li>
          </ul>
          <p className={bodyClass}>
            We do not send Brevo any health, medical, emergency contact, date of birth or waiver information.
          </p>
          <p className={bodyClass}>
            If something goes wrong when we pass your details to Brevo, your registration or event entry is still saved and confirmed, but you will not receive email updates until we have fixed it.
          </p>

          <h3 className={subheadingClass}>Youth Weightlifting</h3>
          <p className={bodyClass}>
            For Youth Weightlifting, only a parent or guardian can opt in, using a separate tick box on the enquiry form. We send Brevo the parent or guardian's email address only. We do not send Brevo the young person's name or school year, or the parent or guardian's name. Their address goes on its own guardians list, not the general newsletter.
          </p>

          <h3 className={subheadingClass}>Unsubscribing and how long we keep your address</h3>
          <p className={bodyClass}>
            Every email we send includes an unsubscribe link. You can also email{' '}
            <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
              hello@liftflintshire.co.uk
            </a>{' '}
            at any time and we will remove you. We keep your address on our mailing lists until you unsubscribe or ask us to remove it. Withdrawing consent does not affect your registration, entry or any other service.
          </p>

          {/* Photography */}
          <h2 className={headingClass}>7. Photography and video</h2>
          <p className={bodyClass}>
            We may take photographs or video footage during sessions for use on our website and social media. We only do this for participants who have given explicit consent via the registration form. You may withdraw consent at any time by emailing{' '}
            <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
              hello@liftflintshire.co.uk
            </a>{' '}
            or speaking to a coach. Withdrawal of consent will not affect images already published, but we will remove them where reasonably practicable.
          </p>

          {/* Cookies */}
          <h2 className={headingClass}>8. Cookies</h2>
          <p className={bodyClass}>
            Our website uses only essential cookies required for basic functionality. We do not currently use analytics, advertising, or tracking cookies. If this changes, we will update this policy and, where required, ask for your consent.
          </p>

          {/* Your rights */}
          <h2 className={headingClass}>9. Your rights</h2>
          <p className={bodyClass}>Under UK GDPR you have the right to:</p>
          <ul className={listClass}>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong>Rectification</strong> — ask us to correct inaccurate or incomplete data</li>
            <li><strong>Erasure</strong> — ask us to delete your data (subject to any legal obligations to retain it)</li>
            <li><strong>Restriction</strong> — ask us to restrict how we use your data while a dispute is resolved</li>
            <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
            <li><strong>Object</strong> — object to processing based on legitimate interests</li>
            <li><strong>Withdraw consent</strong> — where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing</li>
          </ul>
          <p className={bodyClass}>
            To exercise any of these rights, email{' '}
            <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
              hello@liftflintshire.co.uk
            </a>. We will respond within 30 days.
          </p>

          {/* Complaints */}
          <h2 className={headingClass}>10. Complaints</h2>
          <p className={bodyClass}>
            If you believe we have mishandled your personal data, you have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong>:
          </p>
          <ul className={listClass}>
            <li>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">ico.org.uk</a></li>
            <li>Helpline: 0303 123 1113</li>
          </ul>
          <p className={bodyClass}>We would always prefer to resolve any concerns directly — please contact us first.</p>

          {/* Changes */}
          <h2 className={headingClass}>11. Changes to this policy</h2>
          <p className={bodyClass}>
            We may update this Privacy Policy from time to time. The "last updated" date at the top of this page will reflect any changes. We encourage you to review this page periodically.
          </p>

        </div>
      </SectionWrapper>
    </>
  )
}
