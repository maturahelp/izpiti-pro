export const MATURA_FINAL_CAMPAIGN_KEY = 'matura-final-2026-05'
export const MATURA_FINAL_DISCOUNT_CODE = 'SPECIAL50'
export const MATURA_FINAL_DISCOUNT_PERCENT = 50
export const MATURA_FINAL_EXAM_DATE_ISO = '2026-05-20T08:30:00+03:00'
export const MATURA_FINAL_EXAM_DATE_LABEL = '20 май 2026'
export const MATURA_FINAL_DISCOUNT_DEADLINE_LABEL = '19 май 2026, 23:59'
export const MATURA_FINAL_CHECKOUT_PLAN = 'dzi-full' as const
export const MATURA_FINAL_CHECKOUT_REDIRECT =
  `/api/checkout/redirect?plan=dzi-full`

export const MATURA_FINAL_BLOCKERS = [
  { value: 'price', label: 'Цената ме спира' },
  { value: 'too_late', label: 'Струва ми се, че вече е късно за резултат' },
  { value: 'unclear_value', label: 'Не съм сигурен дали точно това ми трябва' },
  { value: 'no_plan', label: 'Нямам ясен план как да уча в тези 9 дни' },
  { value: 'other', label: 'Друго' },
] as const

export const MATURA_FINAL_HELP_NEEDS = [
  { value: 'day_plan', label: 'Ясен план ден по ден до матурата' },
  { value: 'practice_exams', label: 'Пробни матури и упражнения в реален формат' },
  { value: 'bel_focus', label: 'Най-важното по БЕЛ на едно място' },
  { value: 'essay_help', label: 'Помощ за интерпретативно съчинение / есе' },
  { value: 'quick_lessons', label: 'Кратки обяснения и видео уроци' },
] as const

export const MATURA_FINAL_START_TRIGGERS = [
  { value: 'bigger_discount', label: 'По-силна финална оферта' },
  { value: 'clear_path', label: 'Да знам точно откъде да започна още днес' },
  { value: 'confidence', label: 'Да видя, че платформата е направена за последните 9 дни' },
  { value: 'more_social_proof', label: 'Повече примери, че работи и за други ученици' },
  { value: 'teacher_guidance', label: 'Повече насока кое е най-важно точно сега' },
] as const

export type MaturaFinalBlocker = (typeof MATURA_FINAL_BLOCKERS)[number]['value']
export type MaturaFinalHelpNeed = (typeof MATURA_FINAL_HELP_NEEDS)[number]['value']
export type MaturaFinalStartTrigger = (typeof MATURA_FINAL_START_TRIGGERS)[number]['value']

export type MaturaFinalSurveyPayload = {
  email: string
  blocker: MaturaFinalBlocker
  helpNeed: MaturaFinalHelpNeed
  startTrigger: MaturaFinalStartTrigger
  freeText?: string
}

const BLOCKER_SET = new Set<string>(MATURA_FINAL_BLOCKERS.map((option) => option.value))
const HELP_NEED_SET = new Set<string>(MATURA_FINAL_HELP_NEEDS.map((option) => option.value))
const START_TRIGGER_SET = new Set<string>(
  MATURA_FINAL_START_TRIGGERS.map((option) => option.value)
)

export function isMaturaFinalBlocker(value: string): value is MaturaFinalBlocker {
  return BLOCKER_SET.has(value)
}

export function isMaturaFinalHelpNeed(value: string): value is MaturaFinalHelpNeed {
  return HELP_NEED_SET.has(value)
}

export function isMaturaFinalStartTrigger(value: string): value is MaturaFinalStartTrigger {
  return START_TRIGGER_SET.has(value)
}

export function buildMaturaFinalLoginHref() {
  return `/login?redirectTo=${encodeURIComponent(MATURA_FINAL_CHECKOUT_REDIRECT)}`
}
