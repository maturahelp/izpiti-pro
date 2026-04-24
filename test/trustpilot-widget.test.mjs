import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const landingHtml = fs.readFileSync(path.join(repoRoot, 'landing-source.html'), 'utf8')

test('landing page loads the Trustpilot TrustBox bootstrap script in the head', () => {
  assert.match(
    landingHtml,
    /<script type="text\/javascript" src="\/\/widget\.trustpilot\.com\/bootstrap\/v5\/tp\.widget\.bootstrap\.min\.js" async><\/script>/,
  )
})

test('landing page renders the Trustpilot Review Collector widget in the reviews section', () => {
  assert.match(landingHtml, /<div class="trustpilot-widget"/)
  assert.match(landingHtml, /data-template-id="56278e9abfbbba0bdcd568bc"/)
  assert.match(landingHtml, /data-businessunit-id="69e134ff73f43e0c4356f6f3"/)
  assert.match(landingHtml, /data-token="3e1c945c-8d8b-478a-8e00-6ee8bb0ae531"/)
  assert.match(landingHtml, /href="https:\/\/www\.trustpilot\.com\/review\/maturahelp\.com"/)
})
