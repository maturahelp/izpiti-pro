export type MarketingExamTab = 'nvo4' | 'nvo7' | 'dzi12'

export const DEFAULT_MARKETING_EXAM_TAB: MarketingExamTab = 'nvo7'

export function resolveMarketingExamTab(
  value: string | null | undefined,
  fallback: MarketingExamTab | null = DEFAULT_MARKETING_EXAM_TAB
): MarketingExamTab | null {
  const normalized = (value ?? '').trim().toLowerCase()

  if (normalized === '4' || normalized === 'nvo4') return 'nvo4'
  if (normalized === '7' || normalized === 'nvo7') return 'nvo7'
  if (normalized === '12' || normalized === 'dzi12' || normalized === 'dzi') return 'dzi12'

  return fallback
}

export function getMarketingExamTabFromBrowser(
  fallback: MarketingExamTab = DEFAULT_MARKETING_EXAM_TAB
): MarketingExamTab {
  if (typeof window === 'undefined') return fallback

  try {
    const params = new URLSearchParams(window.location.search)
    const queryCandidates = [params.get('grade'), params.get('class'), params.get('exam')]
    for (const candidate of queryCandidates) {
      const fromQuery = resolveMarketingExamTab(candidate, null)
      if (fromQuery) return fromQuery
    }
  } catch {
    // Keep the deterministic DZI default when browser APIs are unavailable.
  }

  try {
    const storageCandidates = [
      window.localStorage.getItem('grade'),
      window.localStorage.getItem('pendingVerifyClass'),
    ]
    for (const candidate of storageCandidates) {
      const fromStorage = resolveMarketingExamTab(candidate, null)
      if (fromStorage) return fromStorage
    }
  } catch {
    // Keep the deterministic DZI default when localStorage is unavailable.
  }

  return fallback
}
