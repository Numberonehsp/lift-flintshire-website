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
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-light"
        aria-hidden="true"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
      <span className="text-xs font-body text-ink-light text-center px-4">{label}</span>
    </div>
  )
}
