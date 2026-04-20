'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { createClient } from '@/lib/supabase/client'

type PlanState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; plan: string | null; planExpiresAt: string | null }

function formatBgDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function SubscriptionPage() {
  const [state, setState] = useState<PlanState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        if (!cancelled) setState({ status: 'error' })
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan, plan_expires_at')
        .eq('id', user.id)
        .single()

      if (cancelled) return
      if (error) {
        setState({ status: 'error' })
        return
      }
      setState({
        status: 'ready',
        plan: profile?.plan ?? null,
        planExpiresAt: profile?.plan_expires_at ?? null,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Абонамент" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {state.status === 'loading' && (
          <div className="card p-5">
            <p className="text-sm text-text-muted">Зареждане...</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="card p-5">
            <p className="text-sm text-text-muted">
              Не успяхме да заредим информацията за абонамента. Опитай отново по-късно.
            </p>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <div className="card p-5 border-success/30 bg-success-light/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs font-bold text-amber uppercase tracking-wider">Премиум</span>
                  </div>
                  <p className="font-bold text-text text-lg font-serif">Активен абонамент</p>
                  <p className="text-sm text-text-muted mt-0.5">
                    Пълен достъп до всички материали и тестове.
                  </p>
                </div>
                <span className="badge badge-success px-3 py-1">Активен</span>
              </div>
            </div>

            {state.planExpiresAt && (
              <div className="card p-5">
                <h2 className="font-semibold text-text mb-4 text-sm">Информация за абонамента</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Валиден до</span>
                    <span className="font-medium text-text">
                      {formatBgDate(state.planExpiresAt) ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="card p-5">
              <h2 className="font-semibold text-text mb-2 text-sm">Въпроси за абонамента?</h2>
              <p className="text-sm text-text-muted">
                Пиши ни на{' '}
                <a href="mailto:support@maturahelp.bg" className="text-primary font-semibold hover:underline">
                  support@maturahelp.bg
                </a>{' '}
                и ще ти помогнем.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
