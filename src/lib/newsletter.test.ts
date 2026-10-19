import { describe, it, expect } from 'vitest'
import { newsletterInputError } from './newsletter'

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
