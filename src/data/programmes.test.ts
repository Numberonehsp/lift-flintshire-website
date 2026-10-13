import { describe, it, expect } from 'vitest'
import { programmes, programmesByGroup } from './programmes'

describe('programmesByGroup', () => {
  it('puts Couch to 5K and Women\'s Track Running in the run club group, with the club itself first', () => {
    expect(programmesByGroup('run-club').map(p => p.id)).toEqual([
      'run-club',
      'couch-to-5k',
      'womens-run-club',
    ])
  })

  it('puts the weightlifting club first, then Youth Weightlifting', () => {
    expect(programmesByGroup('weightlifting-club').map(p => p.id)).toEqual([
      'weightlifting',
      'youth-weightlifting',
    ])
  })

  it('puts Stay Strong and Girls Gym in wellbeing', () => {
    expect(programmesByGroup('wellbeing').map(p => p.id)).toEqual([
      'stay-strong',
      'girls-gym-session',
    ])
  })

  it('assigns every programme to exactly one group', () => {
    const total =
      programmesByGroup('run-club').length +
      programmesByGroup('weightlifting-club').length +
      programmesByGroup('wellbeing').length
    expect(total).toBe(programmes.length)
  })

  it('does not use the old youth id anywhere', () => {
    expect(programmes.some(p => (p.id as string) === 'youth-strength-conditioning')).toBe(false)
  })
})
