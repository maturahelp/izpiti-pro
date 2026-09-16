import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../landing-source.html', import.meta.url), 'utf8')

function classListFor(id) {
  const match = source.match(new RegExp(`<[^>]+id="${id}"[^>]*class="([^"]*)"`))
  assert.ok(match, `Missing element with id="${id}"`)
  return match[1].split(/\s+/).filter(Boolean)
}

test('landing page defaults the course tabs to NVO7', () => {
  assert.ok(classListFor('tab-nvo7').includes('gradient-btn'))
  assert.ok(classListFor('tab-nvo7').includes('text-white'))
  assert.ok(classListFor('cards-nvo7').includes('grid'))
  assert.ok(!classListFor('cards-nvo7').includes('hidden'))

  assert.ok(!classListFor('tab-nvo4').includes('gradient-btn'))
  assert.ok(classListFor('cards-nvo4').includes('hidden'))
})

test('landing page defaults the pricing tabs to 12th grade (DZI)', () => {
  assert.ok(classListFor('pricing-tab-dzi').includes('gradient-btn'))
  assert.ok(classListFor('pricing-tab-dzi').includes('text-white'))
  assert.ok(!classListFor('pricing-dzi').includes('hidden'))

  assert.ok(!classListFor('pricing-tab-nvo7').includes('gradient-btn'))
  assert.ok(classListFor('pricing-nvo7').includes('hidden'))

  assert.ok(!classListFor('pricing-tab-nvo4').includes('gradient-btn'))
  assert.ok(classListFor('pricing-nvo4').includes('hidden'))
})

test('pricing tabs are ordered 12th grade first', () => {
  const order = ['pricing-tab-dzi', 'pricing-tab-nvo7', 'pricing-tab-nvo4']
    .map((id) => source.indexOf(`id="${id}"`))
  assert.ok(order.every((i) => i > -1), 'all pricing tabs are present')
  assert.deepEqual(order, [...order].sort((a, b) => a - b), '12th grade tab renders first')
})

test('landing page shows and tracks the configured plan prices', () => {
  for (const price of ['29\\.99', '79\\.99', '119\\.99']) {
    assert.match(
      source,
      new RegExp(`<span class="text-4xl font-extrabold text-accent-navy">${price} €</span>`)
    )
  }
  // Grade 4 keeps its existing monthly plan.
  assert.match(source, /<span class="text-4xl font-extrabold text-accent-navy">9\.99 €<\/span>/)

  assert.match(source, /"name": "НВО 4\. клас месечен", "price": "9\.99"/)
  assert.match(source, /"name": "ДЗИ Бърз старт — 1 месец", "price": "29\.99"/)
  assert.match(source, /"name": "ДЗИ Сериозна подготовка — 3 месеца", "price": "79\.99"/)
  assert.match(source, /"name": "ДЗИ До матурата — 6 месеца", "price": "119\.99"/)
  assert.match(source, /"name": "НВО Бърз старт — 1 месец", "price": "29\.99"/)
  assert.match(source, /"name": "НВО Сериозна подготовка — 3 месеца", "price": "79\.99"/)
  assert.match(source, /"name": "НВО До изпита — 6 месеца", "price": "119\.99"/)

  assert.match(source, /'nvo4-full': 9\.99/)
  assert.match(source, /'dzi-start-1m': 29\.99/)
  assert.match(source, /'dzi-serious-3m': 79\.99/)
  assert.match(source, /'dzi-matura-6m': 119\.99/)
  assert.match(source, /'nvo-start-1m': 29\.99/)
  assert.match(source, /'nvo-serious-3m': 79\.99/)
  assert.match(source, /'nvo-exam-6m': 119\.99/)
})

test('every pricing checkout button maps to a known plan value', () => {
  const planKeys = [...source.matchAll(/data-checkout-plan="([^"]+)"/g)].map((m) => m[1])
  assert.ok(planKeys.length > 0, 'checkout buttons are present')
  const tracked = new Set(
    [...source.matchAll(/'([a-z0-9-]+)':\s*\d+\.\d+,/g)].map((m) => m[1])
  )
  for (const key of planKeys) {
    assert.ok(tracked.has(key), `PLAN_VALUES is missing a price for "${key}"`)
  }
})
