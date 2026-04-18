// Lightweight activity log stored in localStorage so the Progress page can
// surface everything a student has recently done across the app (tests,
// literature exercises, video lessons watched, etc.).

export type ActivityType =
  | 'test'
  | 'literature_exercise'
  | 'video_lesson'
  | 'lesson'
  | 'material'

export interface ActivityEntry {
  id: string
  type: ActivityType
  title: string
  refId?: string
  meta?: string
  score?: number
  maxScore?: number
  href?: string
  at: string // ISO timestamp
}

const KEY = 'matura_activity_log'
const MAX_ENTRIES = 200

export function getActivityLog(): ActivityEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '[]') as ActivityEntry[]
  } catch {
    return []
  }
}

export function logActivity(entry: Omit<ActivityEntry, 'id' | 'at'> & { id?: string; at?: string }) {
  if (typeof window === 'undefined') return
  const all = getActivityLog()
  const next: ActivityEntry = {
    ...entry,
    id: entry.id ?? `${entry.type}-${entry.refId ?? entry.title}-${Date.now()}`,
    at: entry.at ?? new Date().toISOString(),
  }

  // De-duplicate: if the same type+refId was logged in the last 2 minutes,
  // replace the previous entry instead of stacking many near-identical rows.
  const TWO_MIN = 2 * 60 * 1000
  const nowMs = new Date(next.at).getTime()
  const dedupedIdx = all.findIndex(
    (e) =>
      e.type === next.type &&
      (e.refId ?? '') === (next.refId ?? '') &&
      Math.abs(new Date(e.at).getTime() - nowMs) < TWO_MIN,
  )
  if (dedupedIdx >= 0) {
    all.splice(dedupedIdx, 1)
  }

  all.push(next)
  // Keep newest first and cap total size.
  all.sort((a, b) => b.at.localeCompare(a.at))
  const trimmed = all.slice(0, MAX_ENTRIES)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch {
    // storage full or unavailable — ignore.
  }
}

export function clearActivityEntry(id: string) {
  if (typeof window === 'undefined') return
  const all = getActivityLog().filter((e) => e.id !== id)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  test: 'Тест',
  literature_exercise: 'Упражнение по литература',
  video_lesson: 'Видео урок',
  lesson: 'Урок',
  material: 'Материал',
}
