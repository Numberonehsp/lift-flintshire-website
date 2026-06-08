interface WaveDividerProps {
  fromColor: string
  toColor: string
}

export function WaveDivider({ fromColor, toColor }: WaveDividerProps) {
  return (
    <div className="relative -mt-px overflow-hidden" style={{ backgroundColor: fromColor }}>
      <svg
        viewBox="0 0 1440 52"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height: 'clamp(28px, 3.6vw, 52px)', display: 'block' }}
        aria-hidden="true"
      >
        <path
          d="M0,26 C240,52 480,0 720,26 C960,52 1200,0 1440,26 L1440,52 L0,52 Z"
          fill={toColor}
        />
      </svg>
    </div>
  )
}
