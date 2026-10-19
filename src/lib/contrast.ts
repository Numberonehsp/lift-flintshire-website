// WCAG 2.x contrast helpers, used to pick a readable label colour for
// text drawn on top of a coloured chart segment.

export const AA_NORMAL = 4.5

const WHITE = '#FFFFFF'
const INK = '#111111'
// Fallback when neither white nor ink reaches AA (e.g. mid-tone purple,
// where ink is ~4.3:1 but pure black is ~4.8:1).
const BLACK = '#000000'

function channels(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`Not a hex colour: ${hex}`)
  let h = m[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map(v => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// White or ink, whichever contrasts more with the background; pure black
// if that is the only option that reaches WCAG AA for normal-size text.
export function labelColourOn(background: string): string {
  const best = contrastRatio(WHITE, background) >= contrastRatio(INK, background) ? WHITE : INK
  if (contrastRatio(best, background) >= AA_NORMAL) return best
  return contrastRatio(BLACK, background) > contrastRatio(best, background) ? BLACK : best
}
