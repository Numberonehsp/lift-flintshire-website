import { describe, it, expect } from 'vitest'
import { buildHeroStats, roundedCount } from './heroStats'
import { aggregateData } from '../hooks/useGoogleSheets'
import type { SheetRow } from '../data/mockData'

function row(date: string, programme: string, total: number): SheetRow {
  return {
    date, programme, sessionType: programme, totalParticipants: total, newParticipants: 0,
    ageUnder18: 0, age18to30: 0, age30to60: 0, ageOver60: 0,
    genderMale: 0, genderFemale: 0, genderOther: 0,
  }
}

describe('roundedCount', () => {
  it('shows small numbers exactly', () => {
    expect(roundedCount(0)).toBe('0')
    expect(roundedCount(7)).toBe('7')
  })
  it('rounds down to the nearest ten with a plus', () => {
    expect(roundedCount(10)).toBe('10+')
    expect(roundedCount(681)).toBe('680+')
  })
})

describe('buildHeroStats', () => {
  const data = aggregateData([
    row('2026-04-07', 'Stay Strong', 30),
    row('2026-04-09', 'Flintshire Run Club', 25),
    row('2026-05-02', 'Flintshire Run Club', 40),
  ])

  it('returns attendances, sessions and programmes from the feed', () => {
    const stats = buildHeroStats(data)
    expect(stats.map(s => s.label)).toEqual([
      'Attendances recorded',
      'Sessions delivered',
      'Programmes delivered',
    ])
    expect(stats.map(s => s.value)).toEqual(['90+', '3', '2'])
  })

  it('labels the period from the first month of data', () => {
    expect(buildHeroStats(data)[0].period).toBe("Since Apr '26")
  })

  it('returns no stats when there is no data', () => {
    expect(buildHeroStats(aggregateData([]))).toEqual([])
  })
})
