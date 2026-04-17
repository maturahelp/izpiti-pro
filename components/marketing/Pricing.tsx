'use client'

import Link from 'next/link'
import { useState } from 'react'

const nvoPlans = [
  {
    label: 'НВО Месечен план',
    price: '19.99 €',
    period: '/ месец',
    access: null,
    desc: 'Подходящ за ученици, които искат стабилна подготовка с ясен план и упражнения.',
    features: [
      'Пълен достъп до материалите за НВО',
      'Видео уроци по ключовите теми',
      'Тестове и задачи след уроците',
      'Обяснения на разбираем език за 7. клас',
      'AI помощник за въпроси и допълнителна помощ',
      'Напредък и по-добра организация на ученето',
    ],
    cta: 'Започни подготовка',
    featured: false,
    badge: null,
  },
  {
    label: 'НВО до края на изпитите',
    price: '29.99 €',
    period: 'еднократно',
    access: 'Достъп до 19 юни 2026 г.',
    desc: 'За ученици, които искат спокойствие и достъп до самите изпити.',
    features: [
      'Всичко от месечния план',
      'Достъп до НВО подготовката до края на изпитите',
      'Подготовка за НВО БЕЛ — 17 юни 2026 г.',
      'Подготовка за НВО МАТ — 19 юни 2026 г.',
      'Упражнения и тестове в изпитен формат',
      'Подходящо за цялостна подготовка без прекъсване',
    ],
    cta: 'Вземи достъп до 19 юни',
    featured: true,
    badge: 'Най-изгоден за целия период',
  },
]

const dziPlans = [
  {
    label: 'ДЗИ Месечен план',
    price: '19.99 €',
    period: '/ месец',
    access: null,
    desc: 'Подходящ за ученици, които искат да започнат сега и да учат в собствен ритъм.',
    features: [
      'Пълен достъп до материалите за подготовка за ДЗИ',
      'Видео уроци по най-важните теми и произведения',
      'Тестове и упражнения след всеки урок',
      'Подредена теория и обобщения на едно място',
      'AI помощник за въпроси, обяснения и насоки',
      'Проследяване на напредъка ти в платформата',
    ],
    cta: 'Започни сега',
    featured: false,
    badge: null,
  },
  {
    label: 'ДЗИ до края на матурите',
    price: '22.99 €',
    period: 'еднократно',
    access: 'Достъп до 22 май 2026 г.',
    desc: 'Подходящ за ученици, които искат пълен достъп до края на изпитния период.',
    features: [
      'Всичко от месечния план',
      'Достъп до платформата до края на матурите',
      'Подготовка без притеснение от подновяване',
      'Фокус върху най-важното до изпита',
      'Практически тестове в реален формат',
      'Удобен вариант за интензивна финална подготовка',
    ],
    cta: 'Вземи достъп до 22 май',
    featured: true,
    badge: 'Най-подходящ за финална подготовка',
  },
]

const familyFeatures = [
  'Достъп до цялата НВО подготовка',
  'Достъп до цялата ДЗИ подготовка',
  'Видео уроци, теория, тестове и упражнения',
  'AI помощник за въпроси и обяснения',
  'Подходящ за семейства с ученик в 7. и 12. клас',
  'Един по-изгоден план вместо два отделни абонамента',
]

export function Pricing() {
  const [tab, setTab] = useState<'nvo' | 'dzi'>('nvo')
  const plans = tab === 'nvo' ? nvoPlans : dziPlans

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#1e2a4a' }}>
            Избери план за подготовка, който пасва на твоя изпит
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Учи с видео уроци, тестове, учебни материали и AI помощник — с достъп за 1 месец или до самия изпит.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-full p-1 flex gap-1">
            <button
              onClick={() => setTab('nvo')}
              className="px-8 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={tab === 'nvo' ? { background: '#3b82f6', color: '#fff' } : { color: '#6b7280' }}
            >
              НВО
            </button>
            <button
              onClick={() => setTab('dzi')}
              className="px-8 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={tab === 'dzi' ? { background: '#3b82f6', color: '#fff' } : { color: '#6b7280' }}
            >
              ДЗИ
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-7 max-w-3xl mx-auto mb-8">
          {plans.map((plan) => (
            <div
              key={plan.label}
              className="bg-white rounded-2xl p-8 relative"
              style={
                plan.featured
                  ? { border: '2px solid #3b82f6', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }
                  : { border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }
              }
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap"
                  style={{ background: '#3b82f6' }}
                >
                  {plan.badge}
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#3b82f6' }}>{plan.label}</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold" style={{ color: '#1e2a4a' }}>{plan.price}</span>
                <span className="text-gray-400 text-sm"> {plan.period}</span>
              </div>
              {plan.access && (
                <p className="text-xs font-medium mb-1" style={{ color: '#3b82f6' }}>{plan.access}</p>
              )}
              <p className="text-gray-500 text-sm mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span style={{ color: '#3b82f6' }} className="mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center text-white font-semibold py-3 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
                style={{ background: '#3b82f6' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Family plan */}
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-8 relative"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #eff6ff)', border: '1px solid #e0e7ff', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap"
              style={{ background: '#1e2a4a' }}
            >
              Най-добра стойност за семейства
            </span>
            <div className="md:flex md:items-start md:gap-10">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#1e2a4a' }}>Семеен план — НВО + ДЗИ</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold" style={{ color: '#1e2a4a' }}>39.99 €</span>
                  <span className="text-gray-400 text-sm"> еднократно</span>
                </div>
                <p className="text-xs font-medium mb-1" style={{ color: '#3b82f6' }}>Достъп до 19 юни 2026 г.</p>
                <p className="text-gray-500 text-sm mb-4">
                  Подходящ за семейства с повече от един ученик или за домакинства с подготовка и за НВО, и за ДЗИ.
                </p>
              </div>
              <div className="flex-1">
                <ul className="space-y-3 mb-6">
                  {familyFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span style={{ color: '#3b82f6' }} className="mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="block w-full text-center text-white font-semibold py-3 rounded-full text-sm transition-all hover:shadow-lg"
                  style={{ background: '#1e2a4a' }}
                >
                  Избери семеен план
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
