// api/_lib/eventLookup.ts — server only. Never imported from src/.
// Reads one event's programme from the PUBLIC content sheet's Events tab
// (columns: id | title | date | time | location | price | description | programme | bookingLink).

const ID_COLUMN = 0
const PROGRAMME_COLUMN = 7 // H

/** Column H, trimmed, for the row whose column A is `eventId`; undefined when blank or not found. */
export function programmeFromEventsSheet(values: string[][], eventId: string): string | undefined {
  if (!values || values.length < 2) return undefined
  const row = values.slice(1).find(r => r[ID_COLUMN] === eventId)
  const programme = row?.[PROGRAMME_COLUMN]?.trim()
  return programme || undefined
}

export async function fetchEventProgramme(eventId: string): Promise<string | undefined> {
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
  return programmeFromEventsSheet(json.values ?? [], eventId)
}
