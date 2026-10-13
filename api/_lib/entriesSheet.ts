// api/_lib/entriesSheet.ts — server only. Never imported from src/.
import { google } from 'googleapis'
import type { TakenCounts } from './tickets.js'

export const ENTRIES_TAB = 'Event_Entries'

/** Column order is load-bearing: A–D are the only columns the public availability
 *  endpoint reads, so no personal or health data is loaded into a public function. */
export const ENTRY_COLUMNS = [
  'Timestamp', 'Event ID', 'Tier ID', 'Status', 'Entry Ref', 'Tier Label',
  'Amount Paid (GBP)', 'Stripe Session ID', 'Paid At', 'Checked In',
  'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Gender',
  'Emergency Contact', 'Emergency Phone', 'Medical Details',
  'Waiver Agreed', 'Photo Consent', 'GDPR Consent',
  'Team Name', 'Club/Gym', 'Captain Liability Accepted',
  'Runner 1 Name', 'Runner 1 Email', 'Runner 2 Name', 'Runner 2 Email',
  'Runner 3 Name', 'Runner 3 Email', 'Runner 4 Name', 'Runner 4 Email',
  // New columns go on the END only. Marketing Consent is column AH: 'yes' or blank.
  'Marketing Consent',
]

/** A pending row holds its place for this long, matching the Stripe session expiry. */
export const HOLD_MS = 30 * 60 * 1000

function sheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

const sheetId = () => process.env.PRIVATE_SHEET_ID!

async function ensureHeaderRow(): Promise<void> {
  const api = sheets()
  const existing = await api.spreadsheets.values.get({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A1:A1`,
  })
  if (!existing.data.values?.length) {
    await api.spreadsheets.values.append({
      spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A1`,
      valueInputOption: 'RAW', requestBody: { values: [ENTRY_COLUMNS] },
    })
  }
}

/** Reads ONLY columns A–D (timestamp, event, tier, status). No personal data. */
export async function countTaken(eventId: string, now = Date.now()): Promise<TakenCounts> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A:D`,
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  const counts: TakenCounts = {}
  for (const [timestamp, rowEvent, tierId, status] of rows.slice(1)) {
    if (rowEvent !== eventId || !tierId) continue
    const held = status === 'paid'
      || (status === 'pending' && now - Date.parse(timestamp) < HOLD_MS)
    if (held) counts[tierId] = (counts[tierId] ?? 0) + 1
  }
  return counts
}

export interface PendingEntry {
  eventId: string
  tierId: string
  tierLabel: string
  entryRef: string
  sessionId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  gender: string
  emergencyName: string
  emergencyPhone: string
  medical: string
  waiverAgreed: string
  photoConsent: string
  gdprConsent: string
  teamName: string
  clubOrGym: string
  captainLiabilityAgreed: string
  runners: { name: string; email: string }[]
  /** 'yes' when the entrant ticked the optional email opt-in, otherwise ''. */
  marketingConsent: string
}

export interface RowState {
  status: 'pending' | 'paid'
  timestamp?: string
  amountGbp?: string
  paidAt?: string
}

/** One value per ENTRY_COLUMNS entry, in the same order. */
export function buildEntryRow(e: PendingEntry, state: RowState): string[] {
  return [
    state.timestamp ?? new Date().toISOString(), e.eventId, e.tierId, state.status, e.entryRef, e.tierLabel,
    state.amountGbp ?? '', e.sessionId, state.paidAt ?? '', '',
    e.firstName, e.lastName, e.email, e.phone, e.dob, e.gender,
    e.emergencyName, e.emergencyPhone, e.medical,
    e.waiverAgreed, e.photoConsent, e.gdprConsent,
    e.teamName, e.clubOrGym, e.captainLiabilityAgreed,
    ...e.runners.flatMap(r => [r.name, r.email]),
    e.marketingConsent,
  ]
}

async function appendRow(row: string[]): Promise<void> {
  await ensureHeaderRow()
  await sheets().spreadsheets.values.append({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

export async function appendPendingEntry(e: PendingEntry): Promise<void> {
  await appendRow(buildEntryRow(e, { status: 'pending' }))
}

/**
 * A free tier skips Stripe, so the row is written already confirmed (`paid`, £0.00) in a
 * single append. `countTaken` counts `paid` rows, so free entries use up capacity.
 */
export async function appendFreeEntry(e: PendingEntry): Promise<void> {
  const now = new Date().toISOString()
  await appendRow(buildEntryRow(e, { status: 'paid', timestamp: now, amountGbp: '0.00', paidAt: now }))
}

export interface EntryRow {
  rowNumber: number
  status: string
  entryRef: string
  tierLabel: string
  firstName: string
  lastName: string
  email: string
  eventId: string
  marketingConsent: string
}

const at = (name: string) => ENTRY_COLUMNS.indexOf(name)

/** Sheets drops trailing empty cells, so any index may be missing. */
export function parseEntryRow(row: string[], rowNumber: number): EntryRow {
  const cell = (name: string) => row[at(name)] ?? ''
  return {
    rowNumber,
    status: cell('Status'),
    entryRef: cell('Entry Ref'),
    tierLabel: cell('Tier Label'),
    firstName: cell('First Name'),
    lastName: cell('Last Name'),
    email: cell('Email'),
    eventId: cell('Event ID'),
    marketingConsent: cell('Marketing Consent'),
  }
}

/** Finds a row by entry ref. Reads the full row (server-side only). */
export async function findEntryByRef(entryRef: string): Promise<EntryRow | null> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: sheetId(), range: `${ENTRIES_TAB}!A:AH`, // through Marketing Consent
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  const refIndex = at('Entry Ref')
  const index = rows.findIndex((r, i) => i > 0 && r[refIndex] === entryRef)
  if (index === -1) return null
  return parseEntryRow(rows[index], index + 1) // sheet rows are 1-based
}

export async function markEntryPaid(rowNumber: number, amountGbp: string): Promise<void> {
  await sheets().spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId(),
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `${ENTRIES_TAB}!D${rowNumber}`, values: [['paid']] },
        { range: `${ENTRIES_TAB}!G${rowNumber}`, values: [[amountGbp]] },
        { range: `${ENTRIES_TAB}!I${rowNumber}`, values: [[new Date().toISOString()]] },
      ],
    },
  })
}
