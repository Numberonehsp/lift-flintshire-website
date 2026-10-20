import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Event } from '../data/events'
import { readSheetValues, parseEventsSheet, parseSessionsSheet } from './contentSheets'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const fallbackEvents: Event[] = [
  { id: 'static', title: 'Static', date: '2026-01-01', time: '', location: '', price: 0, description: '' },
]

afterEach(() => vi.restoreAllMocks())

describe('readSheetValues', () => {
  it('returns the values of a successful response', async () => {
    const values = [['id', 'day'], ['run-club', 'Tuesday']]
    expect(await readSheetValues(jsonResponse({ values }))).toEqual(values)
  })

  it('returns null for an HTTP 400 (missing tab) without logging an error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = jsonResponse({ error: { code: 400, message: 'Unable to parse range: Programme_Sessions' } }, 400)
    expect(await readSheetValues(res)).toBeNull()
    expect(error).not.toHaveBeenCalled()
  })

  it('returns null when an OK response carries an error body', async () => {
    expect(await readSheetValues(jsonResponse({ error: { code: 403 } }))).toBeNull()
  })

  it('returns null when the body is not JSON', async () => {
    expect(await readSheetValues(new Response('not json', { status: 200 }))).toBeNull()
  })

  it('returns null when the request itself failed', async () => {
    expect(await readSheetValues(Promise.reject(new Error('offline')))).toBeNull()
  })

  it('returns an empty list for an empty tab', async () => {
    expect(await readSheetValues(jsonResponse({ range: 'Events!A1:Z1000' }))).toEqual([])
  })
})

describe('parseSessionsSheet', () => {
  it('groups rows by programme id and skips the header', () => {
    const values = [
      ['programme id', 'day', 'time', 'location', 'cost'],
      ['run-club', 'Tuesday', '18:00', 'Hawarden - Tinkersdale Car Park', 'Free to try, then £30 annually'],
      ['run-club', 'Weekends', 'See the WhatsApp group', 'Varies, announced in the group', 'Included in membership'],
      ['stay-strong', 'Wednesday', '11:00–11:45am', 'Number One HSP, CH5 2TF', '4 weeks Free, then £16 per month'],
    ]
    const map = parseSessionsSheet(values)
    expect(map['run-club'].map(s => s.day)).toEqual(['Tuesday', 'Weekends'])
    expect(map['stay-strong'][0].cost).toBe('4 weeks Free, then £16 per month')
  })

  it('returns no overrides when the tab is missing or has only a header', () => {
    expect(parseSessionsSheet(null)).toEqual({})
    expect(parseSessionsSheet([['programme id', 'day']])).toEqual({})
  })
})

describe('parseEventsSheet', () => {
  it('falls back to the static events when the tab is missing', () => {
    expect(parseEventsSheet(null, fallbackEvents)).toBe(fallbackEvents)
  })

  it('falls back to the static events when the tab has only a header', () => {
    expect(parseEventsSheet([['id', 'title', 'date']], fallbackEvents)).toBe(fallbackEvents)
  })

  it('parses event rows', () => {
    const values = [
      ['id', 'title', 'date', 'time', 'location', 'price', 'description', 'programme', 'bookingLink'],
      ['Nov_WTR', 'Track run', '2026-11-21', '10:00', 'Deeside', '0', 'Run', 'womens-run-club', ''],
    ]
    const [event] = parseEventsSheet(values, fallbackEvents)
    expect(event).toMatchObject({ id: 'Nov_WTR', date: '2026-11-21', price: 0, programme: 'womens-run-club' })
    expect(event.bookingLink).toBeUndefined()
  })
})
