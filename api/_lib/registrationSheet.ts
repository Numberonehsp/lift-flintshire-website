// api/_lib/registrationSheet.ts — server only. Never imported from src/.
// Row layout for the Registrations tab in the PRIVATE sheet (written by api/submit-form.ts).
import { hasMarketingConsent } from './marketing.js'

export const SHEET_COLUMNS = [
  'Timestamp',
  'Form',
  'Programme',
  'First Name',
  'Last Name',
  'Date of Birth',
  'Gender',
  'School Year',
  'Guardian Name',
  'Guardian Email',
  'Guardian Phone',
  'Emergency Contact',
  'Emergency Phone',
  'Medical Conditions',
  'Medical Details',
  'Injuries',
  'Injury Details',
  'GDPR Consent',
  'Photo Consent',
  'Waiver Agreed',
  'Initials',
  'Referral Source',
  // New columns go on the END only: the Registrations tab already has rows in this order.
  'Marketing Consent',
]

/** One value per SHEET_COLUMNS entry, in the same order. */
export function buildSheetRow(fields: Record<string, string>): string[] {
  // Handles both Girls Gym (yp-* fields) and general forms (first-name etc.)
  const firstName = fields['yp-first-name'] ?? fields['first-name'] ?? ''
  const lastName  = fields['yp-last-name']  ?? fields['last-name']  ?? ''
  const guardianFirst = fields['guardian-first-name'] ?? ''
  const guardianLast  = fields['guardian-last-name']  ?? ''
  const guardianName  = [guardianFirst, guardianLast].filter(Boolean).join(' ')

  return [
    new Date().toISOString(),
    fields['form-name']                    ?? '',
    fields['programme']                    ?? '',
    firstName,
    lastName,
    fields['yp-date-of-birth']             ?? fields['date-of-birth'] ?? '',
    fields['yp-gender']                    ?? fields['gender']        ?? '',
    fields['yp-school-year']               ?? '',
    guardianName,
    fields['guardian-email']               ?? fields['email']         ?? '',
    fields['guardian-phone']               ?? fields['phone']         ?? '',
    fields['emergency-contact-name']       ?? fields['emergency-name']  ?? '',
    fields['emergency-contact-phone']      ?? fields['emergency-phone'] ?? '',
    fields['has-medical-conditions']       ?? '',
    fields['medical-conditions-details']   ?? '',
    fields['has-injuries']                 ?? '',
    fields['injury-details']               ?? '',
    fields['gdpr-consent']                 ?? '',
    fields['photo-consent']                ?? '',
    fields['waiver-agreed']                ?? '',
    fields['guardian-initials']            ?? fields['waiver-initials'] ?? '',
    fields['referral-source']              ?? '',
    hasMarketingConsent(fields) ? 'yes' : '',
  ]
}
