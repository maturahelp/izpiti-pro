import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC, brandMetadataIcons } from '@/lib/brand'

assert.equal(BRAND_LOGO_SRC, '/brand/logo14.png', 'Brand logo src should use the cache-busted asset path')

const markup = renderToStaticMarkup(<BrandLogo />)

assert(markup.includes(`src="${BRAND_LOGO_SRC}"`), 'BrandLogo should render the shared logo src')
assert(markup.includes(`alt="${BRAND_LOGO_ALT}"`), 'BrandLogo should render the shared logo alt text')

const iconEntries = Array.isArray(brandMetadataIcons?.icon)
  ? brandMetadataIcons.icon
  : brandMetadataIcons?.icon
    ? [brandMetadataIcons.icon]
    : []

assert(
  iconEntries.some((entry) => {
    if (typeof entry === 'string') return entry === BRAND_LOGO_SRC
    return entry.url === BRAND_LOGO_SRC
  }),
  'Metadata icon config should point at the shared logo asset'
)

const landingHtml = readFileSync(join(process.cwd(), 'landing-source.html'), 'utf8')

assert(
  new RegExp(`<link[^>]+rel="icon"[^>]+href="${BRAND_LOGO_SRC.replace('/', '\\/')}"`).test(landingHtml),
  'Landing page should include a favicon link to the shared logo asset'
)

assert(
  new RegExp(`<link[^>]+rel="shortcut icon"[^>]+href="${BRAND_LOGO_SRC.replace('/', '\\/')}"`).test(landingHtml),
  'Landing page should include a shortcut icon link to the shared logo asset'
)

assert(
  new RegExp(`<link[^>]+rel="apple-touch-icon"[^>]+href="${BRAND_LOGO_SRC.replace('/', '\\/')}"`).test(landingHtml),
  'Landing page should include an Apple touch icon link to the shared logo asset'
)

const logoFilePath = join(process.cwd(), 'public', BRAND_LOGO_SRC.replace(/^\//, ''))
const sipsOutput = execFileSync('sips', ['-g', 'hasAlpha', logoFilePath], { encoding: 'utf8' })

assert(
  sipsOutput.includes('hasAlpha: yes'),
  'Brand logo asset should include transparency so the browser tab does not render a white square around it'
)

const alphaBox = execFileSync(
  'python3',
  [
    '-c',
    [
      'from PIL import Image',
      `img = Image.open(r"${logoFilePath}").convert("RGBA")`,
      'bbox = img.getchannel("A").getbbox()',
      'assert bbox, "missing alpha bbox"',
      'w = bbox[2] - bbox[0]',
      'h = bbox[3] - bbox[1]',
      'print(f"{w / img.size[0]:.4f} {h / img.size[1]:.4f}")',
    ].join('\n'),
  ],
  { encoding: 'utf8' }
).trim()

const [coverageW, coverageH] = alphaBox.split(' ').map(Number)

assert(
  coverageW >= 0.95 && coverageH >= 0.95,
  `Brand logo asset should fill more of the favicon canvas for legibility; got ${coverageW} x ${coverageH}`
)

console.log('brand logo wiring looks correct')
