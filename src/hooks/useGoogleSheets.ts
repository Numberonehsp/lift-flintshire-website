import { useState, useEffect } from 'react'
import { mockRows } from '../data/mockData'
import type { SheetRow } from '../data/mockData'

export interface HeroStat {
  value: string
  label: string
}

const defaultHeroStats: HeroStat[] = [
  { value: '1,200+', label: 'Participants supported' },
  { value: '340+', label: 'Sessions delivered' },
  { value: '3', label: 'Active programmes' },
  { value: '60+', label: 'Age groups served' },
]

export interface SheetData {
  totalParticipants: number
  totalSessions: number
  activeThisMonth: number
  byProgramme: { name: string; participants: number }[]
  byGender: { name: string; value: number }[]
  byAge: { name: string; participants: number }[]
  lastUpdated: string
  heroStats: HeroStat[]
}

function parseSheetRows(values: string[][]): SheetRow[] {
  if (!values || values.length < 2) return []
  const [, ...rows] = values
  return rows.map(row => ({
    date: row[0] || '',
    programme: row[1] || '',
    sessionType: row[2] || '',
    totalParticipants: parseInt(row[3]) || 0,
    ageUnder18: parseInt(row[4]) || 0,
    age18to30: parseInt(row[5]) || 0,
    age30to60: parseInt(row[6]) || 0,
    ageOver60: parseInt(row[7]) || 0,
    genderMale: parseInt(row[8]) || 0,
    genderFemale: parseInt(row[9]) || 0,
    genderOther: parseInt(row[10]) || 0,
  }))
}

export function aggregateData(rows: SheetRow[]): SheetData {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalParticipants = rows.reduce((sum, r) => sum + r.totalParticipants, 0)
  const totalSessions = rows.length
  const activeThisMonth = rows
    .filter(r => r.date.startsWith(thisMonth))
    .reduce((sum, r) => sum + r.totalParticipants, 0)

  const programmeMap: Record<string, number> = {}
  rows.forEach(r => {
    programmeMap[r.programme] = (programmeMap[r.programme] || 0) + r.totalParticipants
  })
  const byProgramme = Object.entries(programmeMap).map(([name, participants]) => ({ name, participants }))

  const genderTotals = rows.reduce(
    (acc, r) => ({ male: acc.male + r.genderMale, female: acc.female + r.genderFemale, other: acc.other + r.genderOther }),
    { male: 0, female: 0, other: 0 }
  )
  const byGender = [
    { name: 'Male', value: genderTotals.male },
    { name: 'Female', value: genderTotals.female },
    { name: 'Other / Not stated', value: genderTotals.other },
  ]

  const ageTotals = rows.reduce(
    (acc, r) => ({
      under18: acc.under18 + r.ageUnder18,
      age18to30: acc.age18to30 + r.age18to30,
      mid: acc.mid + r.age30to60,
      over60: acc.over60 + r.ageOver60,
    }),
    { under18: 0, age18to30: 0, mid: 0, over60: 0 }
  )
  const byAge = [
    { name: 'Under 18', participants: ageTotals.under18 },
    { name: '18–30', participants: ageTotals.age18to30 },
    { name: '30–60', participants: ageTotals.mid },
    { name: 'Over 60', participants: ageTotals.over60 },
  ]

  return {
    totalParticipants,
    totalSessions,
    activeThisMonth,
    byProgramme,
    byGender,
    byAge,
    lastUpdated: now.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
    heroStats: defaultHeroStats,
  }
}

function parseSummarySheet(values: string[][]): HeroStat[] {
  if (!values || values.length < 2) return defaultHeroStats
  const [, ...rows] = values
  const parsed = rows
    .filter(row => row[0] && row[1])
    .map(row => ({ value: row[0], label: row[1] }))
  return parsed.length > 0 ? parsed : defaultHeroStats
}

export function useGoogleSheets() {
  const [data, setData] = useState<SheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

    if (!sheetId || !apiKey) {
      setData(aggregateData(mockRows))
      setLoading(false)
      return
    }

    const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`

    Promise.all([
      fetch(`${base}/Sheet1?key=${apiKey}`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch(`${base}/Summary?key=${apiKey}`).then(r => r.json()).catch(() => ({ values: [] })),
    ])
      .then(([impactJson, summaryJson]: [{ values: string[][] }, { values: string[][] }]) => {
        const rows = parseSheetRows(impactJson.values)
        const aggregated = aggregateData(rows)
        aggregated.heroStats = parseSummarySheet(summaryJson.values)
        setData(aggregated)
        setLoading(false)
      })
      .catch(() => {
        setError('Impact data is temporarily unavailable. Please check back soon.')
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
