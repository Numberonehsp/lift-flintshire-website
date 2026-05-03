import type { ReactNode } from 'react'

type Variant = 'light' | 'muted' | 'dark' | 'teal'

interface SectionWrapperProps {
  children: ReactNode
  variant?: Variant
  className?: string
  innerClassName?: string
  id?: string
}

const variantClasses: Record<Variant, string> = {
  light: 'bg-bg',
  muted: 'bg-surface-muted',
  dark: 'bg-ink text-white',
  teal: 'bg-teal text-white',
}

export function SectionWrapper({
  children,
  variant = 'light',
  className = '',
  innerClassName = '',
  id,
}: SectionWrapperProps) {
  return (
    <section id={id} className={`${variantClasses[variant]} ${className}`}>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${innerClassName}`}>
        {children}
      </div>
    </section>
  )
}
