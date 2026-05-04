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
      stripeLink: row[8] || undefined,
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

export function useContentSheets(): ContentSheetsData {
  const [events, setEvents] = useState<Event[]>(staticEvents)
  const [sessionsByProgramme, setSessionsByProgramme] = useState<Record<string, SessionDetail[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

    if (!sheetId || !apiKey) {
      setLoading(false)
      return
    }

    const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`

    Promise.all([
      fetch(`${base}/Events?key=${apiKey}`).then(r => r.json()),
      fetch(`${base}/Programme_Sessions?key=${apiKey}`).then(r => r.json()),
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
