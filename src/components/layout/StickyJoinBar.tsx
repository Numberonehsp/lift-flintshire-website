import { useEffect } from 'react'

interface StickyJoinBarProps {
  label: string
  href: string
}

// Phone-only bar fixed to the bottom of the screen so the main action stays in thumb reach.
export function StickyJoinBar({ label, href }: StickyJoinBarProps) {
  // The footer renders after the page, so pad it (via a body class, see global.css)
  // to stop the fixed bar covering its last line.
  useEffect(() => {
    document.body.classList.add('has-join-bar')
    return () => document.body.classList.remove('has-join-bar')
  }, [])

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-ink/95 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href={href}
          className="flex w-full items-center justify-center rounded-btn bg-teal px-5 py-3 font-body font-semibold text-[15px] text-white min-h-[44px] hover:bg-teal-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {label}
        </a>
      </div>
    </>
  )
}
