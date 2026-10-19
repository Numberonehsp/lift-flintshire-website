import { describe, it, expect } from 'vitest'
import { responsiveImage } from './images'

describe('responsiveImage', () => {
  it('maps a .jpeg photo to its WebP src and srcSet', () => {
    expect(responsiveImage('/images/foo.jpeg')).toEqual({
      src: '/images/foo-1600.webp',
      srcSet: '/images/foo-800.webp 800w, /images/foo-1600.webp 1600w',
    })
  })

  it('handles .jpg and upper-case extensions', () => {
    expect(responsiveImage('/images/oly-ohs.jpg').src).toBe('/images/oly-ohs-1600.webp')
    expect(responsiveImage('/images/Bar.JPG').srcSet).toBe('/images/Bar-800.webp 800w, /images/Bar-1600.webp 1600w')
  })

  it('only strips the final extension', () => {
    expect(responsiveImage('/images/a.jpeg.jpg').src).toBe('/images/a.jpeg-1600.webp')
  })

  it('rejects paths that are not JPG photos', () => {
    expect(() => responsiveImage('/images/logo.svg')).toThrow()
  })
})

describe('photo files', () => {
  it('every /images/*.jpg referenced in src has both WebP sizes in public/images', async () => {
    const { readdirSync, readFileSync, existsSync } = await import('node:fs')
    const { join } = await import('node:path')
    const root = join(__dirname, '..', '..')
    const files = readdirSync(join(root, 'src'), { recursive: true, encoding: 'utf8' })
      // images.ts itself is skipped: its doc comment uses an example path.
      .filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts') && !f.endsWith('images.ts'))
    const refs = new Set<string>()
    for (const f of files) {
      for (const m of readFileSync(join(root, 'src', f), 'utf8').matchAll(/['"`](\/images\/[\w.-]+\.jpe?g)['"`]/gi)) {
        refs.add(m[1])
      }
    }
    expect(refs.size).toBeGreaterThan(0)
    for (const ref of refs) {
      const { srcSet } = responsiveImage(ref)
      for (const candidate of srcSet.split(', ')) {
        const url = candidate.split(' ')[0]
        expect(existsSync(join(root, 'public', url)), url).toBe(true)
      }
    }
  })
})
