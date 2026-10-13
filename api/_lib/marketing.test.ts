import { describe, it, expect } from 'vitest'
import { listsForRegistration, listsForEvent, listsForYouthGuardian, hasMarketingConsent } from './marketing.js'

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
