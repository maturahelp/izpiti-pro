import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('google analytics ids', () => {
  it('keeps the app layout and landing page on the current GA stream', () => {
    const layoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')
    const landingSource = readFileSync(new URL('../landing-source.html', import.meta.url), 'utf8')

    assert.match(layoutSource, /G-9LX2CPVD1T/)
    assert.match(landingSource, /G-9LX2CPVD1T/)

    assert.doesNotMatch(layoutSource, /G-9J2B53ZH5P/)
    assert.doesNotMatch(landingSource, /G-9J2B53ZH5P/)
  })
})
