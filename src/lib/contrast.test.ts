import { describe, it, expect } from 'vitest'
import { relativeLuminance, contrastRatio, labelColourOn, AA_NORMAL } from './contrast'

const CHART_COLOURS = ['#376A6B', '#E8713C', '#B8860B', '#8A6BB0', '#4A6FA5', '#B5556D', '#999']

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBe(1)
  })
  it('accepts 3-digit hex', () => {
    expect(relativeLuminance('#fff')).toBe(1)
  })
  it('throws on a malformed colour', () => {
    expect(() => relativeLuminance('teal')).toThrow()
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white, either order', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5)
  })
  it('matches the published ratio for the brand teal on white (about 6.1)', () => {
    expect(contrastRatio('#376A6B', '#FFFFFF')).toBeCloseTo(6.1, 1)
  })
})

describe('labelColourOn', () => {
  it('picks white on the dark brand teal', () => {
    expect(labelColourOn('#376A6B')).toBe('#FFFFFF')
  })
  it('picks ink on the brand orange', () => {
    expect(labelColourOn('#E8713C')).toBe('#111111')
  })
  it('meets WCAG AA (4.5:1) on every chart colour', () => {
    for (const c of CHART_COLOURS) {
      expect(contrastRatio(labelColourOn(c), c)).toBeGreaterThanOrEqual(AA_NORMAL)
    }
  })
})
