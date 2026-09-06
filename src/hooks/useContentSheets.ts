import { useState, useEffect } from 'react'
import { events as staticEvents } from '../data/events'
import type { Event } from '../data/events'
import type { SessionDetail } from '../data/programmes'

interface ContentSheetsData {
  events: Event[]
  sessionsByProgramme: Record<string, SessionDetail[]>
  loading: boolean
}

function parseEventsSheet(values: string[][]): Event[] {
  if (!values || values.length < 2) return staticEvents
  const [, ...rows] = values
  const parsed = rows
    .filter(row => row[0] && row[1] && row[2])
    .map(row => ({
      id: row[0],
      title: row[1],
      date: row[2],
      time: row[3] || '',
      location: row[4] || '',
      price: parseFloat(row[5]) || 0,
      description: row[6] || '',
      programme: (row[7] as Event['programme']) || undefined,
      bookingLink: row[8] || undefined,
    }))
  return parsed.length > 0 ? parsed : staticEvents
}

function parseSessionsSheet(values: string[][]): Record<string, SessionDetail[]> {
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

    Promise.all([
      fetch(`${base}/Events?key=${API_KEY}`).then(r => r.json()),
      fetch(`${base}/Programme_Sessions?key=${API_KEY}`).then(r => r.json()),
    ])
      .then(([eventsJson, sessionsJson]) => {
        setEvents(parseEventsSheet(eventsJson.values))
        setSessionsByProgramme(parseSessionsSheet(sessionsJson.values))
      })
      .catch(() => { /* fall back to static data */ })
      .finally(() => setLoading(false))
  }, [])

  return { events, sessionsByProgramme, loading }
}
