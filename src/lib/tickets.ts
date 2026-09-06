// MIRROR: this file must stay byte-identical to api/_lib/tickets.ts below the header
// comment. Vercel functions cannot import from src/ (see commit e8572dc), so the logic is
// duplicated on purpose. src/lib/tickets.test.ts fails if the two drift apart.

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
