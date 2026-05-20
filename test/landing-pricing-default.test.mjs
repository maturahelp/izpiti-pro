import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../landing-source.html', import.meta.url), 'utf8')

function classListFor(id) {
  const match = source.match(new RegExp(`<[^>]+id="${id}"[^>]*class="([^"]*)"`))
  assert.ok(match, `Missing element with id="${id}"`)
  return match[1].split(/\s+/).filter(Boolean)
}

test('landing page defaults course and pricing tabs to DZI', () => {
  assert.ok(classListFor('tab-dzi').includes('gradient-btn'))
  assert.ok(classListFor('tab-dzi').includes('text-white'))
  assert.ok(classListFor('cards-dzi').includes('grid'))
  assert.ok(!classListFor('cards-dzi').includes('hidden'))

  assert.ok(!classListFor('tab-nvo4').includes('gradient-btn'))
  assert.ok(classListFor('cards-nvo4').includes('hidden'))

  assert.ok(classListFor('pricing-tab-dzi').includes('gradient-btn'))
  assert.ok(classListFor('pricing-tab-dzi').includes('text-white'))
  assert.ok(!classListFor('pricing-dzi').includes('hidden'))

  assert.ok(!classListFor('pricing-tab-nvo4').includes('gradient-btn'))
  assert.ok(classListFor('pricing-nvo4').includes('hidden'))
})

test('landing page shows and tracks the configured plan prices', () => {
  assert.match(source, /<span class="text-4xl font-extrabold text-accent-navy">9\.99 €<\/span>/)
  assert.match(source, /<span class="text-4xl font-extrabold text-accent-navy">19\.99 €<\/span>/)
  assert.match(source, /<span class="text-4xl font-extrabold text-accent-navy">4\.99 €<\/span>/)
  assert.match(source, /"name": "НВО 4\. клас месечен", "price": "9\.99"/)
  assert.match(source, /"name": "ДЗИ до края на матурите", "price": "19\.99"/)
  assert.match(source, /"name": "Интензивен английски", "price": "4\.99"/)
  assert.match(source, /'nvo4-full': 9\.99/)
  assert.match(source, /'nvo-full': 19\.99/)
  assert.match(source, /"name": "Финален спринт НВО", "price": "9\.99"/)
  assert.match(source, /'nvo-sprint': 9\.99/)
  assert.match(source, /'dzi-full': 19\.99/)
  assert.match(source, /'dzi-english-sprint': 4\.99/)
})
