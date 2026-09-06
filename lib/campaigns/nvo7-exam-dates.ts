/**
 * Single source of truth for the current NVO 7. клас exam dates.
 *
 * IMPORTANT: these are placeholders. Fill in the real dates (published
 * by MON, usually in the autumn before the exam) before the
 * nvo7_urgency_nudge campaign is triggered for the 2026/2027 cycle —
 * do not guess or reuse last year's dates. Once updated, bump
 * NVO7_EXAM_CYCLE_KEY too so the campaign dedupe key doesn't collide
 * with last year's send.
 */
export const NVO7_BEL_EXAM_DATE_ISO: string | null = null
export const NVO7_BEL_EXAM_DATE_LABEL = 'юни 2027 (дата предстои да бъде обявена от МОН)'
export const NVO7_MAT_EXAM_DATE_ISO: string | null = null
export const NVO7_MAT_EXAM_DATE_LABEL = 'юни 2027 (дата предстои да бъде обявена от МОН)'

/** Bump this alongside the dates above before re-running the campaign. */
export const NVO7_EXAM_CYCLE_KEY = 'jun2027'
