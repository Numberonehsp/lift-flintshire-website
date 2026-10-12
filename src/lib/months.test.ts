import { describe, it, expect } from 'vitest'
import { isInProgressMonth } from './months'

describe('isInProgressMonth', () => {
  it('is true for the current calendar month', () => {
    expect(isInProgressMonth('2026-10', new Date('2026-10-12T10:00:00'))).toBe(true)
  })
  it('is false for earlier months', () => {
    expect(isInProgressMonth('2026-09', new Date('2026-10-12T10:00:00'))).toBe(false)
  })
  it('is false when the key is missing', () => {
    expect(isInProgressMonth(undefined, new Date('2026-10-12T10:00:00'))).toBe(false)
  })
})
