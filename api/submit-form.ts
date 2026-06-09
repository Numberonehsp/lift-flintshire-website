import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

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
  // Couch to 5K / Women's Run Club shared fields
  'first-name':                     'First name',
  'last-name':                      'Last name',
  'email':                          'Email',
  'phone':                          'Phone',
  'dob':                            'Date of birth',
  gender:                           'Gender',
  'age-group':                      'Age group',
  'health-conditions':              'Health conditions?',
  'health-details':                 'Health details',
  'emergency-name':                 'Emergency contact name',
  'emergency-phone':                'Emergency contact phone',
  consent:                          'Consent',
}

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

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
