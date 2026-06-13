import { useState, useEffect } from 'react'
import { mockRows } from '../data/mockData'
import type { SheetRow } from '../data/mockData'

export interface HeroStat {
  value: string
  label: string
}

const defaultHeroStats: HeroStat[] = []

export interface MonthPoint {
  month: string
  total: number
  [key: string]: number | string
}

export interface SheetData {
  totalParticipants: number
  totalNew: number
  totalSessions: number
  activeThisMonth: number
  byProgramme: { name: string; participants: number }[]
  byMonth: MonthPoint[]
  byAreaMonth: MonthPoint[]
  allProgrammes: string[]
  byGender: { name: string; value: number }[]
  byAge: { name: string; participants: number }[]
  lastUpdated: string
  heroStats: HeroStat[]
}

// Maps each programme to one of the three main impact areas
const IMPACT_AREA_MAP: Record<string, string> = {
  'Flintshire Run Club':        'Running',
  'Couch to 5km':               'Running',
  'Women\'s Track Running':     'Running',
  'Flintshire Weightlifting Club': 'Weightlifting',
  'Stay Strong':                'Community',
  'Andy\'s Man Club':           'Community',
  'School Outreach':            'Community',
}

// Parses by matching header names so column order doesn't matter.
// Fixed columns (A–E) are read by position; variable columns are found by header text.
function parseSheetRows(values: string[][]): SheetRow[] {
  if (!values || values.length < 2) return []
  const [headers, ...rows] = values

  // Helper: find the index of the first header whose lowercase text includes the substring
  const col = (substring: string) => headers.findIndex(h => h.toLowerCase().includes(substring.toLowerCase()))

  const iDate      = 1
  const iProg      = 2
  const iType      = 3
  const iTotal     = 4
  const iNew       = col('new participant')
  const iUnder18   = col('under 18')
  const i18to30    = col('18-30')
  const i30to55    = col('30-55')
  const iOver55    = col('over 55')
  const iMale      = col('male')
  const iFemale    = col('female')
  const iOther     = col('other')

  const n = (row: string[], i: number) => (i >= 0 ? parseInt(row[i]) || 0 : 0)

  return rows
    .filter(row => row.length > 1 && row[iProg]?.trim())
    .map(row => ({
      date:              row[iDate]  || '',
      programme:         row[iProg]  || '',
      sessionType:       row[iType]  || '',
      totalParticipants: n(row, iTotal),
      newParticipants:   n(row, iNew),
      ageUnder18:        n(row, iUnder18),
      age18to30:         n(row, i18to30),
      age30to60:         n(row, i30to55),
      ageOver60:         n(row, iOver55),
      genderMale:        n(row, iMale),
      genderFemale:      n(row, iFemale),
      genderOther:       n(row, iOther),
    }))
}

export function aggregateData(rows: SheetRow[]): SheetData {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalParticipants = rows.reduce((sum, r) => sum + r.totalParticipants, 0)
  const totalNew = rows.reduce((sum, r) => sum + r.newParticipants, 0)
  const totalSessions = rows.length
  const activeThisMonth = rows
    .filter(r => toYearMonth(r.date) === thisMonth)
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
      over55: acc.over55 + r.ageOver60,
    }),
    { under18: 0, age18to30: 0, mid: 0, over55: 0 }
  )
  const byAge = [
    { name: 'Under 18', participants: ageTotals.under18 },
    { name: '18–30', participants: ageTotals.age18to30 },
    { name: '30–55', participants: ageTotals.mid },
    { name: 'Over 55', participants: ageTotals.over55 },
  ]

  const MONTH_LABELS: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
  }

  // Normalise a date string to YYYY-MM regardless of input format.
  // Handles: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY (with or without leading zeros).
  // Disambiguation: if first segment > 12 it must be the day (DD/MM); else defaults to DD/MM (UK).
  function toYearMonth(raw: string): string {
    if (!raw) return ''
    if (/^\d{4}-\d{2}/.test(raw)) return raw.slice(0, 7)
    const parts = raw.split('/')
    if (parts.length === 3) {
      const [a, b, y] = parts
      const fullYear = y.length <= 2 ? `20${y.padStart(2, '0')}` : y
      const month = parseInt(a) > 12 ? b : a
      return `${fullYear}-${month.padStart(2, '0')}`
    }
    return raw.slice(0, 7)
  }

  // Monthly breakdown by programme
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

  // Monthly breakdown by impact area (Running / Weightlifting / Community)
  const areaMonthlyMap: Record<string, Record<string, number>> = {}
  rows.forEach(r => {
    const key = toYearMonth(r.date)
    if (!key) return
    const area = IMPACT_AREA_MAP[r.programme] ?? 'Other'
    if (!areaMonthlyMap[key]) areaMonthlyMap[key] = {}
    areaMonthlyMap[key][area] = (areaMonthlyMap[key][area] || 0) + r.totalParticipants
    areaMonthlyMap[key]['_total'] = (areaMonthlyMap[key]['_total'] || 0) + r.totalParticipants
  })
  const byAreaMonth: MonthPoint[] = Object.entries(areaMonthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, d]) => {
      const [year, month] = key.split('-')
      const { _total, ...areas } = d
      return { month: `${MONTH_LABELS[month] ?? month} '${year.slice(2)}`, total: _total || 0, ...areas }
    })

  const allProgrammes = Array.from(new Set(rows.map(r => r.programme))).sort()

  return {
    totalParticipants,
    totalNew,
    totalSessions,
    activeThisMonth,
    byProgramme,
    byMonth,
    byAreaMonth,
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
    const sessionTab = encodeURIComponent('Form Responses 4')
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

// toYearMonth exported for use in tests / other modules
export function toYearMonth(raw: string): string {
  if (!raw) return ''
  if (/^\d{4}-\d{2}/.test(raw)) return raw.slice(0, 7)
  const parts = raw.split('/')
  if (parts.length === 3) {
    const [a, b, y] = parts
    const fullYear = y.length <= 2 ? `20${y.padStart(2, '0')}` : y
    const month = parseInt(a) > 12 ? b : a
    return `${fullYear}-${month.padStart(2, '0')}`
  }
  return raw.slice(0, 7)
}
