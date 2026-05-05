import { useState, useEffect } from 'react'
import { events as staticEvents } from '../data/events'
import type { Event } from '../data/events'
import type { SessionDetail } from '../data/programmes'

export interface RegistrationSummary {
  programme: string
  label: string
  total: number
}

interface ContentSheetsData {
  events: Event[]
  sessionsByProgramme: Record<string, SessionDetail[]>
  registrations: RegistrationSummary[]
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

function parseRegistrationsSheet(values: string[][]): RegistrationSummary[] {
  if (!values || values.length < 2) return []
  const [, ...rows] = values
  const counts: Record<string, { label: string; total: number }> = {}
  rows
    .filter(row => row[0])
    .forEach(row => {
      const id = row[0]
      const label = row[1] || id
      const count = parseInt(row[2]) || 1
      if (!counts[id]) counts[id] = { label, total: 0 }
      counts[id].total += count
    })
  return Object.entries(counts).map(([programme, { label, total }]) => ({ programme, label, total }))
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
  const [registrations, setRegistrations] = useState<RegistrationSummary[]>([])
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
      fetch(`${base}/Registrations?key=${apiKey}`).then(r => r.json()).catch(() => ({ values: [] })),
    ])
      .then(([eventsJson, sessionsJson, registrationsJson]) => {
        setEvents(parseEventsSheet(eventsJson.values))
        setSessionsByProgramme(parseSessionsSheet(sessionsJson.values))
        setRegistrations(parseRegistrationsSheet(registrationsJson.values))
      })
      .catch(() => { /* fall back to static data */ })
      .finally(() => setLoading(false))
  }, [])

  return { events, sessionsByProgramme, registrations, loading }
}
