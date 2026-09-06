import type { VercelRequest, VercelResponse } from '@vercel/node'
import { countTaken } from './_lib/entriesSheet.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const eventId = String(req.query.eventId ?? '')
  if (!eventId) return res.status(400).json({ error: 'eventId required' })

  try {
    const taken = await countTaken(eventId)
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ taken })
  } catch (err) {
    console.error('availability error:', err)
    return res.status(500).json({ error: 'Unavailable' })
  }
}
