import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Programmes & Events', to: '/programmes-events' },
  { label: 'Impact', to: '/impact' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-body font-medium text-sm transition-colors min-h-[44px] flex items-center ${
      isActive ? 'text-white' : 'text-white/70 hover:text-white'
    }`

  return (
    <header className="bg-ink sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 min-h-[44px] flex items-center">
            <span className="font-display font-black text-white text-xl leading-none tracking-tight">
              LIFT <span className="text-teal">FLINTSHIRE</span>
              <span className="block text-[10px] font-body font-semibold text-white/50 tracking-[0.1em] uppercase mt-0.5">
                Community Interest Company
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="md:hidden text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div
        className={`md:hidden bg-ink border-t border-white/10 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <nav className="flex flex-col px-4 py-2 pb-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `font-body font-medium text-base py-3 border-b border-white/10 last:border-0 min-h-[44px] flex items-center ${
                  isActive ? 'text-teal' : 'text-white/80'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
