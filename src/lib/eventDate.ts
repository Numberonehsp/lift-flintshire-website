function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Turns a date typed into the Events sheet into YYYY-MM-DD, or null if it is not a real date.
// Accepts YYYY-MM-DD, DD/MM/YYYY, and YYYY-DD-MM when the middle part cannot be a month
// (a common typo, for example 2026-21-11). An unreadable date makes `new Date()` return
// "Invalid Date", which silently hides the event from the site, so callers must handle null.
export function normaliseEventDate(raw: string): string | null {
  const value = raw.trim()

  const dashed = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (dashed) {
    const year = Number(dashed[1])
    const a = Number(dashed[2])
    const b = Number(dashed[3])
    if (isRealDate(year, a, b)) return iso(year, a, b)
    if (isRealDate(year, b, a)) return iso(year, b, a)
    return null
  }

  const slashed = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashed) {
    const day = Number(slashed[1])
    const month = Number(slashed[2])
    const year = Number(slashed[3])
    return isRealDate(year, month, day) ? iso(year, month, day) : null
  }

  return null
}
