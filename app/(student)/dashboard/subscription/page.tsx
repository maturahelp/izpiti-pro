'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { currentUser } from '@/data/users'
import Link from 'next/link'
import { LegalCheckbox } from '@/components/shared/LegalConsentFields'
import {
  LEGAL_VERSION,
  formatBgDate,
  getBrowserUserAgent,
  getNextPaymentDate,
} from '@/lib/legal-consent'
import { createClient } from '@/lib/supabase/client'

const premiumFeatures = [
  'Неограничен достъп до всички тестове (500+)',
  'Пълен достъп до всички аудио уроци (200+)',
  'Всички учебни материали за сваляне (300+)',
  'AI помощник без ограничение за брой въпроси',
  'Пълно проследяване на напредъка и препоръки',
  'Режим за повторение на грешките',
  'Нови тестове и уроци всяка седмица',
  'Достъп от телефон, таблет и компютър',
]

export default function SubscriptionPage() {
  const isFree = currentUser.plan === 'free'
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [today, setToday] = useState<Date | null>(null)
  const [acceptedTermsPrivacy, setAcceptedTermsPrivacy] = useState(false)
  const [immediateAccessAcknowledged, setImmediateAccessAcknowledged] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

  useEffect(() => {
    setToday(new Date())
  }, [])

  const nextPaymentDate = today ? getNextPaymentDate(today, billing) : null
  const nextPaymentDateLabel = nextPaymentDate ? formatBgDate(nextPaymentDate) : '...'
  const checkoutCanProceed = acceptedTermsPrivacy && immediateAccessAcknowledged

  async function handleCheckout() {
    setCheckoutError(null)
    setCheckoutMessage(null)

    if (!checkoutCanProceed) {
      setCheckoutError('За да продължиш, приеми условията и потвърди незабавния достъп до услугата.')
      return
    }

    setCheckoutLoading(true)
    const supabase = createClient()
    const { data, error: userError } = await supabase.auth.getUser()

    if (userError || !data.user) {
      setCheckoutLoading(false)
      setCheckoutError('Влез в акаунта си отново, за да продължиш към плащане.')
      return
    }

    const { error } = await supabase.from('consent_logs').insert({
      user_id: data.user.id,
      context: 'checkout',
      legal_version: LEGAL_VERSION,
      accepted_terms_privacy: acceptedTermsPrivacy,
      confirmed_age_14: false,
      immediate_access_acknowledged: immediateAccessAcknowledged,
      marketing_emails: marketingEmails,
      auto_renew_notice_shown: true,
      user_agent: getBrowserUserAgent(),
    })

    setCheckoutLoading(false)

    if (error) {
      setCheckoutError('Не успяхме да запишем съгласието. Опитай отново.')
      return
    }

    setCheckoutMessage('Съгласията са записани. Следващата стъпка е плащане през Stripe.')
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopBar title="Абонамент" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

        {isFree ? (
          <>
            {/* Free plan status */}
            <div className="card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Текущ план</p>
                <p className="font-bold text-text text-lg font-serif">Безплатен план</p>
                <p className="text-sm text-text-muted mt-0.5">5 теста и 3 урока на месец</p>
              </div>
              <span className="badge bg-gray-100 text-text-muted px-3 py-1 text-xs font-semibold">
                Активен
              </span>
            </div>

            {/* Usage this month */}
            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4 text-sm">Използване тази седмица</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">Тестове</span>
                    <span className="font-semibold text-text">3 от 5</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-amber rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">Аудио уроци</span>
                    <span className="font-semibold text-text">2 от 3</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-amber rounded-full" style={{ width: '66%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">AI въпроси</span>
                    <span className="font-semibold text-text">5 от 5</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-danger rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade section */}
            <div>
              <h2 className="font-semibold text-text mb-2">Надгради до Премиум</h2>
              <p className="text-sm text-text-muted mb-5">Пълен достъп за по-малко от цената на един час частен урок.</p>

              {/* Billing toggle */}
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex rounded-xl bg-bg border border-border p-1">
                  <button
                    onClick={() => setBilling('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      billing === 'monthly' ? 'bg-white shadow-card border border-border text-text' : 'text-text-muted'
                    }`}
                  >
                    Месечен
                  </button>
                  <button
                    onClick={() => setBilling('yearly')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      billing === 'yearly' ? 'bg-white shadow-card border border-border text-text' : 'text-text-muted'
                    }`}
                  >
                    Годишен
                    <span className="text-[10px] bg-success-light text-success px-1.5 py-0.5 rounded-full font-bold">-38%</span>
                  </button>
                </div>
              </div>

              <div className="card p-6 border-primary ring-2 ring-primary ring-offset-2">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="font-semibold text-text mb-1">Премиум план</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-serif text-text">
                        {billing === 'monthly' ? '15.99' : '9.99'}
                      </span>
                      <span className="text-text-muted text-sm">лв./месец</span>
                    </div>
                    {billing === 'yearly' && (
                      <p className="text-xs text-success font-medium mt-0.5">Плащаш 119.99 лв. веднъж годишно</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-full">Препоръчан</span>
                </div>

                <ul className="space-y-2.5 mb-5">
                  {premiumFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mb-4 rounded-lg border border-primary/20 bg-primary-light/60 p-4 text-[13px] leading-relaxed text-text-muted">
                  <p className="font-semibold text-text">С покупката се абонирате за автоматично подновяващ се план.</p>
                  <p>Следващото плащане ще бъде извършено на {nextPaymentDateLabel}.</p>
                  <p>Можете да прекратите подновяването по всяко време от профила си.</p>
                  <p>Достъпът остава активен до края на текущия платен период.</p>
                </div>

                <div className="mb-4 space-y-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <LegalCheckbox
                    id="checkout-accepted-terms-privacy"
                    checked={acceptedTermsPrivacy}
                    onChange={setAcceptedTermsPrivacy}
                  >
                    Приемам{' '}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                      Общите условия
                    </Link>{' '}
                    и{' '}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                      Политиката за поверителност
                    </Link>
                  </LegalCheckbox>
                  <LegalCheckbox
                    id="checkout-immediate-access"
                    checked={immediateAccessAcknowledged}
                    onChange={setImmediateAccessAcknowledged}
                  >
                    Искам достъпът до услугата да започне веднага и съм запознат/а, че това може да повлияе на правото ми на отказ
                  </LegalCheckbox>
                  <LegalCheckbox
                    id="checkout-marketing-emails"
                    checked={marketingEmails}
                    onChange={setMarketingEmails}
                  >
                    Съгласен съм да получавам маркетинг имейли
                  </LegalCheckbox>
                </div>

                {checkoutError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
                    {checkoutError}
                  </div>
                )}
                {checkoutMessage && (
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-[13px] text-green-700">
                    {checkoutMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!checkoutCanProceed || checkoutLoading}
                  className="btn-primary w-full justify-center py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutLoading ? 'Записване...' : 'Продължи към плащане'}
                </button>
                <p className="text-xs text-center text-text-muted mt-2">
                  Плащането ще бъде обработено сигурно. Отказ по всяко време от профила.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Premium plan status */}
            <div className="card p-5 border-success/30 bg-success-light/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-xs font-bold text-amber uppercase tracking-wider">Премиум</span>
                  </div>
                  <p className="font-bold text-text text-lg font-serif">Активен абонамент</p>
                  <p className="text-sm text-text-muted mt-0.5">Месечен план · 15.99 лв./месец</p>
                </div>
                <span className="badge badge-success px-3 py-1">Активен</span>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-text mb-4 text-sm">Информация за абонамента</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Следващо плащане</span>
                  <span className="font-medium text-text">15.04.2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Сума</span>
                  <span className="font-medium text-text">15.99 лв.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Метод на плащане</span>
                  <span className="font-medium text-text">Visa ···· 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Активен от</span>
                  <span className="font-medium text-text">15.01.2024</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-secondary flex-1 justify-center">
                Промени план
              </button>
              <button className="btn-ghost flex-1 justify-center text-danger hover:bg-danger-light">
                Отказ от абонамент
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
