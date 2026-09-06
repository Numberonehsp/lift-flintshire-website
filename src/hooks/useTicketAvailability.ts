import { useState, useEffect } from 'react'
import { parseTicketTypesSheet, tierStatuses } from '../lib/tickets'
import type { TicketTier, TakenCounts, TierAvailability } from '../lib/tickets'

export interface TierStatus {
  tier: TicketTier
  status: TierAvailability
}

// `loading` only ever flips true -> false (matching useContentSheets.ts's convention,
// which avoids the react-hooks/set-state-in-effect lint rule by never calling setState
// synchronously in an effect). Known trade-off: if `eventId` changes to a *different*
// event on an already-mounted EventDetail page without a remount, `loading` stays false
// and the previous event's tier statuses are shown briefly until the new fetch resolves —
// acceptable here since a route param change from one event to another is rare and brief.
export function useTicketAvailability(eventId: string | undefined) {
  const [statuses, setStatuses] = useState<TierStatus[]>([])
  const [loading, setLoading] = useState(Boolean(eventId))

  useEffect(() => {
    if (!eventId) return
    let cancelled = false

    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

    Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Ticket_Types?key=${apiKey}`)
        .then(r => r.json())
        .catch(() => ({ values: [] as string[][] })),
      fetch(`/api/event-availability?eventId=${encodeURIComponent(eventId)}`)
        .then(r => r.json())
        .catch(() => ({ taken: {} as TakenCounts })),
    ])
      .then(([typesJson, availJson]) => {
        if (cancelled) return
        const tiers = parseTicketTypesSheet(typesJson.values ?? [], eventId)
        setStatuses(tierStatuses(tiers, (availJson.taken ?? {}) as TakenCounts))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [eventId])

  return { statuses, loading }
}
