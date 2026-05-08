import { Helmet } from 'react-helmet-async'
import { SectionWrapper } from '../components/layout/SectionWrapper'

const h2Class = 'font-display font-bold text-h3 text-ink mt-10 mb-3'
const h3Class = 'font-body font-semibold text-sm text-ink mt-6 mb-2'
const bodyClass = 'font-body text-sm text-ink-light leading-relaxed mb-3'
const listClass = 'font-body text-sm text-ink-light leading-relaxed mb-4 space-y-1 list-disc list-inside ml-2'

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-teal-pale border border-teal/30 rounded-card p-5 my-6">
      {children}
    </div>
  )
}

export default function Safeguarding() {
  return (
    <>
      <Helmet>
        <title>Safeguarding Policy — Lift Flintshire CIC</title>
        <meta name="description" content="Safeguarding policy for Lift Flintshire CIC — our commitment to protecting adults at risk and children in all our programmes." />
        <meta property="og:title" content="Safeguarding Policy — Lift Flintshire CIC" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <SectionWrapper variant="dark">
        <p className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-teal mb-4">Our commitment</p>
        <h1 className="font-display font-black text-h1 text-white uppercase mb-4">Safeguarding Policy</h1>
        <p className="font-body text-lg text-white/70 max-w-xl leading-relaxed">
          Lift Flintshire CIC is committed to the safety, welfare, and dignity of every person who takes part in our programmes.
        </p>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="max-w-3xl">

          <p className={bodyClass}>
            Last updated: <strong>May 2026</strong> &nbsp;·&nbsp; Review due: <strong>May 2027</strong>
          </p>

          <AlertBox>
            <p className="font-body font-semibold text-sm text-teal mb-1">Designated Safeguarding Lead (DSL)</p>
            <p className="font-body text-sm text-ink-light mb-1">
              <strong className="text-ink">Mark Hanson</strong><br />
              Email: <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">hello@liftflintshire.co.uk</a>
            </p>
            <p className="font-body text-xs text-ink-light mt-3 pt-3 border-t border-teal/20">
              <strong>In an emergency where someone is at immediate risk:</strong> call <strong>999</strong>.<br />
              Flintshire Adult Safeguarding: <strong>01352 803444</strong> (office hours) · <strong>0300 456 1100</strong> (out of hours).<br />
              Flintshire Children's Services: <strong>01352 701000</strong> (office hours) · <strong>0300 456 1100</strong> (out of hours).
            </p>
          </AlertBox>

          {/* 1. Policy statement */}
          <h2 className={h2Class}>1. Policy statement</h2>
          <p className={bodyClass}>
            Lift Flintshire CIC believes that everyone — regardless of age, gender, disability, race, religion, sexual orientation, or background — has the right to take part in physical activity free from abuse, harm, or exploitation. We recognise that some of the people we work with may be adults at risk or children, and we take our responsibility to protect them seriously.
          </p>
          <p className={bodyClass}>
            This policy applies to all Lift Flintshire CIC staff, coaches, volunteers, trustees, and contractors. Compliance is mandatory. Failure to follow this policy may result in disciplinary action or referral to statutory agencies.
          </p>

          {/* 2. Scope */}
          <h2 className={h2Class}>2. Scope and definitions</h2>
          <h3 className={h3Class}>Adults at risk</h3>
          <p className={bodyClass}>
            Under the <strong>Social Services and Well-being (Wales) Act 2014</strong>, an adult at risk is a person aged 18 or over who is experiencing or is at risk of abuse or neglect, and has needs for care and support which mean they cannot protect themselves. Many of our participants — including older adults in Stay Strong, people with long-term health conditions, and those referred by health professionals — may fall into this category.
          </p>
          <h3 className={h3Class}>Children</h3>
          <p className={bodyClass}>
            A child is any person under the age of 18. Our programmes are primarily adult-focused but may occasionally include under-18s with parental consent. The same safeguarding standards apply.
          </p>
          <h3 className={h3Class}>Types of abuse</h3>
          <p className={bodyClass}>We are alert to all forms of abuse, including but not limited to:</p>
          <ul className={listClass}>
            <li><strong>Physical abuse</strong> — hitting, pushing, restraining, inappropriate physical intervention</li>
            <li><strong>Emotional / psychological abuse</strong> — threats, humiliation, controlling behaviour, isolation</li>
            <li><strong>Sexual abuse</strong> — any non-consensual sexual act or behaviour</li>
            <li><strong>Financial abuse</strong> — theft, fraud, coercion relating to money or assets</li>
            <li><strong>Neglect</strong> — failure to provide adequate care, including medical neglect</li>
            <li><strong>Discriminatory abuse</strong> — abuse linked to a person's characteristics, including race, disability, or age</li>
            <li><strong>Institutional abuse</strong> — mistreatment within an organisation's culture or practices</li>
            <li><strong>Domestic abuse</strong> — coercive control or violence within a personal relationship</li>
          </ul>

          {/* 3. Responsibilities */}
          <h2 className={h2Class}>3. Roles and responsibilities</h2>
          <h3 className={h3Class}>Designated Safeguarding Lead (DSL)</h3>
          <p className={bodyClass}>
            The DSL is the named individual responsible for overseeing all safeguarding matters. Their responsibilities include: receiving and recording all safeguarding concerns; deciding whether to refer to statutory agencies; keeping records securely; ensuring all staff and volunteers receive appropriate safeguarding training; and reviewing this policy annually.
          </p>
          <h3 className={h3Class}>All staff, coaches, and volunteers</h3>
          <p className={bodyClass}>Everyone working with Lift Flintshire CIC is responsible for:</p>
          <ul className={listClass}>
            <li>Completing safeguarding awareness training before working with participants</li>
            <li>Being alert to signs of abuse or concern and reporting them to the DSL promptly</li>
            <li>Never investigating a safeguarding concern themselves — always referring to the DSL</li>
            <li>Maintaining appropriate professional boundaries with all participants</li>
            <li>Never sharing personal participant data except as required by this policy</li>
          </ul>

          {/* 4. Safer recruitment */}
          <h2 className={h2Class}>4. Safer recruitment</h2>
          <p className={bodyClass}>
            Lift Flintshire CIC is committed to safer recruitment practices. All coaches, volunteers, and staff who work directly with adults at risk or children are required to hold a current enhanced <strong>Disclosure and Barring Service (DBS) check</strong> before commencing work. DBS checks are renewed every three years or where a concern arises.
          </p>
          <p className={bodyClass}>
            References are taken up for all new appointments and a probationary period applies. Any gaps in employment history are discussed at interview.
          </p>

          {/* 5. Code of conduct */}
          <h2 className={h2Class}>5. Code of conduct</h2>
          <p className={bodyClass}>All Lift Flintshire CIC personnel must:</p>
          <ul className={listClass}>
            <li>Treat all participants with dignity, respect, and professionalism at all times</li>
            <li>Never use physical punishment, inappropriate physical contact, or intimidating language</li>
            <li>Avoid being alone with a single participant in a closed or isolated space where possible</li>
            <li>Not share personal contact details with participants or communicate via personal social media accounts</li>
            <li>Not consume alcohol before or during sessions</li>
            <li>Not develop inappropriate personal relationships with participants</li>
            <li>Report any situation where boundaries are unclear to the DSL</li>
          </ul>
          <p className={bodyClass}>
            Any touch involved in coaching (e.g. correcting technique) must be explained in advance, be appropriate to the activity, and never take place if the participant has indicated they do not consent.
          </p>

          {/* 6. Photography */}
          <h2 className={h2Class}>6. Photography and social media</h2>
          <p className={bodyClass}>
            Photographs and video of participants may only be taken with explicit, written consent obtained via the programme registration form. Consent may be withdrawn at any time. Images of identifiable participants must not be shared on personal social media accounts. All imagery must be appropriate and dignified.
          </p>
          <p className={bodyClass}>
            No images of under-18s will be shared publicly in any circumstances without the written consent of a parent or guardian. When in doubt, do not photograph.
          </p>

          {/* 7. Reporting */}
          <h2 className={h2Class}>7. Reporting a concern</h2>
          <p className={bodyClass}>
            If you witness something concerning, or if a participant discloses something to you, follow these steps:
          </p>
          <ol className="font-body text-sm text-ink-light leading-relaxed mb-4 space-y-3 list-decimal list-inside ml-2">
            <li><strong>Listen and stay calm.</strong> Do not ask leading questions or investigate yourself. If someone is making a disclosure, listen carefully and let them speak at their own pace.</li>
            <li><strong>Do not promise confidentiality.</strong> Explain that you may need to share what they tell you to keep them or others safe.</li>
            <li><strong>Record what you have seen or heard</strong> as soon as possible, using the person's own words where a disclosure was made. Note the date, time, location, and anyone else present.</li>
            <li><strong>Report to the DSL immediately.</strong> Do not delay and do not attempt to resolve the situation yourself.</li>
            <li><strong>If the DSL is unavailable</strong> and there is an immediate risk of harm, contact Flintshire County Council or the police directly (see contact details above).</li>
          </ol>
          <p className={bodyClass}>
            All concerns are recorded by the DSL and stored securely in accordance with our Privacy Policy. Records are kept for a minimum of six years.
          </p>

          {/* 8. Allegations against staff */}
          <h2 className={h2Class}>8. Allegations against staff or volunteers</h2>
          <p className={bodyClass}>
            If an allegation is made against a member of staff, coach, or volunteer, the following applies:
          </p>
          <ul className={listClass}>
            <li>The allegation must be reported to the DSL immediately (or, if the allegation is against the DSL, to a trustee)</li>
            <li>The individual concerned will be suspended from all participant-facing activities pending investigation — this is a neutral act and does not imply guilt</li>
            <li>Flintshire County Council and, where appropriate, the DBS will be notified</li>
            <li>Lift Flintshire CIC will cooperate fully with any statutory investigation</li>
          </ul>

          {/* 9. Legislation */}
          <h2 className={h2Class}>9. Relevant legislation and guidance</h2>
          <ul className={listClass}>
            <li>Social Services and Well-being (Wales) Act 2014</li>
            <li>Safeguarding Vulnerable Groups Act 2006</li>
            <li>Children Act 1989 and 2004</li>
            <li>Protection of Freedoms Act 2012</li>
            <li>Human Rights Act 1998</li>
            <li>Equality Act 2010</li>
            <li>Wales Safeguarding Procedures 2019 (<a href="https://www.safeguarding.wales" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">safeguarding.wales</a>)</li>
            <li>Sport Wales / ukactive safeguarding guidance for physical activity providers</li>
          </ul>

          {/* 10. Training */}
          <h2 className={h2Class}>10. Training</h2>
          <p className={bodyClass}>
            All coaches, volunteers, and staff complete safeguarding awareness training before working with participants and refresh this training every two years. The DSL holds a current safeguarding qualification appropriate to their role. Training records are maintained by the DSL.
          </p>

          {/* 11. Review */}
          <h2 className={h2Class}>11. Policy review</h2>
          <p className={bodyClass}>
            This policy is reviewed annually by the DSL and a trustee, or immediately following any safeguarding incident or significant change in legislation. The review date is shown at the top of this document.
          </p>

          {/* 12. Contact */}
          <h2 className={h2Class}>12. Concerns about this policy</h2>
          <p className={bodyClass}>
            If you have a concern about how Lift Flintshire CIC is implementing its safeguarding responsibilities, you may contact our Designated Safeguarding Lead at{' '}
            <a href="mailto:hello@liftflintshire.co.uk" className="text-teal hover:underline">
              hello@liftflintshire.co.uk
            </a>.
            You may also contact <strong>Social Care Wales</strong> or report concerns directly to{' '}
            <strong>Flintshire County Council Adult Safeguarding Team</strong> on <strong>01352 803444</strong>.
          </p>

        </div>
      </SectionWrapper>
    </>
  )
}
