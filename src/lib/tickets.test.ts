import { describe, it, expect } from 'vitest'
import { parseTicketTypesSheet } from './tickets'

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
