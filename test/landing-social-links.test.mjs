import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const landingHtml = fs.readFileSync(path.join(repoRoot, 'landing-source.html'), 'utf8')

function countMatches(pattern) {
  return [...landingHtml.matchAll(pattern)].length
}

test('landing page keeps Instagram and TikTok links only in the footer', () => {
  assert.equal(countMatches(/data-social-link="instagram"/g), 1)
  assert.equal(countMatches(/data-social-link="tiktok"/g), 1)

  assert.match(
    landingHtml,
    /data-social-link="instagram" data-social-surface="footer"[\s\S]*href="https:\/\/www\.instagram\.com\/maturahelp"/,
  )
  assert.match(
    landingHtml,
    /data-social-link="tiktok" data-social-surface="footer"[\s\S]*href="https:\/\/www\.tiktok\.com\/@maturahelpbg"/,
  )
  assert.doesNotMatch(landingHtml, /data-social-surface="header"/)
  assert.doesNotMatch(landingHtml, /data-social-surface="mobile"/)
})

test('landing page uses the shared filled social icon treatment', () => {
  assert.match(landingHtml, /\.social-icon-link\s*\{/)
  assert.match(landingHtml, /\.social-icon-link--footer\s*\{/)
  assert.match(landingHtml, /viewBox="0 0 24 24" fill="currentColor"/)
})
