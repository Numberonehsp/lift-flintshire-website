import { describe, it, expect } from 'vitest'
import { newsletterInputError, subscribeSuccessMessage, SUBSCRIBED_MESSAGE, CONFIRM_EMAIL_MESSAGE } from './newsletter'

describe('newsletterInputError', () => {
  it('returns null for a valid email with consent ticked', () => {
    expect(newsletterInputError('a@example.com', true)).toBeNull()
    expect(newsletterInputError('  a@example.com  ', true)).toBeNull()
  })

  it('asks for an email when the field is empty', () => {
    expect(newsletterInputError('', true)).toEqual({ field: 'email', message: 'Please enter your email address.' })
    expect(newsletterInputError('   ', true)).toEqual({ field: 'email', message: 'Please enter your email address.' })
  })

  it('flags an address that does not look like an email', () => {
    for (const bad of ['nope', 'a@b', 'a b@example.com', '@example.com']) {
      expect(newsletterInputError(bad, true)).toEqual({
        field: 'email',
        message: 'Please enter a valid email address, like name@example.com.',
      })
    }
  })

  it('requires the consent box once the email is fine', () => {
    expect(newsletterInputError('a@example.com', false)).toEqual({
      field: 'consent',
      message: 'Please tick the box so we know you want our emails.',
    })
  })
})

describe('subscribeSuccessMessage', () => {
  it('asks the person to confirm when the API says double opt-in is on', () => {
    expect(subscribeSuccessMessage({ success: true, confirmEmail: true })).toBe(CONFIRM_EMAIL_MESSAGE)
    expect(CONFIRM_EMAIL_MESSAGE).toBe('Check your inbox to confirm your email address.')
  })
  it('keeps the existing message otherwise', () => {
    expect(subscribeSuccessMessage({ success: true })).toBe(SUBSCRIBED_MESSAGE)
    expect(subscribeSuccessMessage({ success: true, confirmEmail: 'yes' })).toBe(SUBSCRIBED_MESSAGE)
    expect(subscribeSuccessMessage(undefined)).toBe(SUBSCRIBED_MESSAGE)
    expect(subscribeSuccessMessage(null)).toBe(SUBSCRIBED_MESSAGE)
  })
})
