import {
  DZI_ESSAY_FREE_MATERIAL_ID,
  dziEssayMaterialGroups,
  dziEssayMaterials,
} from '../data/dziEssayMaterials'
import { isFreeDziEssayMaterial } from '../lib/free-content'

const expectedSources = [
  '12_10 Поправка на съчинение I срок 12. клас.pdf',
  '_ Есе по житейски проблем.pptx',
  'Йорданова 12-1 ЕСЕ ПО ЖИТЕЙСКИ ПРОБЛЕМ.pdf',
  'Интерпретативно съчинение по проблем върху няколко творби.pdf',
  'Критерии_съчинение_2023.docx',
  'Откъс от ученическо интерпретативно съчинение_12.pdf',
  'критерии ИС и ЕСЕ - ДЗИ 2022 (4).pdf',
  'pravilen dzi spisuk ignorirai drugiq.pdf',
]

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

const ids = new Set<string>()
for (const material of dziEssayMaterials) {
  assert(!ids.has(material.id), `Duplicate material id: ${material.id}`)
  ids.add(material.id)
  assert(material.title.trim().length > 0, `Missing title for ${material.id}`)
  assert(material.description.trim().length > 0, `Missing description for ${material.id}`)
  assert(material.sections.length >= 3, `${material.id} should have at least 3 content sections`)
  assert(material.keywords.length >= 4, `${material.id} should have useful search keywords`)
  assert(material.quiz.length === 10, `${material.id} should have exactly 10 quiz questions`)

  for (const [questionIndex, question] of material.quiz.entries()) {
    assert(question.prompt.trim().length > 0, `${material.id} question ${questionIndex + 1} is missing a prompt`)
    assert(question.options.length === 4, `${material.id} question ${questionIndex + 1} should have 4 options`)
    assert(
      question.correctOptionIndex >= 0 && question.correctOptionIndex < question.options.length,
      `${material.id} question ${questionIndex + 1} has an invalid correct option index`
    )
    assert(question.explanation.trim().length > 0, `${material.id} question ${questionIndex + 1} is missing an explanation`)
  }
}

assert(dziEssayMaterials.length === 6, `Expected 6 essay materials, received ${dziEssayMaterials.length}`)
assert(dziEssayMaterialGroups.length >= 3, 'Expected materials to be grouped for the UI')
assert(dziEssayMaterials[0]?.id === DZI_ESSAY_FREE_MATERIAL_ID, 'The first material must be the free material')
assert(isFreeDziEssayMaterial(DZI_ESSAY_FREE_MATERIAL_ID), 'The free essay material id must pass the free-content whitelist')
assert(!isFreeDziEssayMaterial(dziEssayMaterials[1]?.id), 'Only the first essay material should be free')

const referencedSources = new Set(dziEssayMaterials.flatMap((material) => material.sourceFiles))
for (const source of expectedSources) {
  assert(referencedSources.has(source), `Missing source coverage: ${source}`)
}

console.log('DZI essay materials validation passed')
