import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC, brandMetadataIcons } from '@/lib/brand'

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

console.log('brand logo wiring looks correct')
