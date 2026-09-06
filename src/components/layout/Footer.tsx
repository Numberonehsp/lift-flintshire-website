import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Programmes & Events', to: '/programmes-events' },
  { label: 'Impact Dashboard', to: '/impact' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}


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
              {navLinks.map(link => (
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
            <div className="flex gap-4 mb-4">
              <a
                href="https://instagram.com/LiftFlintshire"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-teal-light transition-colors min-h-[44px] flex items-center"
                aria-label="Lift Flintshire on Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
            <a
              href="mailto:hello@liftflintshire.co.uk"
              className="inline-flex min-h-[32px] items-center font-body text-sm text-white/70 hover:text-white transition-colors"
            >
              hello@liftflintshire.co.uk
            </a>
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
