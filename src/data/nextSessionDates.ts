// Single source of truth for one-off "next session" dates that don't follow a
// fixed weekly pattern the Programme_Sessions Google Sheet tab can express.
// Update the date here — it flows through to both the Programmes & Events
// card and the relevant registration page.

export const WOMENS_RUN_CLUB_NEXT_SESSION = new Date(2026, 7, 15) // 15 August 2026
export const COUCH_TO_5K_NEXT_COHORT_START = new Date(2026, 8, 9) // 9 September 2026

export function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function sessionHasPassed(date: Date): boolean {
  const now = new Date()
  return now > new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
}
