type AspectRatio = 'video' | 'square' | '4/3'

interface ImagePlaceholderProps {
  aspectRatio?: AspectRatio
  label?: string
  className?: string
}

const aspectClasses: Record<AspectRatio, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
}

export function ImagePlaceholder({ aspectRatio = 'video', label = 'Photography coming soon', className = '' }: ImagePlaceholderProps) {
  return (
    <div className={`${aspectClasses[aspectRatio]} bg-surface-muted border-2 border-dashed border-border rounded-card flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-xs font-body text-ink-light text-center px-4">{label}</span>
    </div>
  )
}
