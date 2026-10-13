import { describe, it, expect } from 'vitest'
import {
  entryConfirmationHtml, entryConfirmationSubject, organiserNotification, isFreeAmount, subjectText,
} from './entryEmails.js'

const base = {
  firstName: 'Ann',
  eventTitle: "Women's Track Run",
  tierLabel: 'Standard Entry',
  ref: 'LF26-ABCDEF',
}

describe('isFreeAmount', () => {
  it('treats any zero amount as free', () => {
    expect(isFreeAmount('0.00')).toBe(true)
    expect(isFreeAmount('0')).toBe(true)
  })
  it('treats a positive amount as paid', () => {
    expect(isFreeAmount('81.42')).toBe(false)
    expect(isFreeAmount('0.01')).toBe(false)
  })
})

describe('entryConfirmationHtml', () => {
  it('says how much was paid for a paid entry', () => {
    const html = entryConfirmationHtml({ ...base, amount: '81.42' })
    expect(html).toContain('Your entry is confirmed')
    expect(html).toContain('£81.42 paid')
    expect(html).not.toContain('free entry')
  })

  it('says the entry is free and never shows £0.00 for a free entry', () => {
    const html = entryConfirmationHtml({ ...base, amount: '0.00' })
    expect(html).toContain('Your free entry is confirmed')
    expect(html).not.toContain('£0.00')
    expect(html).not.toContain('paid')
  })

  it('includes the reference and escapes every value', () => {
    const html = entryConfirmationHtml({
      firstName: '<b>Ann</b>', eventTitle: 'A & B', tierLabel: '"Tier"', ref: 'LF26-ABCDEF', amount: '10.00',
    })
    expect(html).toContain('LF26-ABCDEF')
    expect(html).toContain('&lt;b&gt;Ann&lt;/b&gt;')
    expect(html).toContain('A &amp; B')
    expect(html).toContain('&quot;Tier&quot;')
    expect(html).not.toContain('<b>Ann</b>')
  })
})

describe('entryConfirmationSubject', () => {
  it('names the event and reference', () => {
    expect(entryConfirmationSubject("Women's Track Run", 'LF26-ABCDEF'))
      .toBe("Entry confirmed: Women's Track Run (LF26-ABCDEF)")
  })
})

describe('organiserNotification', () => {
  it('labels a paid entry with its amount', () => {
    const n = organiserNotification({ ...base, email: 'ann@example.com', amount: '81.42' })
    expect(n.subject).toBe("New paid entry: Women's Track Run — Ann (LF26-ABCDEF)")
    expect(n.html).toContain('£81.42')
  })

  it('labels a free entry as free, without £0.00', () => {
    const n = organiserNotification({ ...base, email: 'ann@example.com', amount: '0.00' })
    expect(n.subject).toBe("New free entry: Women's Track Run — Ann (LF26-ABCDEF)")
    expect(n.html).toContain('free')
    expect(n.html).not.toContain('£0.00')
  })

  it('escapes the entrant email in the html', () => {
    const n = organiserNotification({ ...base, email: 'a<x>@example.com', amount: '1.00' })
    expect(n.html).toContain('a&lt;x&gt;@example.com')
  })
})

describe('subject line safety', () => {
  it('replaces CR/LF with a space, trims, and caps the length', () => {
    expect(subjectText('Run\r\nBcc: x@y.com', 50)).toBe('Run Bcc: x@y.com')
    expect(subjectText('  Track Run  ', 50)).toBe('Track Run')
    expect(subjectText('a'.repeat(200), 20)).toHaveLength(20)
  })

  it('applies to the entrant and organiser subjects', () => {
    const subject = entryConfirmationSubject(`Run\r\n${'x'.repeat(300)}`, 'LF26-ABCDEF')
    expect(subject).not.toMatch(/[\r\n]/)
    expect(subject.length).toBeLessThanOrEqual(160)
    expect(subject.endsWith('(LF26-ABCDEF)')).toBe(true)

    const notice = organiserNotification({
      ...base, amount: '0.00', email: 'a@example.com',
      eventTitle: 'Run\nX', firstName: `Ann\r\n${'y'.repeat(200)}`,
    })
    expect(notice.subject).not.toMatch(/[\r\n]/)
    expect(notice.subject.length).toBeLessThanOrEqual(220)
  })
})
