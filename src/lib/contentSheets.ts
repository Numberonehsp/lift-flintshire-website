import type { Event } from '../data/events'
import type { SessionDetail } from '../data/programmes'
import { normaliseEventDate } from './eventDate'

type SheetValues = string[][]

/**
 * Reads the `values` from a Sheets API response. Returns null when the request
 * failed, the status is not OK (for example HTTP 400 for a missing tab), or the
 * body is not a values payload, so the caller can fall back to static data.
 * Never logs: the request URL carries the API key.
 */
export async function readSheetValues(response: Response | Promise<Response>): Promise<SheetValues | null> {
  try {
    const res = await response
    if (!res.ok) return null
    const body: unknown = await res.json()
    if (!body || typeof body !== 'object' || 'error' in body) return null
    const values = (body as { values?: unknown }).values
    if (values === undefined) return []
    return Array.isArray(values) ? (values as SheetValues) : null
  } catch {
    return null
  }
}

export function parseEventsSheet(values: SheetValues | null, fallback: Event[]): Event[] {
  if (!values || values.length < 2) return fallback
  const [, ...rows] = values
  const parsed = rows
    .filter(row => row[0] && row[1] && row[2])
    .flatMap(row => {
      const date = normaliseEventDate(row[2])
      if (!date) {
        // An unreadable date would hide the event with no explanation, so say why in the console.
        console.warn(`Events sheet: skipped "${row[0]}" because "${row[2]}" is not a valid date (use YYYY-MM-DD).`)
        return []
      }
      return [{ row, date }]
    })
    .map(({ row, date }) => ({
      id: row[0],
      title: row[1],
      date,
      time: row[3] || '',
      location: row[4] || '',
      price: parseFloat(row[5]) || 0,
      description: row[6] || '',
      programme: (row[7] as Event['programme']) || undefined,
      bookingLink: row[8] || undefined,
    }))
  return parsed.length > 0 ? parsed : fallback
}

export function parseSessionsSheet(values: SheetValues | null): Record<string, SessionDetail[]> {
  if (!values || values.length < 2) return {}
  const [, ...rows] = values
  const map: Record<string, SessionDetail[]> = {}
  rows
    .filter(row => row[0] && row[1])
    .forEach(row => {
      const id = row[0]
      if (!map[id]) map[id] = []
      map[id].push({ day: row[1], time: row[2] || '', location: row[3] || '', cost: row[4] || '' })
    })
  return map
}
