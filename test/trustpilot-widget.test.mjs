import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const landingHtml = fs.readFileSync(path.join(repoRoot, 'landing-source.html'), 'utf8')

test('landing page loads the Trustpilot TrustBox bootstrap lazily, not as a blocking head script', () => {
  // The bootstrap is injected by an IntersectionObserver next to the widget (see the reviews section).
  assert.match(landingHtml, /s\.src = 'https:\/\/widget\.trustpilot\.com\/bootstrap\/v5\/tp\.widget\.bootstrap\.min\.js'/)
  assert.match(landingHtml, /new IntersectionObserver\([\s\S]{0,400}io\.observe\(box\)/)
  assert.doesNotMatch(landingHtml, /<script[^>]*src="(https:)?\/\/widget\.trustpilot\.com\/bootstrap/)
})

test('landing page renders the Trustpilot Review Collector widget in the reviews section', () => {
  assert.match(landingHtml, /<div class="trustpilot-widget[^"]*"/)
  assert.match(landingHtml, /data-template-id="56278e9abfbbba0bdcd568bc"/)
  assert.match(landingHtml, /data-businessunit-id="69e134ff73f43e0c4356f6f3"/)
  assert.match(landingHtml, /data-token="3e1c945c-8d8b-478a-8e00-6ee8bb0ae531"/)
  assert.match(landingHtml, /href="https:\/\/www\.trustpilot\.com\/review\/maturahelp\.com"/)
})
