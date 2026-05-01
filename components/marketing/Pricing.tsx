'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { FadeIn } from '@/components/ui/fade-in'

type ExamTab = 'nvo' | 'dzi'
type PlanKey = 'nvo-full' | 'dzi-full'

type Plan = {
  label: string
  price: string
  period: string
  access?: string
  savings?: string
  desc: string
  features: string[]
  cta: string
  featured?: boolean
  badge?: string
  planKey: PlanKey | null
}

const nvoPlans: Plan[] = [
  {
    label: 'Безплатен НВО',
    price: '0 €',
    period: 'безплатно',
    desc: 'Започни подготовката за НВО без ангажимент — виж как работи платформата.',
    features: [
      'Литература: 1 видео урок с анализ + упражнение („Художник")',
      'Литература: всички текстове (четивна компетентност)',
      'НВО: всички изпити от минали години',
      'Български: Тема 1 — теория + упражнение',
      'Математика: Подтема 1 на Тема 1',
    ],
    cta: 'Регистрирай се безплатно',
    planKey: null,
  },
  {
    label: 'НВО до края на изпитите',
    price: '30 €',
    period: 'еднократно',
    access: 'Достъп до 19 юни 2026 г.',
    desc: 'За ученици, които искат спокойствие и пълен достъп до самите изпити.',
    features: [
      'Пълен достъп до материалите за НВО',
      'Видео уроци по всички теми и произведения',
      'Подготовка за НВО БЕЛ — 17 юни 2026 г.',
      'Подготовка за НВО МАТ — 19 юни 2026 г.',
      'Упражнения и тестове в изпитен формат',
      'AI помощник за въпроси и обяснения',
    ],
    cta: 'Вземи достъп до 19 юни',
    featured: true,
    planKey: 'nvo-full',
  },
]

const dziPlans: Plan[] = [
  {
    label: 'Безплатен ДЗИ',
    price: '0 €',
    period: 'безплатно',
    desc: 'Започни подготовката за ДЗИ без ангажимент — виж как работи платформата.',
    features: [
      'Литература: 1 видео урок с анализ + упражнение („Потомка")',
      'Литература: всички текстове',
      'ДЗИ: всички изпити от минали години',
      'Български: Правило 1 — теория + упражнение',
      'Английски: Essay Structure Format',
    ],
    cta: 'Регистрирай се безплатно',
    planKey: null,
  },
  {
    label: 'ДЗИ до края на матурите',
    price: '19.99 €',
    period: 'еднократно',
    access: 'Достъп до 22 май 2026 г.',
    desc: 'За ученици, които искат пълен достъп до края на изпитния период.',
    features: [
      'Пълен достъп до материалите за ДЗИ',
      'Видео уроци по всички теми и произведения',
      'Подредена теория и обобщения на едно място',
      'Практически тестове в реален формат',
      'AI помощник за въпроси и обяснения',
      'Достъп до края на матурите без подновяване',
    ],
    cta: 'Вземи достъп до 22 май',
    featured: true,
    planKey: 'dzi-full',
  },
]

async function startCheckout(plan: PlanKey) {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    if (res.status === 401) {
      const checkoutRedirect = encodeURIComponent(`/api/checkout/redirect?plan=${plan}`)
      window.location.href = `/register?redirectTo=${checkoutRedirect}`
      return
    }

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Грешка: ' + (data.error ?? 'Неизвестна грешка'))
    }
  } catch (err) {
    alert('Проблем при свързване с плащане. Опитай отново.')
    console.error(err)
  }
}

function handleFreeSignup() {
  window.location.href = '/register'
}

export function Pricing() {
  const [tab, setTab] = useState<ExamTab>('dzi')
  const plans = tab === 'nvo' ? nvoPlans : dziPlans

  return (
    <section id="ceni" className="relative py-16 md:py-24 bg-white">
      <span id="pricing" className="absolute -top-20" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#1e2a4a]">
            Избери план за подготовка, който пасва на твоя изпит
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Учи с видео уроци, тестове, учебни материали и AI помощник — с достъп за 1 месец или до самия изпит.
          </p>
        </FadeIn>

        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-full p-1 flex gap-1" role="tablist" aria-label="Избор на изпит за ценови план">
            <PricingTabButton active={tab === 'nvo'} onClick={() => setTab('nvo')}>
              НВО
            </PricingTabButton>
            <PricingTabButton active={tab === 'dzi'} onClick={() => setTab('dzi')}>
              ДЗИ
            </PricingTabButton>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-7 max-w-3xl mx-auto mb-8">
          {plans.map((plan) => (
            <PlanCard key={plan.label} plan={plan} onCheckout={startCheckout} onFreeSignup={handleFreeSignup} />
          ))}
        </div>

      </div>
    </section>
  )
}

function PricingTabButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
        active ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-gray-500 hover:text-[#3b82f6]'
      }`}
    >
      {children}
    </button>
  )
}

function PlanCard({
  plan,
  onCheckout,
  onFreeSignup,
}: {
  plan: Plan
  onCheckout: (key: PlanKey) => void
  onFreeSignup: () => void
}) {
  const isFree = plan.planKey === null
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8 relative ${
        plan.featured ? 'border-2 border-[#3b82f6]' : 'border border-gray-100'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
          {plan.badge}
        </span>
      )}
      <p className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wide mb-2">{plan.label}</p>
      <div className="mb-1">
        <span className="text-4xl font-extrabold text-[#1e2a4a]">{plan.price}</span>
        <span className="text-gray-400 text-sm"> {plan.period}</span>
      </div>
      {plan.access && <p className="text-xs text-[#3b82f6] font-medium mb-1">{plan.access}</p>}
      {plan.savings && <p className="text-xs font-semibold text-[#1e2a4a] mb-2">{plan.savings}</p>}
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{plan.desc}</p>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature) => (
          <CheckItem key={feature}>{feature}</CheckItem>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => (isFree ? onFreeSignup() : onCheckout(plan.planKey as PlanKey))}
        className={`block w-full text-center font-semibold py-3 rounded-full text-sm transition-all ${
          isFree
            ? 'bg-white text-[#3b82f6] border-2 border-[#3b82f6] hover:bg-[#3b82f6] hover:text-white'
            : 'text-white bg-[#3b82f6] hover:shadow-lg hover:shadow-blue-200'
        }`}
      >
        {plan.cta}
      </button>
    </div>
  )
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600">
      <span className="text-[#3b82f6] mt-0.5" aria-hidden="true">
        ✓
      </span>
      <span>{children}</span>
    </li>
  )
}
