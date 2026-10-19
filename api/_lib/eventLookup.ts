// api/_lib/eventLookup.ts — server only. Never imported from src/.
// Reads one event's title and programme from the PUBLIC content sheet's Events tab
// (columns: id | title | date | time | location | price | description | programme | bookingLink).

const ID_COLUMN = 0
const TITLE_COLUMN = 1 // B
const PROGRAMME_COLUMN = 7 // H

export interface EventDetails {
  title: string
  programme: string | undefined
}

/** Title (B) and programme (H), trimmed, for the row whose column A is `eventId`.
 *  Undefined when the event is not found or its title is blank. */
export function eventFromEventsSheet(values: string[][], eventId: string): EventDetails | undefined {
  if (!values || values.length < 2) return undefined
  const row = values.slice(1).find(r => r[ID_COLUMN] === eventId)
  const title = row?.[TITLE_COLUMN]?.trim()
  if (!row || !title) return undefined
  return { title, programme: row[PROGRAMME_COLUMN]?.trim() || undefined }
}

/** Column H, trimmed, for the row whose column A is `eventId`; undefined when blank or not found. */
export function programmeFromEventsSheet(values: string[][], eventId: string): string | undefined {
  if (!values || values.length < 2) return undefined
  const row = values.slice(1).find(r => r[ID_COLUMN] === eventId)
  const programme = row?.[PROGRAMME_COLUMN]?.trim()
  return programme || undefined
}

async function fetchEventsSheet(): Promise<string[][]> {
  const sheetId = process.env.GOOGLE_SHEET_ID_PUBLIC
  const apiKey = process.env.GOOGLE_API_KEY
  if (!sheetId || !apiKey) {
    throw new Error(
      `Events config missing: GOOGLE_SHEET_ID_PUBLIC=${sheetId ? 'set' : 'MISSING'} GOOGLE_API_KEY=${apiKey ? 'set' : 'MISSING'}`,
    )
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Events?key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    // Status only: never the URL, which carries the API key.
    throw new Error(`Events fetch failed: HTTP ${response.status}`)
  }
  const json = (await response.json()) as { values?: string[][] }
  return json.values ?? []
}

/** The event's title and programme from the Events sheet; undefined when not listed. Throws on fetch failure. */
export async function fetchEvent(eventId: string): Promise<EventDetails | undefined> {
  return eventFromEventsSheet(await fetchEventsSheet(), eventId)
}

export async function fetchEventProgramme(eventId: string): Promise<string | undefined> {
  return programmeFromEventsSheet(await fetchEventsSheet(), eventId)
}
