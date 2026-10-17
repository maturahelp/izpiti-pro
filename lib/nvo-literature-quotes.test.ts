import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { nvoLiteratureRichSummaries } from '../data/nvoLiteratureRichSummaries'
import { nvoLiteratureWorkTextPaths } from '../data/nvoLiteratureWorkTexts'
import { isDescriptiveQuote, missingQuoteFragments, normalizeForMatch, quoteFragments } from './nvo-literature-quotes'

const publicDir = join(__dirname, '..', 'public')

function readWorkText(workId: string): string | null {
  const relative = nvoLiteratureWorkTextPaths[workId]
  if (!relative) return null
  return readFileSync(join(publicDir, relative), 'utf8')
}

describe('nvo literature quote helpers', () => {
  it('normalises quote marks, dashes and ѝ/й', () => {
    assert.equal(normalizeForMatch('„Бабо,  хляб!“ — ѝ рече'), 'бабо, хляб! - й рече')
  })

  it('splits on ellipses and verse separators', () => {
    assert.deepEqual(quoteFragments('Какво им даваш от разкоша си ти / толкоз щедър към едни…'), [
      'какво им даваш от разкоша си ти',
      'толкоз щедър към едни',
    ])
  })

  it('reports the fragments that are missing from the text', () => {
    assert.deepEqual(missingQuoteFragments('тиха бяла Дунава', 'Дунава шуми'), ['тиха бяла дунава'])
    assert.deepEqual(missingQuoteFragments('Остàви я за пуста печалба…', 'Остави я за пуста печалба... Усилни'), [])
  })
})

describe('every quote in nvoLiteratureRichSummaries appears in the work text', () => {
  for (const [workId, summary] of Object.entries(nvoLiteratureRichSummaries)) {
    const text = readWorkText(workId)
    if (text === null) {
      // Works without a text file (currently none after PR #62) cannot be checked.
      continue
    }

    it(`${workId} · ${summary.title}`, () => {
      const problems: string[] = []
      for (const quote of summary.quotes) {
        if (isDescriptiveQuote(quote.text)) continue
        const missing = missingQuoteFragments(quote.text, text)
        if (missing.length > 0) {
          problems.push(`„${quote.text}“ → not found: ${missing.map((m) => `„${m}“`).join(', ')}`)
        }
      }
      assert.deepEqual(problems, [], `Quotes not found in ${nvoLiteratureWorkTextPaths[workId]}:\n${problems.join('\n')}`)
    })
  }
})
