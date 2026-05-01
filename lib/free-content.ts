/**
 * Whitelist на безплатно съдържание за регистрирани потребители без активен
 * premium план. Pricing-ът обещава тези items на free tier-а; този файл е
 * единственият източник на истината кое е свободно.
 *
 * За НВО (7 клас): едно литературно произведение (Художник), първата БЕЛ
 * учебна тема, първата математическа подтема. Всички текстове на
 * литературните произведения и всички НВО изпити от минали години също са
 * безплатни — но тяхното gating-ване вече е реализирано директно (text
 * panel винаги е отворен; past exams минават през isPastExamId).
 *
 * За ДЗИ (12 клас): едно литературно произведение (Потомка), първото
 * БЕЛ правило, един английски учебен материал (Essay Structure Format).
 */

export const FREE_LITERATURE_WORK_IDS = {
  nvo: 'nvo-lit-22', // Художник — Веселин Ханчев
  dzi: 'lit-26',      // Потомка — Елисавета Багряна
} as const

export const FREE_BEL_NVO_TOPIC_INDEX = 0  // Тема 1 — учебна тема в БЕЛ curriculum
export const FREE_BEL_DZI_RULE_INDEX = 0   // Правило 1 — първо правило в bulgarianRuleSections

export const FREE_MATH_NVO_TOPIC_ID = 'chisla-algebra'
export const FREE_MATH_NVO_SUBTOPIC_ID = 'alg-natural'

export const FREE_ENGLISH_DZI_MATERIAL_TITLE = 'Essay Structure Format'

export function isFreeLiteratureWork(workId: string | null | undefined): boolean {
  if (!workId) return false
  return workId === FREE_LITERATURE_WORK_IDS.nvo || workId === FREE_LITERATURE_WORK_IDS.dzi
}

export function isFreeBelNvoTopic(topicIndex: number): boolean {
  return topicIndex === FREE_BEL_NVO_TOPIC_INDEX
}

export function isFreeBelDziRule(ruleIndex: number): boolean {
  return ruleIndex === FREE_BEL_DZI_RULE_INDEX
}

export function isFreeMathNvoSubtopic(topicId: string, subtopicId: string): boolean {
  return topicId === FREE_MATH_NVO_TOPIC_ID && subtopicId === FREE_MATH_NVO_SUBTOPIC_ID
}

export function isFreeEnglishDziMaterial(title: string): boolean {
  return title === FREE_ENGLISH_DZI_MATERIAL_TITLE
}
