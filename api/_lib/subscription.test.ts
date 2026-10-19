import { describe, it, expect } from 'vitest'
import { validateSubscription, isBodyTooLarge, parseStringBody, MAX_SUBSCRIBE_BODY_BYTES } from './subscription.js'

describe('validateSubscription', () => {
  const good = { email: 'a@example.com', 'marketing-consent': 'yes', website: '' }

  it('accepts a valid email with consent and trims it', () => {
    expect(validateSubscription(good)).toEqual({ kind: 'ok', email: 'a@example.com' })
    expect(validateSubscription({ ...good, email: '  a@example.com ' })).toEqual({ kind: 'ok', email: 'a@example.com' })
  })

  it('accepts a body without a honeypot field', () => {
    expect(validateSubscription({ email: 'a@example.com', 'marketing-consent': 'yes' })).toEqual({ kind: 'ok', email: 'a@example.com' })
  })

  it('rejects a missing or invalid email', () => {
    expect(validateSubscription({ ...good, email: '' })).toEqual({ kind: 'invalid' })
    expect(validateSubscription({ ...good, email: 'not-an-email' })).toEqual({ kind: 'invalid' })
    expect(validateSubscription({ 'marketing-consent': 'yes' })).toEqual({ kind: 'invalid' })
    expect(validateSubscription({ ...good, email: ['a@example.com'] })).toEqual({ kind: 'invalid' })
  })

  it('requires marketing consent to be exactly "yes"', () => {
    expect(validateSubscription({ ...good, 'marketing-consent': undefined })).toEqual({ kind: 'invalid' })
    expect(validateSubscription({ ...good, 'marketing-consent': 'on' })).toEqual({ kind: 'invalid' })
    expect(validateSubscription({ ...good, 'marketing-consent': true })).toEqual({ kind: 'invalid' })
  })

  it('flags a filled honeypot so the endpoint can pretend success', () => {
    expect(validateSubscription({ ...good, website: 'http://spam.example' })).toEqual({ kind: 'honeypot' })
  })

  it('rejects non-object bodies', () => {
    expect(validateSubscription(undefined)).toEqual({ kind: 'invalid' })
    expect(validateSubscription(null)).toEqual({ kind: 'invalid' })
    expect(validateSubscription('email=a@example.com')).toEqual({ kind: 'invalid' })
    expect(validateSubscription([good])).toEqual({ kind: 'invalid' })
  })

  it('caps the body at 2 KB', () => {
    expect(MAX_SUBSCRIBE_BODY_BYTES).toBe(2048)
  })
})

describe('isBodyTooLarge', () => {
  it('uses the content-length header when present', () => {
    expect(isBodyTooLarge('100', {})).toBe(false)
    expect(isBodyTooLarge('2048', {})).toBe(false)
    expect(isBodyTooLarge('2049', {})).toBe(true)
  })

  it('falls back to the size of the parsed body', () => {
    expect(isBodyTooLarge(undefined, { email: 'a@example.com' })).toBe(false)
    expect(isBodyTooLarge(undefined, { email: 'a'.repeat(3000) })).toBe(true)
    expect(isBodyTooLarge(undefined, 'x'.repeat(3000))).toBe(true)
  })

  it('checks the parsed body even when the header understates it', () => {
    expect(isBodyTooLarge('10', { email: 'a'.repeat(3000) })).toBe(true)
  })
})

describe('parseStringBody', () => {
  it('parses JSON and urlencoded strings', () => {
    expect(parseStringBody('{"email":"a@example.com"}')).toEqual({ email: 'a@example.com' })
    expect(parseStringBody('email=a%40example.com&marketing-consent=yes')).toEqual({
      email: 'a@example.com',
      'marketing-consent': 'yes',
    })
  })

  it('returns undefined for broken JSON', () => {
    expect(parseStringBody('{"email":')).toBeUndefined()
  })
})
