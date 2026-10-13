import { describe, it, expect } from 'vitest'
import { programmeFromEventsSheet, eventFromEventsSheet } from './eventLookup.js'

const HEADER = ['id', 'title', 'date', 'time', 'location', 'price', 'description', 'programme', 'bookingLink']
const ROWS = [
  HEADER,
  ['Nov_WTR', 'Track Run', '2026-11-21', '10:00', 'Deeside', '0', 'Free run', ' womens-run-club ', ''],
  ['No_Prog', 'Other', '2026-12-01', '', '', '5', 'x', '', ''],
  ['Short', 'Short row', '2026-12-02'],
]

describe('programmeFromEventsSheet', () => {
  it('returns column H trimmed for the matching event id', () => {
    expect(programmeFromEventsSheet(ROWS, 'Nov_WTR')).toBe('womens-run-club')
  })

  it('returns undefined when the programme cell is blank or missing', () => {
    expect(programmeFromEventsSheet(ROWS, 'No_Prog')).toBeUndefined()
    expect(programmeFromEventsSheet(ROWS, 'Short')).toBeUndefined()
  })

  it('returns undefined for an unknown event or an empty sheet', () => {
    expect(programmeFromEventsSheet(ROWS, 'nope')).toBeUndefined()
    expect(programmeFromEventsSheet([], 'Nov_WTR')).toBeUndefined()
  })

  it('never matches the header row', () => {
    expect(programmeFromEventsSheet(ROWS, 'id')).toBeUndefined()
  })
})

describe('eventFromEventsSheet', () => {
  it('returns the trimmed title and programme for the matching event', () => {
    expect(eventFromEventsSheet(ROWS, 'Nov_WTR')).toEqual({ title: 'Track Run', programme: 'womens-run-club' })
  })

  it('leaves programme undefined when blank', () => {
    expect(eventFromEventsSheet(ROWS, 'No_Prog')).toEqual({ title: 'Other', programme: undefined })
  })

  it('returns undefined for an unknown event, the header row, or a blank title', () => {
    expect(eventFromEventsSheet(ROWS, 'nope')).toBeUndefined()
    expect(eventFromEventsSheet(ROWS, 'id')).toBeUndefined()
    expect(eventFromEventsSheet([HEADER, ['Blank', '  ', '2026-12-01']], 'Blank')).toBeUndefined()
    expect(eventFromEventsSheet([], 'Nov_WTR')).toBeUndefined()
  })
})
