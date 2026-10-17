import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  cleanOfficialAnswerText,
  extractAnswerAlternatives,
  isManualCheckAnswer,
  matchesSubAnswer,
} from './official-answer'

describe('cleanOfficialAnswerText', () => {
  it('strips the glued points column from single-choice keys', () => {
    assert.equal(cleanOfficialAnswerText('Б 2', 'single_choice'), 'Б')
    assert.equal(cleanOfficialAnswerText('А 2 т.', 'single_choice'), 'А')
  })

  it('strips a small point value glued between two words', () => {
    assert.equal(
      cleanOfficialAnswerText('защото са употребени при 2 цитиране', 'open_response'),
      'защото са употребени при цитиране',
    )
    assert.equal(cleanOfficialAnswerText('по-късно 2', 'open_response'), 'по-късно')
    assert.equal(
      cleanOfficialAnswerText('Например: 3 която е закодирана в чипровските килими', 'open_response'),
      'Например: която е закодирана в чипровските килими',
    )
  })

  it('keeps real numbers that are part of the answer', () => {
    assert.equal(
      cleanOfficialAnswerText('А) „На прощаване в 1868 г.“; Б) „Заточеници“', 'open_response'),
      'А) „На прощаване в 1868 г.“; Б) „Заточеници“',
    )
    assert.equal(cleanOfficialAnswerText('А) 48 дни', 'open_response'), 'А) 48 дни')
    assert.equal(
      cleanOfficialAnswerText('височина 4,5 м; тегло 12 т / по-голямо тегло', 'open_response'),
      'височина 4,5 м; тегло 12 т / по-голямо тегло',
    )
    assert.equal(cleanOfficialAnswerText('1894 (е в периода между 1882 – 1937 г.)', 'open_response'), '1894 (е в периода между 1882 – 1937 г.)')
  })

  it('strips the points column between lettered matching answers', () => {
    assert.equal(
      cleanOfficialAnswerText('А) „Косачи“ 4 Б) „По жицата“ В) „Опълченците на Шипка“', 'open_response'),
      'А) „Косачи“ Б) „По жицата“ В) „Опълченците на Шипка“',
    )
    assert.equal(cleanOfficialAnswerText('А) 3 3 Б) 1 В) 2', 'open_response'), 'А) 3 Б) 1 В) 2')
  })

  it('strips "2 т." and "Общо 65" tails but not "12 т" (тона)', () => {
    assert.equal(cleanOfficialAnswerText('е по-малък/е по-малък от 20% 2 т.', 'open_response'), 'е по-малък/е по-малък от 20%')
    assert.equal(cleanOfficialAnswerText('вяра и убеденост Общо: 65 т.', 'open_response'), 'вяра и убеденост')
  })
})

describe('isManualCheckAnswer', () => {
  it('treats sample answers and long edited texts as manual', () => {
    assert.equal(isManualCheckAnswer('Примерни насоки за размисъл: вяра, надежда'), true)
    assert.equal(isManualCheckAnswer('Например: чипровски килим'), true)
    assert.equal(isManualCheckAnswer('а'.repeat(200)), true)
  })

  it('allows exact matching for short factual keys', () => {
    assert.equal(isManualCheckAnswer('по-късно'), false)
    assert.equal(isManualCheckAnswer('минало неопределено време'), false)
  })
})

describe('extractAnswerAlternatives', () => {
  it('splits alternatives on "/", ";" and "или"', () => {
    assert.deepEqual(extractAnswerAlternatives('тетрадка, учебник / тетрадка или учебник'), [
      'тетрадка учебник',
      'тетрадка',
      'учебник',
    ])
    assert.deepEqual(extractAnswerAlternatives('Възможни отговори: е по-малък/е по-малък от 20%'), [
      'е по-малък',
      'е по-малък от 20%',
    ])
  })
})

describe('matchesSubAnswer', () => {
  it('compares numeric keys by digits', () => {
    assert.equal(matchesSubAnswer('10 000', '10000'), true)
    assert.equal(matchesSubAnswer('17875', '17 875; 10000'), false)
  })

  it('compares text keys against any alternative, ignoring quotes and case', () => {
    assert.equal(matchesSubAnswer('„Опълченците на Шипка“', '„Опълченците на Шипка“ / „Българският език“'), true)
    assert.equal(matchesSubAnswer('българският език', '„Опълченците на Шипка“ / „Българският език“'), true)
    assert.equal(matchesSubAnswer('Опълченците на Шипка от Вазов', '„Опълченците на Шипка“'), true)
    assert.equal(matchesSubAnswer('Моканина', 'Петър Моканина / Моканина'), true)
    assert.equal(matchesSubAnswer('Серафим', '„Художник“'), false)
    assert.equal(matchesSubAnswer('', '„Художник“'), false)
  })
})
