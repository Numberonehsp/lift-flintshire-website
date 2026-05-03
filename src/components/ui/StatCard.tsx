interface StatCardProps {
  value: string
  label: string
  className?: string
}

export function StatCard({ value, label, className = '' }: StatCardProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className="font-display font-extrabold text-h2 text-teal leading-none">{value}</span>
      <span className="font-body text-sm text-ink-light mt-1">{label}</span>
    </div>
  )
}
