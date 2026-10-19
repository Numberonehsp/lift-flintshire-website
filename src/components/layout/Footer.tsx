import { Link } from 'react-router-dom'
import { footerNav } from '../../data/navigation'
import { NewsletterSignup } from '../forms/NewsletterSignup'
import { InstagramIcon } from '../ui/InstagramIcon'
import { LIFT_FLINTSHIRE_INSTAGRAM_URL, RUN_CLUB_INSTAGRAM_URL } from '../../data/links'

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Col 1: Brand */}
          <div>
            <img
              src="/logo-white.png"
              alt="Lift Flintshire CIC"
              className="h-10 w-auto mb-3"
              style={{ mixBlendMode: 'screen' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block' }}
            />
            <span className="font-display font-black text-xl leading-none tracking-tight block mb-3" style={{ display: 'none' }}>
              LIFT <span className="text-teal-light">FLINTSHIRE</span>
            </span>
            <p className="font-body text-sm text-white/70 leading-relaxed mb-4">
              Building stronger communities through inclusive strength, fitness, and wellbeing programmes across Flintshire, North Wales.
            </p>
            <p className="font-body text-xs text-white/60 leading-relaxed">
              Community Interest Company registered in England &amp; Wales.<br />
              Company No: 09379840<br />
              Registered office: M.01 Tomorrow Blue,<br />
              MediaCityUK, Salford, M50 2AB
            </p>
          </div>

          {/* Col 2: Nav */}
          <div>
            <h3 className="font-display font-bold text-base text-white mb-4 uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-1">
              {footerNav.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-[32px] items-center font-body text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Social + contact */}
          <div>
            <h3 className="font-display font-bold text-base text-white mb-4 uppercase tracking-wider">Connect</h3>
            <ul className="flex flex-col gap-1 mb-4">
              <li>
                <a
                  href={LIFT_FLINTSHIRE_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 font-body text-sm text-white/70 hover:text-teal-light transition-colors"
                >
                  <InstagramIcon />
                  @LiftFlintshire
                  <span className="sr-only">, Lift Flintshire on Instagram (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href={RUN_CLUB_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 font-body text-sm text-white/70 hover:text-teal-light transition-colors"
                >
                  <InstagramIcon />
                  @FlintshireRunClub
                  <span className="sr-only">, Flintshire Run Club on Instagram (opens in a new tab)</span>
                </a>
              </li>
            </ul>
            <a
              href="mailto:hello@liftflintshire.co.uk"
              className="inline-flex min-h-[32px] items-center font-body text-sm text-white/70 hover:text-white transition-colors"
            >
              hello@liftflintshire.co.uk
            </a>

            <div className="mt-6">
              <p className="font-body font-semibold text-sm text-white mb-3">Get our news by email</p>
              <NewsletterSignup tone="dark" label="Footer newsletter sign-up" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/60">
            © {new Date().getFullYear()} Lift Flintshire CIC. All rights reserved. Community Interest Company registered in Wales.
          </p>
          <div className="flex gap-5">
            <a href="/privacy" className="inline-flex min-h-[32px] items-center font-body text-xs text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/safeguarding" className="inline-flex min-h-[32px] items-center font-body text-xs text-white/60 hover:text-white transition-colors">
              Safeguarding
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
