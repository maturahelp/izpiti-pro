/**
 * Whitelist на безплатно съдържание за регистрирани потребители без активен
 * premium план. Pricing-ът обещава тези items на free tier-а; този файл е
 * единственият източник на истината кое е свободно.
 *
 * Безплатният план за 7. и 12. клас обещава на landing page-а:
 *   - 2 видео урока по литература
 *   - 1 примерен (mock) изпит — изцяло отворен
 *   - 1 официален изпит от минали години — изцяло отворен
 *   - 1 тема/правило от учебните материали заедно с упражнението към нея
 *
 * Останалите официални изпити от минали години са freemium — първите
 * FREE_PAST_EXAM_QUESTIONS въпроса са видими, а останалите са заключени
 * (виж app/(student)/dashboard/tests/[id]/page.tsx).
 *
 * За НВО (7 клас): две литературни произведения (Художник, На прощаване в
 * 1868 г.), първата БЕЛ учебна тема, първата математическа подтема. Всички
 * текстове на литературните произведения също са безплатни — text panel-ът
 * винаги е отворен.
 *
 * За ДЗИ (12 клас): две литературни произведения (Потомка, Андрешко), първото
 * БЕЛ правило, един английски учебен материал (Essay Structure Format) и
 * материалът "Интерпретативно съчинение върху няколко творби".
 */

export const FREE_LITERATURE_WORK_IDS = {
  nvo: 'nvo-lit-22',        // Художник — Веселин Ханчев
  nvoSecond: 'nvo-lit-06',  // На прощаване в 1868 г. — Христо Ботев
  dzi: 'lit-26',            // Потомка — Елисавета Багряна
  dziSecond: 'lit-08',      // Андрешко — Елин Пелин
} as const

/** Примерни (mock) изпити, които free tier-ът отключва изцяло. */
export const FREE_MOCK_EXAM_IDS = {
  nvo: 'mock_nvo_bel_01',        // Примерен НВО БЕЛ #1
  dzi: 'selected_mock_dzi_01',   // Примерен ДЗИ БЕЛ #1
} as const

/**
 * Официални изпити от минали години, които free tier-ът отключва изцяло
 * (без 3-въпросния freemium лимит).
 */
export const FREE_OFFICIAL_EXAM_IDS = {
  nvo: 'nvo-bel-2025',        // НВО Български език — изпит 2025
  dzi: 'dzi-bel-2025-may',    // ДЗИ БЕЛ — май 2025
} as const

export const FREE_BEL_NVO_TOPIC_INDEX = 0  // Тема 1 — учебна тема в БЕЛ curriculum
export const FREE_BEL_DZI_RULE_INDEX = 0   // Правило 1 — първо правило в bulgarianRuleSections

export const FREE_MATH_NVO_TOPIC_ID = 'chisla-algebra'
export const FREE_MATH_NVO_SUBTOPIC_ID = 'alg-natural'

export const FREE_ENGLISH_DZI_MATERIAL_TITLE = 'Essay Structure Format'
export const FREE_DZI_ESSAY_MATERIAL_ID = 'dzi-essay-interpretative-multiple-works'

const FREE_LITERATURE_WORK_ID_SET: ReadonlySet<string> = new Set(
  Object.values(FREE_LITERATURE_WORK_IDS)
)

const FREE_MOCK_EXAM_ID_SET: ReadonlySet<string> = new Set(Object.values(FREE_MOCK_EXAM_IDS))

const FREE_OFFICIAL_EXAM_ID_SET: ReadonlySet<string> = new Set(
  Object.values(FREE_OFFICIAL_EXAM_IDS)
)

export function isFreeLiteratureWork(workId: string | null | undefined): boolean {
  if (!workId) return false
  return FREE_LITERATURE_WORK_ID_SET.has(workId)
}

/** Примерен изпит от free плана — достъпен без premium. */
export function isFreeMockExam(testId: string | null | undefined): boolean {
  if (!testId) return false
  return FREE_MOCK_EXAM_ID_SET.has(testId)
}

/** Официален изпит от free плана — показва се изцяло, без 3-въпросния лимит. */
export function isFreeOfficialExam(testId: string | null | undefined): boolean {
  if (!testId) return false
  return FREE_OFFICIAL_EXAM_ID_SET.has(testId)
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

export function isFreeDziEssayMaterial(materialId: string | null | undefined): boolean {
  return materialId === FREE_DZI_ESSAY_MATERIAL_ID
}
