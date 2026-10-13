import { describe, it, expect } from 'vitest'
import { ENTRY_COLUMNS, buildEntryRow, parseEntryRow, findPaidEntryRef } from './entriesSheet.js'
import type { PendingEntry } from './entriesSheet.js'

const entry: PendingEntry = {
  eventId: 'Nov_WTR', tierId: 'entry', tierLabel: 'Entry', entryRef: 'LF26-ABCDEF', sessionId: 'cs_test_1',
  firstName: 'Ann', lastName: 'Jones', email: 'ann@example.com', phone: '07000', dob: '1990-01-01',
  gender: 'female', emergencyName: 'Bob', emergencyPhone: '07111', medical: '',
  waiverAgreed: 'yes', photoConsent: '', gdprConsent: 'yes',
  teamName: '', clubOrGym: '', captainLiabilityAgreed: '',
  runners: [1, 2, 3, 4].map(() => ({ name: '', email: '' })),
  marketingConsent: '',
}

const col = (name: string) => ENTRY_COLUMNS.indexOf(name)

describe('ENTRY_COLUMNS', () => {
  it('keeps A–D as the only columns the public availability endpoint reads', () => {
    expect(ENTRY_COLUMNS.slice(0, 4)).toEqual(['Timestamp', 'Event ID', 'Tier ID', 'Status'])
  })

  it('appends Marketing Consent as the last column, after Runner 4 Email (column AH)', () => {
    expect(ENTRY_COLUMNS.at(-1)).toBe('Marketing Consent')
    expect(ENTRY_COLUMNS.at(-2)).toBe('Runner 4 Email')
    expect(ENTRY_COLUMNS.indexOf('Marketing Consent')).toBe(33) // AH
  })
})

describe('buildEntryRow', () => {
  it('writes a pending row with one value per column', () => {
    const row = buildEntryRow(entry, { status: 'pending', timestamp: 'T' })
    expect(row).toHaveLength(ENTRY_COLUMNS.length)
    expect(row[col('Timestamp')]).toBe('T')
    expect(row[col('Status')]).toBe('pending')
    expect(row[col('Amount Paid (GBP)')]).toBe('')
    expect(row[col('Paid At')]).toBe('')
    expect(row[col('Stripe Session ID')]).toBe('cs_test_1')
    expect(row[col('Email')]).toBe('ann@example.com')
    expect(row[col('Runner 4 Email')]).toBe('')
  })

  it('writes a confirmed free row as paid with 0.00 and a paid-at time', () => {
    const row = buildEntryRow({ ...entry, sessionId: 'free' }, {
      status: 'paid', amountGbp: '0.00', paidAt: 'P', timestamp: 'T',
    })
    expect(row[col('Status')]).toBe('paid')
    expect(row[col('Amount Paid (GBP)')]).toBe('0.00')
    expect(row[col('Paid At')]).toBe('P')
    expect(row[col('Stripe Session ID')]).toBe('free')
  })
})

describe('buildEntryRow marketing consent', () => {
  it('stores the consent value in the Marketing Consent column', () => {
    const row = buildEntryRow({ ...entry, marketingConsent: 'yes' }, { status: 'pending' })
    expect(row).toHaveLength(ENTRY_COLUMNS.length)
    expect(row[col('Marketing Consent')]).toBe('yes')
  })
})

describe('parseEntryRow', () => {
  it('returns last name and marketing consent', () => {
    const row = buildEntryRow({ ...entry, marketingConsent: 'yes' }, { status: 'pending' })
    expect(parseEntryRow(row, 2)).toMatchObject({ lastName: 'Jones', marketingConsent: 'yes' })
  })

  it('reads back what buildEntryRow wrote', () => {
    const row = buildEntryRow(entry, { status: 'pending', timestamp: 'T' })
    expect(parseEntryRow(row, 5)).toMatchObject({
      rowNumber: 5, status: 'pending', entryRef: 'LF26-ABCDEF', tierLabel: 'Entry',
      firstName: 'Ann', email: 'ann@example.com', eventId: 'Nov_WTR',
    })
  })

  it('tolerates a short row (Sheets drops trailing empty cells)', () => {
    expect(parseEntryRow(['T', 'Nov_WTR', 'entry', 'pending', 'LF26-X'], 2)).toMatchObject({
      status: 'pending', entryRef: 'LF26-X', firstName: '', email: '', lastName: '', marketingConsent: '',
    })
  })
})

describe('findPaidEntryRef', () => {
  it('relies on Email being column M and Entry Ref column E', () => {
    expect(col('Email')).toBe(12)
    expect(col('Entry Ref')).toBe(4)
  })

  // B:E -> event id, tier id, status, entry ref. M:M -> email. Both include the header row.
  const bToE = [
    ['Event ID', 'Tier ID', 'Status', 'Entry Ref'],
    ['Nov_WTR', 'entry', 'pending', 'LF26-PEND01'],
    ['Nov_WTR', 'entry', 'paid', 'LF26-PAID01'],
    ['Other', 'entry', 'paid', 'LF26-OTHER1'],
    [],
  ]
  const emails = [['Email'], ['ann@example.com'], ['Ann@Example.com '], ['bob@example.com'], []]

  it('finds a paid row for the same event and email, ignoring case and spaces', () => {
    expect(findPaidEntryRef(bToE, emails, 'Nov_WTR', ' ANN@example.com')).toBe('LF26-PAID01')
  })

  it('ignores pending rows, other events, and the header row', () => {
    expect(findPaidEntryRef(bToE, emails, 'Nov_WTR', 'bob@example.com')).toBeUndefined()
    expect(findPaidEntryRef(bToE, [['Email'], ['ann@example.com']], 'Nov_WTR', 'ann@example.com')).toBeUndefined()
    expect(findPaidEntryRef(bToE, emails, 'Event ID', 'Email')).toBeUndefined()
  })

  it('returns undefined for a blank email or empty sheet', () => {
    expect(findPaidEntryRef(bToE, emails, 'Nov_WTR', '  ')).toBeUndefined()
    expect(findPaidEntryRef([], [], 'Nov_WTR', 'ann@example.com')).toBeUndefined()
  })
})
