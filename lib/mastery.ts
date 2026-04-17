'use client'

import { createClient } from '@/lib/supabase/client'

export type MasteryLevel = 'attempted' | 'familiar' | 'proficient' | 'mastered'

export interface SkillMasteryRecord {
  skillId: string
  skillName: string
  subjectId: string
  subjectName: string
  level: MasteryLevel
  points: number
  lastScore: number
  updatedAt: string
}

export interface EnergyEventRecord {
  id: string
  sourceId: string
  sourceType: 'test'
  points: number
  reason: string
  createdAt: string
}

export interface TestProgressInput {
  testId: string
  testName: string
  skillId: string
  skillName: string
  subjectId: string
  subjectName: string
  scorePercent: number
  answeredCount: number
  correctCount: number
}

export interface ProgressPointSummary {
  masteryPoints: number
  energyPoints: number
  attemptedCount: number
  familiarCount: number
  proficientCount: number
  masteredCount: number
  recentEnergyEvents: EnergyEventRecord[]
}

const LOCAL_MASTERY_KEY = 'izpiti-pro:skill-mastery:v1'
const LOCAL_ENERGY_KEY = 'izpiti-pro:energy-events:v1'

export const MASTERY_POINTS: Record<MasteryLevel, number> = {
  attempted: 0,
  familiar: 50,
  proficient: 80,
  mastered: 100,
}

export function getMasteryLevel(scorePercent: number): MasteryLevel {
  if (scorePercent >= 90) return 'mastered'
  if (scorePercent >= 75) return 'proficient'
  if (scorePercent >= 50) return 'familiar'
  return 'attempted'
}

export function getMasteryLabel(level: MasteryLevel): string {
  const labels: Record<MasteryLevel, string> = {
    attempted: 'Опитано',
    familiar: 'Познато',
    proficient: 'Стабилно',
    mastered: 'Овладяно',
  }
  return labels[level]
}

export function calculateEnergyPoints(input: Pick<TestProgressInput, 'answeredCount' | 'correctCount'>): number {
  return input.answeredCount * 10 + input.correctCount * 25 + 50
}

export function readLocalMastery(): SkillMasteryRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_MASTERY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function readLocalEnergyEvents(): EnergyEventRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_ENERGY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function summarizePointProgress(
  masteryRecords: SkillMasteryRecord[],
  energyEvents: EnergyEventRecord[],
): ProgressPointSummary {
  return {
    masteryPoints: masteryRecords.reduce((sum, item) => sum + item.points, 0),
    energyPoints: energyEvents.reduce((sum, item) => sum + item.points, 0),
    attemptedCount: masteryRecords.filter((item) => item.level === 'attempted').length,
    familiarCount: masteryRecords.filter((item) => item.level === 'familiar').length,
    proficientCount: masteryRecords.filter((item) => item.level === 'proficient').length,
    masteredCount: masteryRecords.filter((item) => item.level === 'mastered').length,
    recentEnergyEvents: energyEvents
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  }
}

export async function fetchPointProgress(): Promise<ProgressPointSummary> {
  const localSummary = summarizePointProgress(readLocalMastery(), readLocalEnergyEvents())

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return localSummary

    const [masteryRes, energyRes] = await Promise.all([
      supabase
        .from('skill_mastery')
        .select('skill_id, skill_name, subject_id, subject_name, level, points, last_score, updated_at')
        .eq('user_id', user.id),
      supabase
        .from('energy_events')
        .select('id, source_id, source_type, points, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    if (masteryRes.error || energyRes.error) return localSummary

    const masteryRecords: SkillMasteryRecord[] = (masteryRes.data ?? []).map((item) => ({
      skillId: item.skill_id,
      skillName: item.skill_name,
      subjectId: item.subject_id,
      subjectName: item.subject_name,
      level: item.level as MasteryLevel,
      points: item.points,
      lastScore: item.last_score,
      updatedAt: item.updated_at,
    }))

    const energyEvents: EnergyEventRecord[] = (energyRes.data ?? []).map((item) => ({
      id: item.id,
      sourceId: item.source_id,
      sourceType: item.source_type as 'test',
      points: item.points,
      reason: item.reason,
      createdAt: item.created_at,
    }))

    return summarizePointProgress(masteryRecords, energyEvents)
  } catch {
    return localSummary
  }
}

export async function recordTestProgress(input: TestProgressInput): Promise<void> {
  const now = new Date().toISOString()
  const level = getMasteryLevel(input.scorePercent)
  const points = MASTERY_POINTS[level]
  const energyPoints = calculateEnergyPoints(input)
  const localEnergyEvent: EnergyEventRecord = {
    id: `${input.testId}-${Date.now()}`,
    sourceId: input.testId,
    sourceType: 'test',
    points: energyPoints,
    reason: `Тест: ${input.testName}`,
    createdAt: now,
  }

  writeLocalProgress({
    skillId: input.skillId,
    skillName: input.skillName,
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    level,
    points,
    lastScore: input.scorePercent,
    updatedAt: now,
  }, localEnergyEvent)

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await Promise.all([
      supabase.from('skill_mastery').upsert({
        user_id: user.id,
        skill_id: input.skillId,
        skill_name: input.skillName,
        subject_id: input.subjectId,
        subject_name: input.subjectName,
        level,
        points,
        last_score: input.scorePercent,
        updated_at: now,
      }, { onConflict: 'user_id,skill_id' }),
      supabase.from('energy_events').insert({
        user_id: user.id,
        source_id: input.testId,
        source_type: 'test',
        points: energyPoints,
        reason: `Тест: ${input.testName}`,
      }),
    ])
  } catch {
    // Local progress is already recorded, so localhost preview keeps working.
  }
}

function writeLocalProgress(masteryRecord: SkillMasteryRecord, energyEvent: EnergyEventRecord) {
  if (typeof window === 'undefined') return

  const mastery = readLocalMastery()
  const existingIndex = mastery.findIndex((item) => item.skillId === masteryRecord.skillId)
  if (existingIndex >= 0) {
    mastery[existingIndex] = masteryRecord
  } else {
    mastery.push(masteryRecord)
  }

  const energyEvents = readLocalEnergyEvents()
  energyEvents.push(energyEvent)

  window.localStorage.setItem(LOCAL_MASTERY_KEY, JSON.stringify(mastery))
  window.localStorage.setItem(LOCAL_ENERGY_KEY, JSON.stringify(energyEvents))
}
