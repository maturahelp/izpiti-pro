'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { hasActivePremium, type SubscriptionAccessProfile } from '@/lib/subscription-access'
import {
  MATURA_FINAL_BLOCKERS,
  MATURA_FINAL_HELP_NEEDS,
  MATURA_FINAL_START_TRIGGERS,
  MATURA_FINAL_CHECKOUT_PLAN,
  MATURA_FINAL_DISCOUNT_PERCENT,
  MATURA_FINAL_EXAM_DATE_ISO,
  buildMaturaFinalLoginHref,
  type MaturaFinalBlocker,
  type MaturaFinalHelpNeed,
  type MaturaFinalStartTrigger,
} from '@/lib/campaigns/matura-final-survey'

type SurveyResponse = {
  ok: true
  discountCode: string
  loginHref: string
  checkoutRedirect: string
  matchedAuthenticatedUser: boolean
}

type AuthState =
  | { status: 'loading' }
  | {
      status: 'ready'
      isAuthenticated: boolean
      email: string | null
      hasPremium: boolean
      selectedClass: string | null
    }

type ChoiceButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function daysUntilExam() {
  const now = new Date()
  const exam = new Date(MATURA_FINAL_EXAM_DATE_ISO)
  const diffMs = exam.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function normalizeEmailValue(value: string | null | undefined) {
  return (value ?? '').trim().replaceAll(' ', '+').toLowerCase()
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textArea)
  }
  return Promise.resolve()
}

async function startCheckoutWithDziPlan(loginHref: string) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: MATURA_FINAL_CHECKOUT_PLAN,
    }),
  })

  if (response.status === 401) {
    window.location.href = loginHref
    return
  }

  const payload = (await response.json().catch(() => ({}))) as {
    url?: string
    error?: string
    message?: string
  }

  if (payload.url) {
    window.location.href = payload.url
    return
  }

  throw new Error(payload.message ?? payload.error ?? 'Не успяхме да отворим checkout-а.')
}

function ChoiceButton({ active, label, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[22px] border px-4 py-4 text-left text-[14px] leading-relaxed transition ${
        active
          ? 'border-primary bg-white text-text shadow-[0_16px_34px_rgba(37,99,235,0.16)] ring-2 ring-primary/12'
          : 'border-[#CDDCEE] bg-white text-text shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:border-[#AFC7EA] hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]'
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border transition ${
            active ? 'border-primary bg-primary shadow-[inset_0_0_0_4px_white]' : 'border-[#B8CAE3] bg-[#F8FBFF]'
          }`}
        />
        <span className={active ? 'font-semibold text-text' : 'text-text'}>{label}</span>
      </span>
    </button>
  )
}

export function MaturaFinalSurveyPage() {
  const searchParams = useSearchParams()
  const searchEmail = normalizeEmailValue(searchParams.get('email'))
  const promoStatus = searchParams.get('promo')

  const [hasStarted, setHasStarted] = useState(false)
  const [email, setEmail] = useState(searchEmail)
  const [blocker, setBlocker] = useState<MaturaFinalBlocker | null>(null)
  const [helpNeed, setHelpNeed] = useState<MaturaFinalHelpNeed | null>(null)
  const [startTrigger, setStartTrigger] = useState<MaturaFinalStartTrigger | null>(null)
  const [freeText, setFreeText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' })

  const remainingDays = useMemo(() => daysUntilExam(), [])
  const normalizedEmail = normalizeEmailValue(email)
  const hasPrefilledEmailFromLink = Boolean(searchEmail)

  useEffect(() => {
    if (!searchEmail) return
    setEmail((current) => current || searchEmail)
    setHasStarted(true)
  }, [searchEmail])

  useEffect(() => {
    if (promoStatus !== 'unavailable') return
    setHasStarted(true)
    setError('Отстъпката не е активна в момента. Опитай пак след малко.')
  }, [promoStatus])

  useEffect(() => {
    let cancelled = false

    async function loadAuthState() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (cancelled) return

        if (!user?.id) {
          setAuthState({
            status: 'ready',
            isAuthenticated: false,
            email: null,
            hasPremium: false,
            selectedClass: null,
          })
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('class, plan, is_active, plan_expires_at')
          .eq('id', user.id)
          .maybeSingle<SubscriptionAccessProfile & { class: string | null }>()

        if (cancelled) return

        setEmail((current) => current || normalizeEmailValue(user.email))
        setAuthState({
          status: 'ready',
          isAuthenticated: true,
          email: normalizeEmailValue(user.email),
          hasPremium: hasActivePremium(profile),
          selectedClass: profile?.class ?? null,
        })
      } catch {
        if (cancelled) return
        setAuthState({
          status: 'ready',
          isAuthenticated: false,
          email: null,
          hasPremium: false,
          selectedClass: null,
        })
      }
    }

    void loadAuthState()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!normalizedEmail) {
      setError('Въведи имейла, с който си се регистрирал.')
      return
    }

    if (!blocker || !helpNeed || !startTrigger) {
      setError('Избери по един отговор на всеки въпрос.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/surveys/matura-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          blocker,
          helpNeed,
          startTrigger,
          freeText: freeText.trim(),
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as
        | SurveyResponse
        | { error?: string }

      if (!response.ok || !('ok' in payload)) {
        throw new Error('Не успяхме да запишем анкетата. Опитай отново след малко.')
      }

      if (authState.status === 'ready' && authState.hasPremium) {
        window.location.href = '/dashboard/subscription'
        return
      }

      if (authState.status === 'ready' && authState.isAuthenticated) {
        await startCheckoutWithDziPlan(payload.loginHref)
        return
      }

      window.location.href = payload.loginHref
      return
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не успяхме да запишем анкетата. Опитай отново след малко.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const audienceNote =
    authState.status === 'ready' && authState.hasPremium
      ? 'Този профил вече има активен premium достъп. Можеш да попълниш анкетата, но офертата не ти е нужна.'
      : authState.status === 'ready' && authState.selectedClass === '7'
        ? 'В момента си логнат с профил за 7. клас. Тази страница е насочена към 12. клас и ДЗИ.'
        : hasPrefilledEmailFromLink
          ? 'Попълнихме имейла автоматично от линка. Можеш да го коригираш, ако е нужно.'
          : authState.status === 'ready' && authState.email && authState.email === normalizedEmail
            ? `Разпознахме те като влязъл потребител (${authState.email}).`
            : 'Анкетата работи и без login. Ако искаш, можеш да коригираш имейла ръчно.'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(125,169,255,0.28),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_26%),linear-gradient(180deg,_#F6F9FE_0%,_#EAF1FB_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-orb ambient-orb-three" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {hasStarted ? (
          <section className="card-enter w-full max-w-2xl rounded-[34px] border border-white/75 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setHasStarted(false)}
                className="inline-flex items-center gap-2 rounded-full border border-[#D8E6F8] bg-white px-3.5 py-2 text-[12px] font-semibold text-text-muted transition hover:border-[#B9D0EE] hover:text-text"
              >
                <span aria-hidden="true">←</span>
                Назад
              </button>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E6F8] bg-[#F8FBFF] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">
                <span className="inline-block h-2 w-2 rounded-full bg-[#F97316]" />
                {remainingDays > 0 ? `${remainingDays} дни до ДЗИ` : 'Матурата е съвсем близо'}
              </div>
            </div>

            <div className="mt-5">
              <h2 className="max-w-xl text-[2rem] font-black leading-[1.04] tracking-[-0.06em] text-text sm:text-[2.45rem]">
                4 въпроса до {MATURA_FINAL_DISCOUNT_PERCENT}% отстъпка.
              </h2>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#E0E8F4] bg-[#F8FBFF] px-4 py-4 text-[13px] leading-relaxed text-text-muted">
              {audienceNote}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-text">
                  Имейлът, с който си се регистрирал
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ime@example.com"
                  className="w-full rounded-[22px] border border-[#DCE6F4] bg-white px-4 py-3.5 text-[14px] text-text outline-none transition placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <fieldset className="mt-6">
                <div className="rounded-[26px] border border-[#DBE6F3] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(246,250,255,0.94)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-5">
                  <p className="mb-3 text-[14px] font-semibold text-text">
                    1. Какво най-много те спира да активираш достъп точно сега?
                  </p>
                  <div className="grid gap-2.5">
                    {MATURA_FINAL_BLOCKERS.map((option) => (
                      <ChoiceButton
                        key={option.value}
                        active={blocker === option.value}
                        label={option.label}
                        onClick={() => setBlocker(option.value)}
                      />
                    ))}
                  </div>
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <div className="rounded-[26px] border border-[#DBE6F3] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(246,250,255,0.94)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-5">
                  <p className="mb-3 text-[14px] font-semibold text-text">
                    2. От какво имаш най-голяма нужда в последните дни преди ДЗИ?
                  </p>
                  <div className="grid gap-2.5">
                    {MATURA_FINAL_HELP_NEEDS.map((option) => (
                      <ChoiceButton
                        key={option.value}
                        active={helpNeed === option.value}
                        label={option.label}
                        onClick={() => setHelpNeed(option.value)}
                      />
                    ))}
                  </div>
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <div className="rounded-[26px] border border-[#DBE6F3] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(246,250,255,0.94)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-5">
                  <p className="mb-3 text-[14px] font-semibold text-text">
                    3. Какво би те накарало да започнеш още днес?
                  </p>
                  <div className="grid gap-2.5">
                    {MATURA_FINAL_START_TRIGGERS.map((option) => (
                      <ChoiceButton
                        key={option.value}
                        active={startTrigger === option.value}
                        label={option.label}
                        onClick={() => setStartTrigger(option.value)}
                      />
                    ))}
                  </div>
                </div>
              </fieldset>

              <div className="mt-6">
                <label className="mb-1.5 block text-[12.5px] font-semibold text-text">
                  Ако искаш, напиши с едно изречение какво те притеснява най-много
                </label>
                <textarea
                  value={freeText}
                  onChange={(event) => setFreeText(event.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Например: най-много се притеснявам от съчинението, защото не знам как да подредя тезата и аргументите."
                  className="w-full rounded-[22px] border border-[#DCE6F4] bg-white px-4 py-3.5 text-[14px] text-text outline-none transition placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-[22px] bg-gradient-to-r from-primary to-[#2563EB] px-5 py-4 text-[14px] font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.24)] transition hover:from-[#1849D4] hover:to-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Записваме анкетата и отваряме checkout-а...'
                  : 'Попълни анкетата и премини към офертата'}
              </button>

              <p className="mt-4 text-[12px] leading-relaxed text-text-muted">
                След изпращане ще продължиш директно към checkout с приложен код за отстъпка. Данните се ползват само за тази кампания и за подобряване на продукта. Виж{' '}
                <Link href="/privacy" className="font-semibold text-primary hover:underline">
                  Политиката за поверителност
                </Link>
                .
              </p>
            </form>
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setHasStarted(true)}
            className="group relative w-full max-w-3xl text-left"
          >
            <div className="intro-shadow absolute inset-x-8 -top-6 bottom-0 rounded-[44px] bg-[#76A8FF]/25 blur-3xl" />

            <div className="intro-bubble relative overflow-hidden rounded-[40px] border border-white/80 bg-white/78 px-6 py-10 shadow-[0_24px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:px-10 sm:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,169,255,0.28),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.12)_0%,_rgba(255,255,255,0)_100%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#BFD3EF] bg-[#F8FBFF] px-4 py-2 text-[12px] font-semibold text-primary shadow-[0_10px_24px_rgba(37,99,235,0.10)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#F97316]" />
                  {remainingDays > 0 ? `${remainingDays} дни до ДЗИ` : 'ДЗИ е съвсем близо'}
                </div>

                <h1 className="mt-5 max-w-2xl text-[2.25rem] font-black leading-[0.98] tracking-[-0.07em] text-text sm:text-[3.45rem]">
                  Само 4 въпроса те делят от {MATURA_FINAL_DISCOUNT_PERCENT}% отстъпка от плана.
                </h1>

                <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#BFD3EF] bg-[#F8FBFF] px-4 py-2.5 text-[13px] font-semibold text-primary shadow-[0_10px_24px_rgba(37,99,235,0.10)] transition group-hover:border-[#9FBDE8] group-hover:translate-y-[-1px]">
                  Отвори анкетата
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[15px] text-white"
                  >
                    →
                  </span>
                </div>
              </div>
            </div>

            <div className="intro-tail absolute bottom-4 left-10 h-10 w-10 rounded-[15px] border-r border-b border-white/80 bg-white/78 backdrop-blur-xl" />
          </button>
        )}
      </div>

      <style jsx>{`
        .ambient-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(18px);
          opacity: 0.7;
        }

        .ambient-orb-one {
          top: 12%;
          left: 10%;
          height: 16rem;
          width: 16rem;
          background: rgba(125, 169, 255, 0.18);
          animation: drift 14s ease-in-out infinite;
        }

        .ambient-orb-two {
          right: 12%;
          top: 22%;
          height: 12rem;
          width: 12rem;
          background: rgba(56, 189, 248, 0.14);
          animation: drift 18s ease-in-out infinite reverse;
        }

        .ambient-orb-three {
          bottom: 12%;
          left: 22%;
          height: 14rem;
          width: 14rem;
          background: rgba(255, 255, 255, 0.28);
          animation: drift 20s ease-in-out infinite;
        }

        .intro-shadow {
          animation: pulseGlow 4.2s ease-in-out infinite;
        }

        .intro-bubble {
          animation: floatBubble 6.5s ease-in-out infinite;
        }

        .intro-tail {
          transform: rotate(42deg);
          animation: floatBubble 6.5s ease-in-out infinite;
        }

        .card-enter {
          animation: cardEnter 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes floatBubble {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.02);
          }
        }

        @keyframes drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(18px, -12px, 0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-orb-one,
          .ambient-orb-two,
          .ambient-orb-three,
          .intro-shadow,
          .intro-bubble,
          .intro-tail,
          .card-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
