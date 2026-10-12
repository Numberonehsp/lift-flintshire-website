import type { SheetData } from '../hooks/useGoogleSheets'

export interface LiveHeroStat {
  value: string
  label: string
  /** Period the figure covers, for example "Since Apr '26". */
  period: string
}

// Exact below 10, otherwise rounded down to the nearest ten with a "+".
export function roundedCount(n: number): string {
  if (n < 10) return String(n)
  return `${Math.floor(n / 10) * 10}+`
}

export function buildHeroStats(data: SheetData): LiveHeroStat[] {
  if (data.totalParticipants === 0 && data.totalSessions === 0) return []
  const first = data.byMonth[0]?.month
  const period = first ? `Since ${first}` : 'All time'
  return [
    { value: roundedCount(data.totalParticipants), label: 'Attendances recorded', period },
    { value: roundedCount(data.totalSessions), label: 'Sessions delivered', period },
    { value: String(data.byProgramme.length), label: 'Programmes running', period },
  ]
}
