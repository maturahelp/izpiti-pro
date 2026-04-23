'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { LEGAL_SUPPORT_EMAIL } from '@/lib/legal-consent'
import {
  getSubscriptionStatus,
  hasActivePremium,
  type SubscriptionAccessProfile,
} from '@/lib/subscription-access'
import { createClient } from '@/lib/supabase/client'

type PlanState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; profile: SubscriptionAccessProfile | null }

function formatBgDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function SubscriptionPage() {
  const [state, setState] = useState<PlanState>({ status: 'loading' })
  const [hasRecentCheckout] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return new URLSearchParams(window.location.search).get('checkout') === 'success'
  })

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setState({ status: 'error' })
      return null
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan, is_active, plan_expires_at')
      .eq('id', user.id)
      .single()

    if (error) {
      setState({ status: 'error' })
      return null
    }

    const readyProfile = profile ?? null
    setState({ status: 'ready', profile: readyProfile })
    return readyProfile
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadProfile])

  const readyProfile = state.status === 'ready' ? state.profile : null
  const subscriptionStatus = getSubscriptionStatus(readyProfile)
  const isActivePremium = hasActivePremium(readyProfile)
  const planExpiresAt = readyProfile?.plan_expires_at ?? null
  const formattedExpiryDate = formatBgDate(planExpiresAt)
  const isCheckoutSyncing = hasRecentCheckout && !isActivePremium

  useEffect(() => {
    if (!isCheckoutSyncing) {
      return
    }

    let isCancelled = false
    let attempts = 0

    const intervalId = window.setInterval(() => {
      attempts += 1

      void loadProfile().then((profile) => {
        if (isCancelled) return

        if (hasActivePremium(profile)) {
          window.clearInterval(intervalId)
          return
        }

        if (attempts >= 8) {
          window.clearInterval(intervalId)
        }
      })
    }, 2000)

    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [isCheckoutSyncing, loadProfile])

  const checkoutNotice = useMemo(() => {
    if (!hasRecentCheckout) return null

    if (isActivePremium) {
      return {
        className: 'card p-5 border-success/30 bg-success-light/20',
        title: 'Плащането е потвърдено',
        description: 'Премиум достъпът е активиран успешно и вече можеш да влизаш във всички premium секции.',
      }
    }

    return {
      className: 'card p-5 border-primary/20 bg-primary-light/20',
      title: 'Обработваме плащането',
      description: 'Stripe потвърди checkout-а. Изчакваме системата да активира premium достъпа ти.',
    }
  }, [hasRecentCheckout, isActivePremium])

  const summaryConfig = {
    active: {
      eyebrow: 'Премиум',
      title: 'Активен абонамент',
      description: 'Пълен достъп до всички материали, тестове и инструменти за подготовка.',
      badgeClassName: 'badge-success px-3 py-1',
      badgeLabel: 'Активен',
      containerClassName: 'card p-5 border-success/30 bg-success-light/20',
    },
    expired: {
      eyebrow: 'Премиум',
      title: 'Абонаментът ти е изтекъл',
      description: 'Влезе успешно в акаунта си, но premium достъпът е спрян, докато не подновиш плана.',
      badgeClassName: 'badge-amber px-3 py-1',
      badgeLabel: 'Изтекъл',
      containerClassName: 'card p-5 border-amber/30 bg-amber-light/25',
    },
    inactive: {
      eyebrow: 'Без активен план',
      title: 'Нямаш активен абонамент',
      description: 'Можеш да управляваш профила си, но платеното съдържание остава заключено, докато не избереш план.',
      badgeClassName: 'badge px-3 py-1 bg-slate-100 text-text-muted',
      badgeLabel: 'Неактивен',
      containerClassName: 'card p-5 border-slate-200 bg-slate-50/80',
    },
  }[subscriptionStatus]

  const statusLabel =
    subscriptionStatus === 'active'
      ? 'Активен'
      : subscriptionStatus === 'expired'
      ? 'Изтекъл'
      : 'Без активен план'

  const planLabel = readyProfile?.plan === 'premium' ? 'Премиум' : 'Безплатен'

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Абонамент" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {checkoutNotice && (
          <div className={checkoutNotice.className}>
            <h2 className="font-semibold text-text mb-1 text-sm">{checkoutNotice.title}</h2>
            <p className="text-sm text-text-muted">{checkoutNotice.description}</p>
          </div>
        )}

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
            <div className={summaryConfig.containerClassName}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs font-bold text-amber uppercase tracking-wider">
                      {summaryConfig.eyebrow}
                    </span>
                  </div>
                  <p className="font-bold text-text text-lg font-serif">{summaryConfig.title}</p>
                  <p className="text-sm text-text-muted mt-0.5">
                    {summaryConfig.description}
                  </p>
                </div>
                <span className={summaryConfig.badgeClassName}>{summaryConfig.badgeLabel}</span>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4 text-sm">Информация за абонамента</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">План</span>
                  <span className="font-medium text-text text-right">{planLabel}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Статус</span>
                  <span className="font-medium text-text text-right">{statusLabel}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Валиден до</span>
                  <span className="font-medium text-text text-right">{formattedExpiryDate ?? '—'}</span>
                </div>
              </div>
            </div>

            {!isActivePremium && (
              <div className="card p-5">
                <h2 className="font-semibold text-text mb-2 text-sm">Поднови достъпа</h2>
                <p className="text-sm text-text-muted">
                  Избери план, за да отключиш отново всички premium материали, тестове и пълния достъп в платформата.
                </p>
                <Link href="/#pricing" className="btn-primary mt-4">
                  Избери план
                </Link>
              </div>
            )}

            <div className="card p-5">
              <h2 className="font-semibold text-text mb-2 text-sm">Въпроси за абонамента?</h2>
              <p className="text-sm text-text-muted">
                Пиши ни на{' '}
                <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary font-semibold hover:underline">
                  {LEGAL_SUPPORT_EMAIL}
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
