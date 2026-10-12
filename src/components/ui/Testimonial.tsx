interface TestimonialProps {
  quote: string
  attribution: string
  /** True until Ed supplies a real, permitted quote. Placeholders render a clear "Example" label. */
  placeholder?: boolean
}

export function Testimonial({ quote, attribution, placeholder = false }: TestimonialProps) {
  return (
    <figure className="max-w-3xl mx-auto text-center">
      {placeholder && (
        <p className="inline-block mb-4 rounded-full bg-white/10 px-3 py-1 font-body text-[11px] uppercase tracking-[0.08em] text-white/80">
          Example, replace with a real quote
        </p>
      )}
      <blockquote className="font-display font-bold text-h3 text-white leading-snug">
        “{quote}”
      </blockquote>
      <figcaption className="font-body text-sm text-white/70 mt-4">{attribution}</figcaption>
    </figure>
  )
}
