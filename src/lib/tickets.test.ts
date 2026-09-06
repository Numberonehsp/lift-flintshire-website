import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { parseTicketTypesSheet, pickAvailableTier, tierStatuses } from './tickets'

const HEADER = ['event_id', 'tier_id', 'label', 'price_gbp', 'capacity', 'sort_order']
export const ROWS = [
  HEADER,
  ['run-2026', 'standard', 'Standard Entry', '101.73', '999', '2'],
  ['run-2026', 'early-bird', 'Early Bird Entry', '81.42', '10', '1'],
  ['other-event', 'single', 'Entry', '15', '50', '1'],
]

describe('parseTicketTypesSheet', () => {
  it('returns only the given event, sorted by sort_order, prices in pence', () => {
    expect(parseTicketTypesSheet(ROWS, 'run-2026')).toEqual([
      { eventId: 'run-2026', tierId: 'early-bird', label: 'Early Bird Entry', pricePence: 8142, capacity: 10, sortOrder: 1 },
      { eventId: 'run-2026', tierId: 'standard', label: 'Standard Entry', pricePence: 10173, capacity: 999, sortOrder: 2 },
    ])
  })

  it('returns an empty array for an unknown event or an empty sheet', () => {
    expect(parseTicketTypesSheet(ROWS, 'nope')).toEqual([])
    expect(parseTicketTypesSheet([], 'run-2026')).toEqual([])
  })

  it('skips rows missing a price or capacity', () => {
    expect(parseTicketTypesSheet([HEADER, ['run-2026', 'x', 'X', '', '10', '1']], 'run-2026')).toEqual([])
    expect(parseTicketTypesSheet([HEADER, ['run-2026', 'y', 'Y', '10', '', '1']], 'run-2026')).toEqual([])
  })
})

const tiers = parseTicketTypesSheet(ROWS, 'run-2026')

describe('pickAvailableTier — early-bird rollover', () => {
  it('offers early bird while it is under capacity', () => {
    expect(pickAvailableTier(tiers, {})?.tierId).toBe('early-bird')
    expect(pickAvailableTier(tiers, { 'early-bird': 9 })?.tierId).toBe('early-bird')
  })

  it('rolls over to standard once early bird is full', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 10 })?.tierId).toBe('standard')
  })

  it('returns null when every tier is full', () => {
    expect(pickAvailableTier(tiers, { 'early-bird': 10, standard: 999 })).toBeNull()
  })
})

describe('tierStatuses', () => {
  it('marks the current tier available and later tiers not_yet', () => {
    expect(tierStatuses(tiers, { 'early-bird': 3 }).map(s => s.status)).toEqual(['available', 'not_yet'])
  })

  it('marks a full earlier tier sold_out and promotes the next one', () => {
    expect(tierStatuses(tiers, { 'early-bird': 10 }).map(s => s.status)).toEqual(['sold_out', 'available'])
  })

  it('marks everything sold_out when nothing is left', () => {
    expect(tierStatuses(tiers, { 'early-bird': 10, standard: 999 }).map(s => s.status)).toEqual(['sold_out', 'sold_out'])
  })
})

// Guards the deliberate duplication forced by the api/ <- src/ import ban (commit e8572dc).
describe('api/_lib/tickets.ts mirror', () => {
  const body = (src: string) => src.slice(src.indexOf('export interface TicketTier'))

  it('is identical to src/lib/tickets.ts below the header comment', () => {
    const client = readFileSync('src/lib/tickets.ts', 'utf8')
    const server = readFileSync('api/_lib/tickets.ts', 'utf8')
    expect(body(server)).toBe(body(client))
  })
})
