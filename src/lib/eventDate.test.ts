import { describe, it, expect } from 'vitest'
import { normaliseEventDate } from './eventDate'

describe('normaliseEventDate', () => {
  it('keeps a valid YYYY-MM-DD date', () => {
    expect(normaliseEventDate('2026-11-21')).toBe('2026-11-21')
  })

  it('swaps YYYY-DD-MM when the middle part cannot be a month', () => {
    expect(normaliseEventDate('2026-21-11')).toBe('2026-11-21')
  })

  it('accepts DD/MM/YYYY', () => {
    expect(normaliseEventDate('21/11/2026')).toBe('2026-11-21')
    expect(normaliseEventDate('3/4/2026')).toBe('2026-04-03')
  })

  it('trims whitespace', () => {
    expect(normaliseEventDate(' 2026-11-21 ')).toBe('2026-11-21')
  })

  it('returns null for impossible or unrecognised dates', () => {
    expect(normaliseEventDate('2026-02-30')).toBeNull()
    expect(normaliseEventDate('2026-13-13')).toBeNull()
    expect(normaliseEventDate('next Saturday')).toBeNull()
    expect(normaliseEventDate('')).toBeNull()
  })
})
