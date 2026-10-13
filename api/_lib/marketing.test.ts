import { describe, it, expect } from 'vitest'
import {
  listsForRegistration, listsForEvent, listsForYouthGuardian, hasMarketingConsent,
  brevoContactForSubmission, isValidEmail,
} from './marketing.js'

describe('hasMarketingConsent', () => {
  it('is true only for "yes"', () => {
    expect(hasMarketingConsent({ 'marketing-consent': 'yes' })).toBe(true)
    expect(hasMarketingConsent({ 'marketing-consent': 'on' })).toBe(false)
    expect(hasMarketingConsent({})).toBe(false)
  })
})

describe('listsForRegistration', () => {
  it('maps the register form name to its programme list plus Newsletter', () => {
    expect(listsForRegistration('register-womens-run-club')).toEqual(['Newsletter', 'Programme: womens-run-club'])
    expect(listsForRegistration('register-couch-to-5k')).toEqual(['Newsletter', 'Programme: couch-to-5k'])
  })
  it('returns only Newsletter for an unknown form', () => {
    expect(listsForRegistration('something-else')).toEqual(['Newsletter'])
  })
})

describe('listsForEvent', () => {
  it('adds the event list and the programme list when the event has a programme', () => {
    expect(listsForEvent('Nov_WTR', 'womens-run-club')).toEqual([
      'Newsletter', 'Event: Nov_WTR', 'Programme: womens-run-club',
    ])
  })
  it('skips the programme list when the event has none', () => {
    expect(listsForEvent('Nov_WTR', undefined)).toEqual(['Newsletter', 'Event: Nov_WTR'])
  })
})

describe('listsForYouthGuardian', () => {
  it('uses only the guardian list', () => {
    expect(listsForYouthGuardian()).toEqual(['Guardians: youth-weightlifting'])
  })
})

describe('brevoContactForSubmission', () => {
  const register = {
    'form-name': 'register-couch-to-5k',
    'first-name': 'Ann',
    'last-name': 'Smith',
    email: 'ann@example.com',
    'date-of-birth': '1990-01-01',
    phone: '07700 000000',
  }
  const youth = {
    'form-name': 'enquiry-youth-strength-conditioning',
    'guardian-first-name': 'Gail',
    'guardian-last-name': 'Jones',
    'guardian-email': 'gail@example.com',
    'guardian-phone': '07700 000001',
    'yp-first-name': 'Sam',
    'yp-school-year': 'Year 8 (age 12-13)',
    message: 'Hello',
  }

  it('returns null when marketing consent is absent or not exactly "yes"', () => {
    expect(brevoContactForSubmission('register-couch-to-5k', register)).toBeNull()
    expect(brevoContactForSubmission('register-couch-to-5k', { ...register, 'marketing-consent': 'on' })).toBeNull()
    expect(brevoContactForSubmission('enquiry-youth-strength-conditioning', youth)).toBeNull()
  })

  it('adds a registrant to Newsletter and the programme list with their name', () => {
    expect(brevoContactForSubmission('register-couch-to-5k', { ...register, 'marketing-consent': 'yes' })).toEqual({
      email: 'ann@example.com',
      firstName: 'Ann',
      lastName: 'Smith',
      lists: ['Newsletter', 'Programme: couch-to-5k'],
    })
  })

  it('sends only the guardian email for a youth enquiry, on the guardian list only', () => {
    const contact = brevoContactForSubmission('enquiry-youth-strength-conditioning', { ...youth, 'marketing-consent': 'yes' })
    expect(contact).toEqual({ email: 'gail@example.com', lists: ['Guardians: youth-weightlifting'] })
    expect(contact).not.toHaveProperty('firstName')
    expect(contact).not.toHaveProperty('lastName')
    expect(JSON.stringify(contact)).not.toMatch(/Sam|Year 8|Gail|Jones|07700/)
  })

  it('ignores contact messages, other enquiries and questionnaires', () => {
    const fields = { email: 'x@example.com', name: 'X', 'marketing-consent': 'yes' }
    expect(brevoContactForSubmission('contact', fields)).toBeNull()
    expect(brevoContactForSubmission('enquiry-girls-gym', fields)).toBeNull()
    expect(brevoContactForSubmission('programme-questionnaire', fields)).toBeNull()
  })

  it('returns null when the email is missing or invalid, and trims it', () => {
    expect(brevoContactForSubmission('register-couch-to-5k', { ...register, email: '', 'marketing-consent': 'yes' })).toBeNull()
    expect(brevoContactForSubmission('register-couch-to-5k', { ...register, email: 'nope', 'marketing-consent': 'yes' })).toBeNull()
    expect(
      brevoContactForSubmission('enquiry-youth-strength-conditioning', { ...youth, 'guardian-email': '  gail@example.com ', 'marketing-consent': 'yes' })?.email,
    ).toBe('gail@example.com')
  })
})

describe('isValidEmail', () => {
  it('accepts ordinary addresses and rejects junk', () => {
    expect(isValidEmail('a@example.com')).toBe(true)
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('no-at-sign')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a b@example.com')).toBe(false)
    expect(isValidEmail(`${'a'.repeat(250)}@example.com`)).toBe(false)
  })
})
