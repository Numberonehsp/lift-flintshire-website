import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { google } from 'googleapis'

const FORM_LABELS: Record<string, string> = {
  'form-name':                      'Form',
  programme:                        'Programme',
  'yp-first-name':                  'Young person — first name',
  'yp-last-name':                   'Young person — last name',
  'yp-date-of-birth':               'Date of birth',
  'yp-gender':                      'Gender',
  'yp-school-year':                 'School year',
  'referral-source':                'How they heard about us',
  'guardian-first-name':            'Guardian — first name',
  'guardian-last-name':             'Guardian — last name',
  'guardian-relationship':          'Guardian relationship',
  'guardian-email':                 'Guardian email',
  'guardian-phone':                 'Guardian phone',
  'emergency-contact-name':         'Emergency contact name',
  'emergency-contact-relationship': 'Emergency contact relationship',
  'emergency-contact-phone':        'Emergency contact phone',
  'has-medical-conditions':         'Medical conditions?',
  'medical-conditions-details':     'Medical details',
  'has-injuries':                   'Injuries?',
  'injury-details':                 'Injury details',
  'gdpr-consent':                   'GDPR consent',
  'photo-consent':                  'Photo consent',
  'waiver-agreed':                  'Waiver agreed',
  'guardian-initials':              'Guardian initials',
  'first-name':                     'First name',
  'last-name':                      'Last name',
  'email':                          'Email',
  'phone':                          'Phone',
  'date-of-birth':                  'Date of birth',
  gender:                           'Gender',
  'emergency-name':                 'Emergency contact name',
  'emergency-phone':                'Emergency contact phone',
  'has-medical-conditions':         'Medical conditions?',
  'medical-conditions-details':     'Medical details',
  'waiver-initials':                'Initials',
}

// Ordered columns for the Registrations sheet
const FEEDBACK_SHEET_COLUMNS = [
  'Timestamp',
  'Programme',
  'Session Date',
  'Rating — Overall',
  'Rating — Coaching',
  'Rating — Welcome',
  'Rating — Venue',
  'Would Recommend',
  'Wellbeing Impact',
  'What Went Well',
  'Improvements',
  'Name',
  'Email',
  'Contact Consent',
]

function buildFeedbackRow(fields: Record<string, string>): string[] {
  return [
    new Date().toISOString(),
    fields['programme']          ?? '',
    fields['session-date']       ?? '',
    fields['rating-overall']     ?? '',
    fields['rating-coaching']    ?? '',
    fields['rating-welcome']     ?? '',
    fields['rating-venue']       ?? '',
    fields['would-recommend']    ?? '',
    fields['wellbeing-impact']   ?? '',
    fields['what-went-well']     ?? '',
    fields['improvements']       ?? '',
    fields['name']               ?? '',
    fields['email']              ?? '',
    fields['contact-consent']    ?? '',
  ]
}

const SHEET_COLUMNS = [
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
]

function buildHtml(fields: Record<string, string>): string {
  const formName = fields['form-name'] ?? 'Registration'
  const rows = Object.entries(fields)
    .filter(([k]) => k !== 'form-name')
    .map(([k, v]) => {
      const label = FORM_LABELS[k] ?? k
      const value = v === 'yes' ? '✅ Yes' : v === 'no' ? '❌ No' : v
      return `
        <tr>
          <td style="padding:6px 12px;background:#f5f5f5;font-weight:600;white-space:nowrap;border-bottom:1px solid #e0e0e0">${label}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0">${value}</td>
        </tr>`
    })
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#376A6B;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">New submission: ${formName}</h2>
        <p style="margin:4px 0 0;opacity:.7;font-size:13px">Lift Flintshire CIC website</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden">
        ${rows}
      </table>
      <p style="font-size:11px;color:#999;margin-top:12px">Submitted via liftflintshire.co.uk</p>
    </div>`
}

function buildSheetRow(fields: Record<string, string>): string[] {
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
  ]
}

async function appendToSheet(row: string[], tab: string, headers: string[]) {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!keyJson || !sheetId) {
    console.warn('Google Sheets env vars not set — skipping sheet write')
    return
  }

  const credentials = JSON.parse(keyJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // Check if header row exists, add if not
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tab}!A1:A1`,
  })

  if (!existing.data.values?.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tab}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    })
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const fields = req.body as Record<string, string>
  const formName = fields['form-name'] ?? 'Registration'

  try {
    // 1 — Send email
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Lift Flintshire Website <forms@liftflintshire.co.uk>',
      to: ['hello@liftflintshire.co.uk'],
      replyTo: fields['guardian-email'] ?? fields['email'],
      subject: `New registration: ${formName.replace(/-/g, ' ')}`,
      html: buildHtml(fields),
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Email failed' })
    }

    // 2 — Save to Google Sheet (non-fatal if it fails)
    try {
      const isQuestionnaire = formName === 'programme-questionnaire'
      if (isQuestionnaire) {
        await appendToSheet(buildFeedbackRow(fields), 'Feedback', FEEDBACK_SHEET_COLUMNS)
      } else {
        await appendToSheet(buildSheetRow(fields), 'Registrations', SHEET_COLUMNS)
      }
    } catch (sheetErr) {
      console.error('Sheet write error (non-fatal):', sheetErr)
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
