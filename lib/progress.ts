import { createClient } from '@/lib/supabase/client'
import { studentLessons, studentTests } from '@/data/student-content'
import { allTests } from '@/data/tests'
import { fetchPointProgress, type EnergyEventRecord } from '@/lib/mastery'

export type ExamCategory = 'nvo-primer' | 'nvo-oficial' | 'dzi-primer' | 'dzi-oficial'

export interface ExamResult {
  date: string
  score: number
  testName: string
  category: ExamCategory
}

function classifyExam(testName: string): ExamCategory | null {
  const name = testName.toLowerCase()
  const isNvo = name.includes('нво') || name.includes('nvo')
  const isDzi = name.includes('дзи') || name.includes('дзи') || name.includes('dzi') || name.includes('матура')
  const isPrimer = name.includes('примерен') || name.includes('primer') || name.includes('mock')
  if (!isNvo && !isDzi) return null
  if (isNvo) return isPrimer ? 'nvo-primer' : 'nvo-oficial'
  return isPrimer ? 'dzi-primer' : 'dzi-oficial'
}

export interface DziAttempt {
  id: string
  testId: string
  testName: string
  score: number
  attemptedAt: string
}

export interface DziProgressData {
  attempts: DziAttempt[]
  lastScore: number | null
  bestScore: number | null
  avgScore: number | null
  maxScore: number
  minPassScore: number
}

// Реалните прагове за ДЗИ (проценти от 100): максимум 100, успех (оценка 3) ≥ 30%
export const DZI_MAX_SCORE = 100
export const DZI_MIN_PASS_SCORE = 30

export async function fetchDziProgress(): Promise<DziProgressData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return emptyDziProgress()
  }

  const dziIds = new Set(allTests.filter((t) => t.examType === 'dzi12').map((t) => t.id))

  const { data } = await supabase
    .from('test_results')
    .select('id, test_id, test_name, score, completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: true })

  const rows = (data ?? []) as Array<{
    id: string
    test_id: string
    test_name: string
    score: number
    completed_at: string
  }>

  const attempts: DziAttempt[] = rows
    .filter((r) => dziIds.has(r.test_id))
    .map((r) => ({
      id: r.id,
      testId: r.test_id,
      testName: r.test_name,
      score: r.score,
      attemptedAt: r.completed_at,
    }))

  if (attempts.length === 0) {
    return emptyDziProgress()
  }

  const scores = attempts.map((a) => a.score)
  const lastScore = attempts[attempts.length - 1].score
  const bestScore = Math.max(...scores)
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)

  return {
    attempts,
    lastScore,
    bestScore,
    avgScore,
    maxScore: DZI_MAX_SCORE,
    minPassScore: DZI_MIN_PASS_SCORE,
  }
}

function emptyDziProgress(): DziProgressData {
  return {
    attempts: [],
    lastScore: null,
    bestScore: null,
    avgScore: null,
    maxScore: DZI_MAX_SCORE,
    minPassScore: DZI_MIN_PASS_SCORE,
  }
}

export async function saveDziAttempt(params: {
  testId: string
  testName: string
  score: number
  subject?: string
}): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('test_results').insert({
      user_id: user.id,
      test_id: params.testId,
      test_name: params.testName,
      score: Math.max(0, Math.min(100, Math.round(params.score))),
      subject: params.subject ?? '',
    })
  } catch (err) {
    console.error('Failed to save test attempt', err)
  }
}

export interface ProgressData {
  testsCompleted: number
  avgScore: number
  lessonsCompleted: number
  streakDays: number
  totalTests: number
  totalLessons: number
  weeklyActivity: number[]
  scoreHistory: { date: string; testName: string; score: number }[]
  recentActivity: { type: 'test' | 'lesson' | 'material'; title: string; date: string; score?: number }[]
  weakTopics: { name: string; subjectName: string; avgScore: number }[]
  strongTopics: { name: string; subjectName: string; avgScore: number }[]
  masteryPoints: number
  energyPoints: number
  attemptedSkills: number
  familiarSkills: number
  proficientSkills: number
  masteredSkills: number
  recentEnergyEvents: EnergyEventRecord[]
  examResults: ExamResult[]
}

export async function fetchProgressData(): Promise<ProgressData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return emptyProgress(await fetchPointProgress())

  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 6)

  // Fetch паралелно
  const [testResultsRes, lessonCompletionsRes, topicScoresRes, profileRes] = await Promise.all([
    supabase
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('topic_scores')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('profiles')
      .select('streak_days')
      .eq('id', user.id)
      .single(),
  ])

  const testResults = testResultsRes.data ?? []
  const lessonCompletions = lessonCompletionsRes.data ?? []
  const topicScores = topicScoresRes.data ?? []
  const streakDays = profileRes.data?.streak_days ?? 0

  // Средна оценка
  const avgScore = testResults.length > 0
    ? Math.round(testResults.reduce((s: number, r: { score: number }) => s + r.score, 0) / testResults.length)
    : 0

  // Активност по дни за тази седмица
  const weeklyActivity = Array(7).fill(0)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Понеделник
  startOfWeek.setHours(0, 0, 0, 0)

  for (const r of testResults) {
    const d = new Date(r.completed_at)
    const dayIdx = Math.floor((d.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24))
    if (dayIdx >= 0 && dayIdx < 7) weeklyActivity[dayIdx]++
  }
  for (const l of lessonCompletions) {
    const d = new Date(l.completed_at)
    const dayIdx = Math.floor((d.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24))
    if (dayIdx >= 0 && dayIdx < 7) weeklyActivity[dayIdx]++
  }

  // Score history — последните 10 теста
  const scoreHistory = testResults.slice(0, 10).map((r: { completed_at: string; test_name: string; score: number }) => ({
    date: new Date(r.completed_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' }),
    testName: r.test_name,
    score: r.score,
  }))

  // Exam results by category (НВО/ДЗИ × примерен/официален)
  const examResults: ExamResult[] = (testResults
    .map((r: { completed_at: string; test_name: string; score: number }) => {
      const category = classifyExam(r.test_name)
      if (!category) return null
      return {
        date: new Date(r.completed_at).toISOString().slice(0, 10),
        score: r.score,
        testName: r.test_name,
        category,
      }
    })
    .filter((x): x is ExamResult => x !== null)
    .sort((a, b) => a.date.localeCompare(b.date)))

  // Recent activity — последните 8 активности
  const allActivity = [
    ...testResults.map((r: { completed_at: string; test_name: string; score: number }) => ({
      type: 'test' as const,
      title: r.test_name,
      date: new Date(r.completed_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' }),
      score: r.score,
      ts: new Date(r.completed_at).getTime(),
    })),
    ...lessonCompletions.map((l: { completed_at: string; lesson_title: string }) => ({
      type: 'lesson' as const,
      title: l.lesson_title,
      date: new Date(l.completed_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' }),
      ts: new Date(l.completed_at).getTime(),
    })),
  ]
  allActivity.sort((a, b) => b.ts - a.ts)
  const recentActivity = allActivity.slice(0, 8).map(({ ts: _, ...rest }) => rest)

  // Слаби и силни теми от topic_scores
  const topicMap: Record<string, { name: string; subjectName: string; scores: number[] }> = {}
  for (const t of topicScores) {
    const key = `${t.topic_name}__${t.subject_name}`
    if (!topicMap[key]) topicMap[key] = { name: t.topic_name, subjectName: t.subject_name, scores: [] }
    topicMap[key].scores.push(t.score)
  }

  const topicsWithAvg = Object.values(topicMap).map(t => ({
    name: t.name,
    subjectName: t.subjectName,
    avgScore: Math.round(t.scores.reduce((a, b) => a + b, 0) / t.scores.length),
  }))

  const weakTopics = topicsWithAvg.filter(t => t.avgScore < 60).sort((a, b) => a.avgScore - b.avgScore).slice(0, 4)
  const strongTopics = topicsWithAvg.filter(t => t.avgScore >= 75).sort((a, b) => b.avgScore - a.avgScore).slice(0, 4)

  const pointProgress = await fetchPointProgress()

  return {
    testsCompleted: testResults.length,
    avgScore,
    lessonsCompleted: lessonCompletions.length,
    streakDays,
    totalTests: studentTests.length,
    totalLessons: studentLessons.length,
    weeklyActivity,
    scoreHistory,
    recentActivity,
    weakTopics,
    strongTopics,
    masteryPoints: pointProgress.masteryPoints,
    energyPoints: pointProgress.energyPoints,
    attemptedSkills: pointProgress.attemptedCount,
    familiarSkills: pointProgress.familiarCount,
    proficientSkills: pointProgress.proficientCount,
    masteredSkills: pointProgress.masteredCount,
    recentEnergyEvents: pointProgress.recentEnergyEvents,
    examResults,
  }
}

function emptyProgress(pointProgress?: Awaited<ReturnType<typeof fetchPointProgress>>): ProgressData {
  const points = pointProgress ?? {
    masteryPoints: 0,
    energyPoints: 0,
    attemptedCount: 0,
    familiarCount: 0,
    proficientCount: 0,
    masteredCount: 0,
    recentEnergyEvents: [],
  }

  return {
    testsCompleted: 0, avgScore: 0, lessonsCompleted: 0, streakDays: 0,
    totalTests: studentTests.length, totalLessons: studentLessons.length,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    scoreHistory: [], recentActivity: [], weakTopics: [], strongTopics: [],
    masteryPoints: points.masteryPoints,
    energyPoints: points.energyPoints,
    attemptedSkills: points.attemptedCount,
    familiarSkills: points.familiarCount,
    proficientSkills: points.proficientCount,
    masteredSkills: points.masteredCount,
    recentEnergyEvents: points.recentEnergyEvents,
    examResults: [],
  }
}
