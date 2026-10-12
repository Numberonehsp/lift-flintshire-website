// monthKey is "YYYY-MM". The current calendar month is still being recorded,
// so its bar is not comparable with finished months.
export function isInProgressMonth(monthKey: string | undefined, now: Date = new Date()): boolean {
  if (!monthKey) return false
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthKey === current
}
