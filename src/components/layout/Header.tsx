import { useState, useEffect } from 'react'
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 pointer-events-none">
        <div
          className={`max-w-6xl mx-auto pointer-events-auto flex items-center justify-between h-14 px-5 rounded-full transition-all duration-300 ${
            scrolled
              ? 'bg-ink/95 backdrop-blur-md shadow-lg shadow-black/25'
              : 'bg-ink'
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center min-h-[44px]"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/logo-white.png"
              alt="Lift Flintshire CIC"
              className="h-8 w-auto max-w-[160px]"
              style={{ mixBlendMode: 'screen' }}
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                ;(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'
              }}
            />
            <span
              className="font-display font-black text-white text-lg leading-none tracking-tight"
              style={{ display: 'none' }}
            >
              LIFT <span className="text-teal">FLINTSHIRE</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `font-body font-medium text-sm transition-colors duration-150 ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Hamburger — morphs into × */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="md:hidden text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <div className="relative w-5 h-[14px]">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-white transition-all duration-300 ease-in-out ${
                  isOpen ? 'top-[7px] rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] block h-0.5 w-5 bg-white transition-all duration-200 ease-in-out ${
                  isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-white transition-all duration-300 ease-in-out ${
                  isOpen ? 'top-[7px] -rotate-45' : 'top-[14px]'
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Full-screen mobile overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(17,17,17,0.97)', backdropFilter: 'blur(12px)' }}
        onClick={() => setIsOpen(false)}
      >
        <nav
          className="flex flex-col items-center justify-center h-full gap-1"
          aria-label="Mobile navigation"
          onClick={e => e.stopPropagation()}
        >
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsOpen(false)}
              style={{
                transitionDelay: isOpen ? `${i * 55 + 40}ms` : '0ms',
                fontSize: 'clamp(26px, 7vw, 40px)',
              }}
              className={({ isActive }) =>
                `font-display font-black uppercase py-3 transition-all duration-300 ease-out ${
                  isActive ? 'text-teal' : 'text-white hover:text-teal'
                } ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
