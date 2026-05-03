import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-block bg-teal-pale text-teal font-body font-semibold text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  )
}
