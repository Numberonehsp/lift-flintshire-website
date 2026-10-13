import { describe, it, expect } from 'vitest'
import { SHEET_COLUMNS, buildSheetRow } from './registrationSheet.js'

// The 22 columns that existed before Marketing Consent. Their positions must never move:
// the Registrations tab already has rows in this order.
const ORIGINAL = [
  'Timestamp', 'Form', 'Programme', 'First Name', 'Last Name', 'Date of Birth', 'Gender',
  'School Year', 'Guardian Name', 'Guardian Email', 'Guardian Phone', 'Emergency Contact',
  'Emergency Phone', 'Medical Conditions', 'Medical Details', 'Injuries', 'Injury Details',
  'GDPR Consent', 'Photo Consent', 'Waiver Agreed', 'Initials', 'Referral Source',
]

const fields = {
  'form-name': 'register-couch-to-5k', programme: 'couch-to-5k',
  'first-name': 'Ann', 'last-name': 'Smith', email: 'ann@example.com', 'gdpr-consent': 'yes',
}

describe('Registrations sheet', () => {
  it('keeps every existing column and adds Marketing Consent at the end', () => {
    expect(SHEET_COLUMNS.slice(0, ORIGINAL.length)).toEqual(ORIGINAL)
    expect(SHEET_COLUMNS).toHaveLength(ORIGINAL.length + 1)
    expect(SHEET_COLUMNS.at(-1)).toBe('Marketing Consent')
  })

  it('builds one value per column, with marketing consent last', () => {
    const row = buildSheetRow({ ...fields, 'marketing-consent': 'yes' })
    expect(row).toHaveLength(SHEET_COLUMNS.length)
    expect(row.at(-1)).toBe('yes')
    expect(row[SHEET_COLUMNS.indexOf('First Name')]).toBe('Ann')
    expect(row[SHEET_COLUMNS.indexOf('Guardian Email')]).toBe('ann@example.com')
  })

  it("stores '' unless marketing consent is exactly 'yes'", () => {
    expect(buildSheetRow(fields).at(-1)).toBe('')
    expect(buildSheetRow({ ...fields, 'marketing-consent': 'on' }).at(-1)).toBe('')
  })
})
