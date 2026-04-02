import { createClient } from '@/lib/supabase/client'

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
}

export async function fetchProgressData(): Promise<ProgressData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return emptyProgress()
  }

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

  return {
    testsCompleted: testResults.length,
    avgScore,
    lessonsCompleted: lessonCompletions.length,
    streakDays,
    totalTests: 48,
    totalLessons: 32,
    weeklyActivity,
    scoreHistory,
    recentActivity,
    weakTopics,
    strongTopics,
  }
}

function emptyProgress(): ProgressData {
  return {
    testsCompleted: 0, avgScore: 0, lessonsCompleted: 0, streakDays: 0,
    totalTests: 48, totalLessons: 32,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    scoreHistory: [], recentActivity: [], weakTopics: [], strongTopics: [],
  }
}
