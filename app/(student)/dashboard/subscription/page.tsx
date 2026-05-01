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

const PROFILE_SELECT =
  'plan, is_active, plan_expires_at, billing_status, billing_plan_key, cancel_at_period_end, cancel_at, current_period_end, stripe_customer_id, stripe_subscription_id, last_payment_status'

const PLAN_LABELS: Record<string, string> = {
  'nvo-full': 'НВО — до края на изпитите',
  'dzi-full': 'ДЗИ — до края на матурите',
}

function formatBgDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function SubscriptionPage() {
  const [state, setState] = useState<PlanState>({ status: 'loading' })
  const [isCancelling, setIsCancelling] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [hasRecentCheckout] = useState(() => {
    if (typeof window === 'undefined') return false
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

    // Опитваме extended select; ако миграцията не е приложена и част от
    // новите колони липсват, пада-ме обратно на legacy полетата.
    // Използваме maybeSingle() за да не приемаме „липсва ред" за грешка —
    // ще третираме такъв user като без активен абонамент.
    let readyProfile: SubscriptionAccessProfile | null = null
    const extended = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', user.id)
      .maybeSingle()

    if (!extended.error) {
      readyProfile = (extended.data as SubscriptionAccessProfile | null) ?? null
    } else {
      console.warn('[subscription] extended profile select failed', extended.error)
      const legacy = await supabase
        .from('profiles')
        .select('plan, is_active, plan_expires_at')
        .eq('id', user.id)
        .maybeSingle()

      if (legacy.error) {
        console.error('[subscription] legacy profile select failed', legacy.error)
        setState({ status: 'error' })
        return null
      }
      readyProfile = (legacy.data as SubscriptionAccessProfile | null) ?? null
    }

    setState({ status: 'ready', profile: readyProfile })
    return readyProfile
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadProfile])

  // Fire Meta Pixel Purchase event once after a successful checkout. We wait
  // until profile is loaded so we have planKey + value; fall back to plan-less
  // event after 6s if the webhook hasn't synced yet (still gives Meta a signal).
  useEffect(() => {
    if (!hasRecentCheckout) return
    if (typeof window === 'undefined') return
    const PLAN_VALUES: Record<string, number> = {
      'nvo-full': 30,
      'dzi-full': 19.99,
    }
    const STORAGE_KEY = 'mh_purchase_pixel_fired'
    let sessionId: string | null = null
    try {
      sessionId = new URLSearchParams(window.location.search).get('session_id')
    } catch {}
    const dedupeKey = sessionId || 'no-session'
    let alreadyFired = false
    try { alreadyFired = window.sessionStorage.getItem(STORAGE_KEY) === dedupeKey } catch {}
    if (alreadyFired) return

    const planKey = state.status === 'ready' ? state.profile?.billing_plan_key ?? null : null
    if (!planKey && state.status === 'loading') return // wait for profile
    const value = (planKey && PLAN_VALUES[planKey]) || 0
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
    if (typeof fbq === 'function') {
      try {
        fbq('track', 'Purchase', {
          value,
          currency: 'EUR',
          content_name: planKey || 'unknown-plan',
          content_category: planKey?.startsWith('nvo') ? 'НВО' : planKey?.startsWith('dzi') ? 'ДЗИ' : undefined,
        })
        try { window.sessionStorage.setItem(STORAGE_KEY, dedupeKey) } catch {}
      } catch {}
    }
  }, [hasRecentCheckout, state])

  const readyProfile = state.status === 'ready' ? state.profile : null
  const subscriptionStatus = getSubscriptionStatus(readyProfile)
  const isActivePremium = hasActivePremium(readyProfile)
  const periodEnd = readyProfile?.current_period_end ?? readyProfile?.plan_expires_at ?? null
  const cancelAt = readyProfile?.cancel_at ?? null
  const formattedPeriodEnd = formatBgDate(periodEnd)
  const formattedCancelAt = formatBgDate(cancelAt)
  const isCheckoutSyncing = hasRecentCheckout && !isActivePremium
  const hasRecurringSubscription =
    !!readyProfile?.stripe_subscription_id &&
    (readyProfile?.billing_status === 'active' ||
      readyProfile?.billing_status === 'trialing' ||
      readyProfile?.billing_status === 'past_due')

  useEffect(() => {
    if (!isCheckoutSyncing) return
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
        if (attempts >= 8) window.clearInterval(intervalId)
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
        description:
          'Премиум достъпът е активиран успешно и вече можеш да влизаш във всички premium секции.',
      }
    }
    return {
      className: 'card p-5 border-primary/20 bg-primary-light/20',
      title: 'Обработваме плащането',
      description:
        'Stripe потвърди checkout-а. Изчакваме системата да активира premium достъпа ти.',
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
    canceling: {
      eyebrow: 'Премиум',
      title: 'Абонаментът ще бъде прекратен',
      description: formattedCancelAt
        ? `Имаш пълен достъп до ${formattedCancelAt}. След тази дата абонаментът ще спре.`
        : 'Имаш пълен достъп до края на текущия период. След това абонаментът ще спре.',
      badgeClassName: 'badge-amber px-3 py-1',
      badgeLabel: 'Активен (ще спре)',
      containerClassName: 'card p-5 border-amber/30 bg-amber-light/25',
    },
    past_due: {
      eyebrow: 'Премиум',
      title: 'Плащането не премина',
      description:
        'Последното плащане не е успешно. Достъпът ти остава до края на вече платения период. Моля, обнови метода за плащане.',
      badgeClassName: 'badge-amber px-3 py-1',
      badgeLabel: 'Проблем с плащане',
      containerClassName: 'card p-5 border-amber/30 bg-amber-light/25',
    },
    expired: {
      eyebrow: 'Премиум',
      title: 'Абонаментът ти е изтекъл',
      description:
        'Влезе успешно в акаунта си, но premium достъпът е спрян, докато не подновиш плана.',
      badgeClassName: 'badge-amber px-3 py-1',
      badgeLabel: 'Изтекъл',
      containerClassName: 'card p-5 border-amber/30 bg-amber-light/25',
    },
    inactive: {
      eyebrow: 'Без активен план',
      title: 'Нямаш активен абонамент',
      description:
        'Можеш да управляваш профила си, но платеното съдържание остава заключено, докато не избереш план.',
      badgeClassName: 'badge px-3 py-1 bg-slate-100 text-text-muted',
      badgeLabel: 'Неактивен',
      containerClassName: 'card p-5 border-slate-200 bg-slate-50/80',
    },
  }[subscriptionStatus]

  const statusLabel = {
    active: 'Активен',
    canceling: 'Активен до края на периода',
    past_due: 'Проблем с плащане',
    expired: 'Изтекъл',
    inactive: 'Без активен план',
  }[subscriptionStatus]

  const planLabel =
    (readyProfile?.billing_plan_key && PLAN_LABELS[readyProfile.billing_plan_key]) ??
    (readyProfile?.plan === 'premium' ? 'Премиум' : 'Безплатен')

  async function handleCancel() {
    if (!confirm('Сигурен ли си, че искаш да прекратиш абонамента? Достъпът ще остане до края на текущия период.')) {
      return
    }
    setIsCancelling(true)
    setActionError(null)
    setActionNotice(null)
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
        throw new Error(payload.message ?? payload.error ?? 'Грешка при прекратяване.')
      }
      setActionNotice('Абонаментът ще спре в края на текущия период.')
      await loadProfile()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Грешка при прекратяване.')
    } finally {
      setIsCancelling(false)
    }
  }

  async function handleResume() {
    setIsResuming(true)
    setActionError(null)
    setActionNotice(null)
    try {
      const res = await fetch('/api/stripe/resume', { method: 'POST' })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
        throw new Error(payload.message ?? payload.error ?? 'Грешка при възстановяване.')
      }
      setActionNotice('Абонаментът е възстановен.')
      await loadProfile()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Грешка при възстановяване.')
    } finally {
      setIsResuming(false)
    }
  }

  async function handlePortal() {
    setIsOpeningPortal(true)
    setActionError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
        throw new Error(payload.message ?? payload.error ?? 'Грешка при отварянето.')
      }
      const payload = (await res.json()) as { url?: string }
      if (payload.url) {
        window.location.href = payload.url
        return
      }
      throw new Error('Липсва URL от Stripe.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Грешка при отварянето.')
    } finally {
      setIsOpeningPortal(false)
    }
  }

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

        {actionNotice && (
          <div className="card p-4 border-success/30 bg-success-light/20">
            <p className="text-sm text-text">{actionNotice}</p>
          </div>
        )}

        {actionError && (
          <div className="card p-4 border-error/30 bg-error-light/20">
            <p className="text-sm text-text">{actionError}</p>
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
                  <p className="text-sm text-text-muted mt-0.5">{summaryConfig.description}</p>
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
                  <span className="text-text-muted">
                    {subscriptionStatus === 'canceling' ? 'Прекратява се на' : 'Валиден до'}
                  </span>
                  <span className="font-medium text-text text-right">
                    {formattedCancelAt ?? formattedPeriodEnd ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            {isActivePremium && hasRecurringSubscription && (
              <div className="card p-5 space-y-3">
                <h2 className="font-semibold text-text text-sm">Управление</h2>
                <p className="text-sm text-text-muted">
                  Можеш да управляваш начина си на плащане, фактурите и абонамента през Stripe. Ако
                  прекратиш, достъпът остава до края на вече платения период.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePortal}
                    disabled={isOpeningPortal}
                    className="btn-secondary"
                  >
                    {isOpeningPortal ? 'Отваряне…' : 'Управление на плащането'}
                  </button>
                  {readyProfile?.cancel_at_period_end ? (
                    <button
                      type="button"
                      onClick={handleResume}
                      disabled={isResuming}
                      className="btn-primary"
                    >
                      {isResuming ? 'Възстановяване…' : 'Възстанови абонамента'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="btn-secondary text-error border-error/30"
                    >
                      {isCancelling ? 'Прекратяване…' : 'Прекрати абонамента'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isActivePremium && (
              <div className="card p-5">
                <h2 className="font-semibold text-text mb-2 text-sm">Поднови достъпа</h2>
                <p className="text-sm text-text-muted">
                  Избери план, за да отключиш отново всички premium материали, тестове и пълния достъп
                  в платформата.
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
                <a
                  href={`mailto:${LEGAL_SUPPORT_EMAIL}`}
                  className="text-primary font-semibold hover:underline"
                >
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
