interface StatCardProps {
  value: string
  label: string
  className?: string
}

// Rendered only on the dark hero strip: colours are tuned for a near-black
// photographic background (both clear WCAG AA there).
export function StatCard({ value, label, className = '' }: StatCardProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className="font-display font-extrabold text-h2 text-teal-light leading-none">{value}</span>
      <span className="font-body text-sm text-white/75 mt-1">{label}</span>
    </div>
  )
}
