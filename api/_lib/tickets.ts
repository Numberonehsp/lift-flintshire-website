// MIRROR of src/lib/tickets.ts — server-side copy.
// api/ cannot import from src/ (commit e8572dc: FUNCTION_INVOCATION_FAILED broke every
// form on the site). Edit src/lib/tickets.ts, then re-copy the body here; the mirror test
// in src/lib/tickets.test.ts fails if they drift.

export interface TicketTier {
  eventId: string
  tierId: string
  label: string
  pricePence: number
  capacity: number
  sortOrder: number
}

/** tierId -> number of places taken (paid, or pending and still held) */
export type TakenCounts = Record<string, number>

export type TierAvailability = 'available' | 'sold_out' | 'not_yet'

export function parseTicketTypesSheet(values: string[][], eventId: string): TicketTier[] {
  if (!values || values.length < 2) return []
  const [, ...rows] = values
  return rows
    .filter(r => r[0] === eventId && r[1] && r[3] && r[4])
    .map(r => ({
      eventId: r[0],
      tierId: r[1],
      label: r[2] || r[1],
      pricePence: Math.round(parseFloat(r[3]) * 100),
      capacity: parseInt(r[4], 10),
      sortOrder: parseInt(r[5], 10) || 0,
    }))
    .filter(t => Number.isFinite(t.pricePence) && Number.isFinite(t.capacity))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function pickAvailableTier(tiers: TicketTier[], taken: TakenCounts): TicketTier | null {
  for (const tier of tiers) {
    if ((taken[tier.tierId] ?? 0) < tier.capacity) return tier
  }
  return null
}

export function tierStatuses(
  tiers: TicketTier[],
  taken: TakenCounts,
): { tier: TicketTier; status: TierAvailability }[] {
  const current = pickAvailableTier(tiers, taken)
  return tiers.map(tier => ({
    tier,
    status:
      tier.tierId === current?.tierId ? 'available'
      : (taken[tier.tierId] ?? 0) >= tier.capacity ? 'sold_out'
      : 'not_yet',
  }))
}
