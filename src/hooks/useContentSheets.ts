import { useState, useEffect } from 'react'
import { events as staticEvents } from '../data/events'
import type { Event } from '../data/events'
import type { SessionDetail } from '../data/programmes'
import { readSheetValues, parseEventsSheet, parseSessionsSheet } from '../lib/contentSheets'

interface ContentSheetsData {
  events: Event[]
  sessionsByProgramme: Record<string, SessionDetail[]>
  loading: boolean
}

// Credentials are inlined by Vite at build time, so whether there's a sheet to
// fetch from is known before the first render — without one we stay on static data.
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const HAS_SHEET_CONFIG = Boolean(SHEET_ID && API_KEY)

// This hook only ever reads Events and Programme_Sessions from the PUBLIC content
// sheet. Personal data (Registrations, Feedback, and event entries) lives in a
// separate private spreadsheet that only the server-side service account can reach —
// never fetch a tab containing personal data from here, since VITE_ env vars and
// anything fetched with them are visible in the shipped JS bundle to any visitor.
export function useContentSheets(): ContentSheetsData {
  const [events, setEvents] = useState<Event[]>(staticEvents)
  const [sessionsByProgramme, setSessionsByProgramme] = useState<Record<string, SessionDetail[]>>({})
  const [loading, setLoading] = useState(HAS_SHEET_CONFIG)

  useEffect(() => {
    if (!HAS_SHEET_CONFIG) return

    const base = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`

    // Each tab is read independently: a missing or failing tab (for example an
    // HTTP 400 when it does not exist) leaves only that part on static data.
    const eventsDone = readSheetValues(fetch(`${base}/Events?key=${API_KEY}`))
      .then(values => setEvents(parseEventsSheet(values, staticEvents)))
    const sessionsDone = readSheetValues(fetch(`${base}/Programme_Sessions?key=${API_KEY}`))
      .then(values => setSessionsByProgramme(parseSessionsSheet(values)))

    Promise.allSettled([eventsDone, sessionsDone]).then(() => setLoading(false))
  }, [])

  return { events, sessionsByProgramme, loading }
}
