import { useState, useEffect } from 'react'
import { mockRows } from '../data/mockData'
import type { SheetRow } from '../data/mockData'

export interface HeroStat {
  value: string
  label: string
}

// These defaults show when the Google Sheet Summary tab is not yet set up.
// Update them by adding a 'Summary' tab to your Google Sheet (value | label columns).
const defaultHeroStats: HeroStat[] = []

export interface MonthPoint {
  month: string
  total: number
  [programme: string]: number | string
}

export interface SheetData {
  totalParticipants: number
  totalSessions: number
  activeThisMonth: number
  byProgramme: { name: string; participants: number }[]
  byMonth: MonthPoint[]
  allProgrammes: string[]
  byGender: { name: string; value: number }[]
  byAge: { name: string; participants: number }[]
  lastUpdated: string
  heroStats: HeroStat[]
}

// Columns match the Google Form response sheet layout:
// A: Timestamp (auto)  B: Date  C: Programme  D: Session Type
// E: Total Participants  F: Under 18  G: 18–30  H: 30–60  I: Over 60
// J: Gender Male  K: Gender Female  L: Gender Other/Not stated
function parseSheetRows(values: string[][]): SheetRow[] {
  if (!values || values.length < 2) return []
  const [, ...rows] = values
  return rows
    .filter(row => row.length > 1)
    .map(row => ({
      date: row[1] || '',
      programme: row[2] || '',
      sessionType: row[3] || '',
      totalParticipants: parseInt(row[4]) || 0,
      ageUnder18: parseInt(row[5]) || 0,
      age18to30: parseInt(row[6]) || 0,
      age30to60: parseInt(row[7]) || 0,
      ageOver60: parseInt(row[8]) || 0,
      genderMale: parseInt(row[9]) || 0,
      genderFemale: parseInt(row[10]) || 0,
      genderOther: parseInt(row[11]) || 0,
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

  const MONTH_LABELS: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
  }

  // Normalise a date string to YYYY-MM regardless of input format.
  // Handles: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, D/M/YYYY, M/D/YYYY (with or without leading zeros).
  // Disambiguation: if the first segment is > 12 it must be the day → DD/MM; if the second is > 12
  // it must be the day → MM/DD; otherwise defaults to DD/MM (UK convention).
  function toYearMonth(raw: string): string {
    if (!raw) return ''
    if (/^\d{4}-\d{2}/.test(raw)) return raw.slice(0, 7)
    const parts = raw.split('/')
    if (parts.length === 3) {
      const [a, b, y] = parts
      const fullYear = y.length <= 2 ? `20${y.padStart(2, '0')}` : y
      const month = parseInt(a) > 12 ? b : a   // if a>12 it's a day → b is month (DD/MM); else a is month
      return `${fullYear}-${month.padStart(2, '0')}`
    }
    return raw.slice(0, 7)
  }

  const monthlyMap: Record<string, Record<string, number>> = {}
  rows.forEach(r => {
    const key = toYearMonth(r.date)
    if (!key) return
    if (!monthlyMap[key]) monthlyMap[key] = {}
    monthlyMap[key][r.programme] = (monthlyMap[key][r.programme] || 0) + r.totalParticipants
    monthlyMap[key]['_total'] = (monthlyMap[key]['_total'] || 0) + r.totalParticipants
  })
  const byMonth: MonthPoint[] = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, d]) => {
      const [year, month] = key.split('-')
      const { _total, ...programmes } = d
      return { month: `${MONTH_LABELS[month] ?? month} '${year.slice(2)}`, total: _total || 0, ...programmes }
    })

  const allProgrammes = Array.from(new Set(rows.map(r => r.programme))).sort()

  return {
    totalParticipants,
    totalSessions,
    activeThisMonth,
    byProgramme,
    byMonth,
    allProgrammes,
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

    // Reads from the "Form Responses 1" tab that Google Forms creates automatically.
    // If you rename that tab, update the name here to match.
    const sessionTab = encodeURIComponent('Form Responses 1')
    Promise.all([
      fetch(`${base}/${sessionTab}?key=${apiKey}`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
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
