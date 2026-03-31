'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { currentUser } from '@/data/users'
import Link from 'next/link'

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

                <button className="btn-primary w-full justify-center py-3 text-base">
                  Започни 7 дни безплатно
                </button>
                <p className="text-xs text-center text-text-muted mt-2">
                  Без кредитна карта. Отказ по всяко време.
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
