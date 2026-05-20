'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/dashboard/TopBar'
import {
  nvo30DayPlan,
  PLAN_END_ISO,
  PLAN_START_ISO,
  TOTAL_PLAN_TASKS,
  type PlanDay,
  type PlanTask,
  type PlanTaskType,
} from '@/data/nvo30DayPlan'
import { createClient } from '@/lib/supabase/client'
import { hasActivePremium, type SubscriptionAccessProfile } from '@/lib/subscription-access'

const TASK_TYPE_LABEL: Record<PlanTaskType, string> = {
  past_exam: 'Минала матура',
  beron_test: 'Тренировъчен тест',
  literature_work: 'Произведение',
  literature_exercise: 'Упражнение',
  math_subtopic: 'Математика',
  bel_rule: 'Правило БЕЛ',
  retell_model: 'Преразказ',
  review: 'Преглед',
  rest: 'Почивка',
}

const TASK_TYPE_COLOR: Record<PlanTaskType, string> = {
  past_exam: 'bg-[#1E2A4A] text-white',
  beron_test: 'bg-slate-700 text-white',
  literature_work: 'bg-amber-100 text-amber-900',
  literature_exercise: 'bg-orange-100 text-orange-900',
  math_subtopic: 'bg-emerald-100 text-emerald-900',
  bel_rule: 'bg-sky-100 text-sky-900',
  retell_model: 'bg-rose-100 text-rose-900',
  review: 'bg-slate-100 text-slate-700',
  rest: 'bg-gray-100 text-gray-500',
}

function todayIsoSofia(): string {
  // Europe/Sofia date string (handles DST). Falls back to UTC date if Intl missing.
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Sofia',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

function buildTaskHref(task: PlanTask): string | null {
  if (task.href) return task.href
  if (task.type === 'literature_exercise' && task.refId) {
    return `/dashboard/literature-exercise/${task.refId}`
  }
  if (task.type === 'literature_work' || task.type === 'math_subtopic' || task.type === 'bel_rule' || task.type === 'retell_model') {
    return '/dashboard/materials'
  }
  return null
}

function taskKey(day: number, taskIndex: number) {
  return `${day}:${taskIndex}`
}

type Progress = Set<string>

export default function PlanPage() {
  const today = todayIsoSofia()
  const todayDay = useMemo(() => nvo30DayPlan.find((d) => d.date === today) ?? null, [today])
  const isBeforePlan = today < PLAN_START_ISO
  const isAfterPlan = today > PLAN_END_ISO

  const initialActive = todayDay?.dayIndex ?? (isBeforePlan ? 1 : 29)
  const [activeDayIndex, setActiveDayIndex] = useState<number>(initialActive)

  const [progress, setProgress] = useState<Progress>(new Set())
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [hasPremium, setHasPremium] = useState(false)
  const [studentClass, setStudentClass] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  // Load profile + progress
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user || cancelled) {
        setProfileLoaded(true)
        setProgressLoaded(true)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_active, plan_expires_at, billing_plan_key, class')
        .eq('id', user.id)
        .maybeSingle<SubscriptionAccessProfile & { class?: string | null }>()

      if (cancelled) return

      setHasPremium(hasActivePremium(profile ?? null))
      setStudentClass(profile?.class ?? null)
      setProfileLoaded(true)

      const { data: rows } = await supabase
        .from('nvo_plan_progress')
        .select('day_index, task_index')
        .eq('user_id', user.id)

      if (cancelled) return

      const set = new Set<string>()
      ;(rows ?? []).forEach((r: { day_index: number; task_index: number }) => {
        set.add(taskKey(r.day_index, r.task_index))
      })
      setProgress(set)
      setProgressLoaded(true)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const toggleTask = useCallback(
    async (day: number, taskIndex: number) => {
      const key = taskKey(day, taskIndex)
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        window.location.href = '/login?redirectTo=/dashboard/plan'
        return
      }

      if (pending.has(key)) return
      setPending((prev) => {
        const next = new Set(prev)
        next.add(key)
        return next
      })

      const wasCompleted = progress.has(key)
      // optimistic
      setProgress((prev) => {
        const next = new Set(prev)
        if (wasCompleted) next.delete(key)
        else next.add(key)
        return next
      })

      if (wasCompleted) {
        await supabase
          .from('nvo_plan_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('day_index', day)
          .eq('task_index', taskIndex)
      } else {
        await supabase.from('nvo_plan_progress').upsert(
          {
            user_id: user.id,
            day_index: day,
            task_index: taskIndex,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,day_index,task_index' }
        )
      }

      setPending((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    },
    [progress, pending]
  )

  // Completed counts per day
  const completedByDay = useMemo(() => {
    const map = new Map<number, number>()
    progress.forEach((key) => {
      const [d] = key.split(':')
      const dn = Number(d)
      map.set(dn, (map.get(dn) ?? 0) + 1)
    })
    return map
  }, [progress])

  // Streak (consecutive days from day 1 with at least 1 completed task)
  const streak = useMemo(() => {
    let s = 0
    for (const day of nvo30DayPlan) {
      const c = completedByDay.get(day.dayIndex) ?? 0
      if (c > 0) s += 1
      else if (day.date <= today) break
      else break
    }
    return s
  }, [completedByDay, today])

  const totalCompleted = progress.size
  const overallPct = Math.round((totalCompleted / TOTAL_PLAN_TASKS) * 100)

  const activeDay = nvo30DayPlan.find((d) => d.dayIndex === activeDayIndex) ?? nvo30DayPlan[0]
  const activeIsToday = activeDay.date === today
  const activeIsPast = activeDay.date < today
  const isClassNot7 = profileLoaded && studentClass !== '7' && studentClass !== null

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Дневен план" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
            29 дни до НВО · 22 май → 19 юни
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A4A]">
            Дневен план за подготовка
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Един път на ден отваряш плана, изпълняваш задачите, маркираш ги завършени. Без
            размишления откъде да започнеш — всичко е подредено.
          </p>
        </div>

        {/* Class warning */}
        {isClassNot7 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4 text-sm text-amber-900">
            Този план е създаден за 7. клас. Ти си в друг клас, но можеш да го разгледаш свободно.
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatTile label="Общ прогрес" value={`${overallPct}%`} hint={`${totalCompleted} / ${TOTAL_PLAN_TASKS} задачи`} />
          <StatTile label="Подред" value={streak.toString()} hint="дни без пропуск" />
          <StatTile
            label="Днес"
            value={
              todayDay
                ? `${completedByDay.get(todayDay.dayIndex) ?? 0}/${todayDay.tasks.length}`
                : isBeforePlan
                ? 'Не е стартирал'
                : 'Завършил'
            }
            hint={todayDay ? `Ден ${todayDay.dayIndex}` : ''}
          />
          <StatTile
            label="До НВО БЕЛ"
            value={(() => {
              const t = new Date(today)
              const bel = new Date('2026-06-17')
              const diff = Math.ceil((bel.getTime() - t.getTime()) / 86400000)
              return diff > 0 ? `${diff} дни` : diff === 0 ? 'Днес!' : 'Минал'
            })()}
            hint="17 юни 2026"
          />
        </div>

        {/* Day strip */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3 mb-4 overflow-x-auto">
          <div className="flex gap-1.5 min-w-min">
            {nvo30DayPlan.map((day) => {
              const completed = completedByDay.get(day.dayIndex) ?? 0
              const total = day.tasks.length
              const allDone = completed >= total && total > 0
              const isToday = day.date === today
              const isActive = day.dayIndex === activeDayIndex
              return (
                <button
                  key={day.dayIndex}
                  type="button"
                  onClick={() => setActiveDayIndex(day.dayIndex)}
                  className={`flex-shrink-0 flex flex-col items-center min-w-[44px] px-2 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#1E2A4A] text-white border-[#1E2A4A]'
                      : isToday
                      ? 'bg-primary-50 text-primary-700 border-primary-300'
                      : day.isExamDay
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : allDone
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    {day.weekday}
                  </span>
                  <span className="text-base font-extrabold mt-0.5">{day.dayIndex}</span>
                  {day.isExamDay ? (
                    <span className="text-[9px] mt-0.5 leading-tight">изпит</span>
                  ) : (
                    <span className="text-[9px] mt-0.5 leading-tight tabular-nums opacity-80">
                      {completed}/{total}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active day card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4 border-b border-gray-100 pb-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Ден {activeDay.dayIndex} · {formatBgDate(activeDay.date)}
                {activeIsToday && (
                  <span className="ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-600 text-white">
                    ДНЕС
                  </span>
                )}
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E2A4A] mt-1">
                {activeDay.title}
              </h2>
              {activeDay.summary && (
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">{activeDay.summary}</p>
              )}
            </div>
            {activeDay.isExamDay && (
              <span className="flex-shrink-0 inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-rose-600 text-white">
                {activeDay.examLabel ?? 'Изпит'}
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {activeDay.tasks.map((task, idx) => {
              const key = taskKey(activeDay.dayIndex, idx)
              const isCompleted = progress.has(key)
              const isPending = pending.has(key)
              const href = buildTaskHref(task)
              const showLink = href && task.type !== 'rest'
              const requiresPremium =
                profileLoaded &&
                !hasPremium &&
                task.type !== 'rest' &&
                task.type !== 'review'

              return (
                <li
                  key={key}
                  className={`flex items-start gap-3 px-3 sm:px-4 py-3 rounded-xl border transition-colors ${
                    isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    aria-label={isCompleted ? 'Отбележи незавършена' : 'Отбележи завършена'}
                    onClick={() => toggleTask(activeDay.dayIndex, idx)}
                    disabled={isPending || !progressLoaded}
                    className={`flex-shrink-0 mt-0.5 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    } ${isPending ? 'opacity-50' : ''}`}
                  >
                    {isCompleted && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start flex-wrap gap-2">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${TASK_TYPE_COLOR[task.type]}`}
                      >
                        {TASK_TYPE_LABEL[task.type]}
                      </span>
                      {task.optional && (
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">по избор</span>
                      )}
                    </div>
                    <p className={`text-sm font-medium mt-1 ${isCompleted ? 'text-gray-500 line-through' : 'text-[#1E2A4A]'}`}>
                      {task.label}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {task.estimatedMin != null && task.estimatedMin > 0 && (
                        <span>{task.estimatedMin} мин</span>
                      )}
                      {showLink && (
                        requiresPremium ? (
                          <Link
                            href="/dashboard/subscription"
                            className="text-primary-600 hover:underline font-medium"
                          >
                            Отключи с план →
                          </Link>
                        ) : (
                          <Link
                            href={href!}
                            className="text-primary-600 hover:underline font-medium"
                          >
                            Отвори →
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Nav arrows */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setActiveDayIndex((d) => Math.max(1, d - 1))}
            disabled={activeDayIndex <= 1}
            className="text-sm text-gray-600 hover:text-[#1E2A4A] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Предишен ден
          </button>
          <button
            type="button"
            onClick={() => setActiveDayIndex((d) => Math.min(29, d + 1))}
            disabled={activeDayIndex >= 29}
            className="text-sm text-gray-600 hover:text-[#1E2A4A] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Следващ ден →
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Планът е препоръчителен — пропусни ден или върни се назад, ако ти трябва.
          {!hasPremium && profileLoaded && (
            <>
              {' '}За пълен достъп до материалите вземи{' '}
              <Link href="/#pricing" className="text-primary-600 hover:underline">
                НВО план
              </Link>
              .
            </>
          )}
        </p>
      </main>
    </div>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold text-[#1E2A4A] mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-gray-500 mt-0.5">{hint}</p>}
    </div>
  )
}

function formatBgDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември']
  return `${d} ${months[m - 1]}`
}
