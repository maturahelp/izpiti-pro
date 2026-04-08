import Link from 'next/link'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const freePlan = {
  name: 'Безплатен план',
  price: '0',
  period: '',
  description: 'За да разгледаш платформата и да пробваш как учиш с нея.',
  cta: 'Започни безплатно',
  ctaHref: '/dashboard',
  features: [
    { included: true, text: '5 безплатни теста на месец' },
    { included: true, text: '3 безплатни аудио урока' },
    { included: true, text: 'Избрани учебни материали' },
    { included: true, text: 'Основни функции на платформата' },
    { included: false, text: 'Пълен достъп до всички тестове' },
    { included: false, text: 'Всички аудио уроци' },
    { included: false, text: 'Всички учебни материали' },
    { included: false, text: 'AI помощник (неограничено)' },
    { included: false, text: 'Пълно проследяване на напредъка' },
  ],
}

const premiumPlan = {
  name: 'Премиум план',
  price: '15.99',
  yearlyPrice: '9.99',
  period: 'лв./месец',
  yearlyNote: 'или 119.99 лв./год. (спестяваш 38%)',
  description: 'За пълна и системна подготовка за изпита.',
  cta: 'Вземи Премиум',
  ctaHref: '/subscription',
  highlight: true,
  features: [
    { included: true, text: 'Неограничен достъп до всички тестове' },
    { included: true, text: 'Всички аудио уроци (200+)' },
    { included: true, text: 'Всички учебни материали (300+)' },
    { included: true, text: 'AI помощник без ограничение' },
    { included: true, text: 'Пълно проследяване на напредъка' },
    { included: true, text: 'Персонализирани препоръки' },
    { included: true, text: 'Режим за повторение на грешките' },
    { included: true, text: 'Достъп от всички устройства' },
    { included: true, text: 'Нови материали всяка седмица' },
  ],
}

export function Pricing() {
  return (
    <section id="ceni" className="py-20 md:py-28 relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(27,79,216,0.15)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_10%_20%,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '72px 72px'
      }} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label-light mb-3">Цени</p>
          <h2 className="text-[2rem] md:text-[2.6rem] font-black text-white tracking-[-0.04em] mb-4">
            По-достъпно от частни уроци
          </h2>
          <p className="text-[16px] text-white/50 max-w-xl mx-auto leading-[1.7]">
            Един час с частен учител струва 40–80 лв. MaturaHelp Премиум — 15.99 лв./месец за пълен достъп.
          </p>
        </FadeIn>

        <StaggerChildren className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <StaggerItem>
            <PlanCard plan={freePlan} />
          </StaggerItem>
          <StaggerItem>
            <PlanCard plan={premiumPlan} />
          </StaggerItem>
        </StaggerChildren>

        <FadeIn delay={0.25} className="text-center mt-8 space-y-2">
          <p className="text-[14px] font-semibold text-white/40">
            По-достъпно от дори един частен урок месечно.
          </p>
          <p className="text-[13px] text-white/30">
            Без скрити такси. Отказ от абонамента по всяко време.{' '}
            <span className="opacity-50">·</span>{' '}
            7 дни безплатен пробен период за Премиум план.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

function PlanCard({ plan }: { plan: typeof freePlan | typeof premiumPlan }) {
  const isPremium = 'highlight' in plan && plan.highlight

  return (
    <div className={`relative flex flex-col gap-6 rounded-2xl p-7 h-full transition-all duration-200 ${
      isPremium
        ? 'hover:-translate-y-2'
        : 'hover:-translate-y-1'
    }`}
      style={isPremium ? {
        background: 'linear-gradient(145deg, #1B4FD8 0%, #1E3A8A 50%, #1a2f78 100%)',
        border: '1px solid rgba(99,102,241,0.4)',
        boxShadow: '0 8px 32px rgba(27,79,216,0.4), 0 32px 64px rgba(27,79,216,0.2), 0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      } : {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {isPremium && (
        <>
          {/* Glow blob */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#60A5FA]/10 to-transparent pointer-events-none" />
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <span className="px-4 py-1.5 text-[11px] font-black tracking-[0.06em] uppercase text-white rounded-full"
              style={{ background: 'linear-gradient(135deg, #60A5FA, #818CF8)', boxShadow: '0 4px 12px rgba(96,165,250,0.4)' }}>
              Най-популярен
            </span>
          </div>
        </>
      )}

      <div>
        <p className={`text-[11px] font-black uppercase tracking-[0.1em] mb-3 ${isPremium ? 'text-blue-200/70' : 'text-white/40'}`}>{plan.name}</p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className={`text-[2.8rem] font-black leading-none tracking-[-0.04em] ${isPremium ? 'text-white' : 'text-white'}`}>{plan.price}</span>
          {plan.price !== '0' && (
            <span className={`text-[13.5px] mb-1 font-medium ${isPremium ? 'text-blue-200/70' : 'text-white/40'}`}>{plan.period}</span>
          )}
          {plan.price === '0' && (
            <span className={`text-[13.5px] mb-1 font-medium ${isPremium ? 'text-blue-200/70' : 'text-white/40'}`}>лв.</span>
          )}
        </div>
        {'yearlyNote' in plan && plan.yearlyNote && (
          <p className="text-[12px] text-emerald-300 font-bold mb-2">{plan.yearlyNote}</p>
        )}
        <p className={`text-[13.5px] leading-relaxed mt-2 ${isPremium ? 'text-blue-100/70' : 'text-white/40'}`}>{plan.description}</p>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            {f.included ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                className={`flex-shrink-0 mt-0.5 ${isPremium ? 'text-emerald-300' : 'text-emerald-400'}`}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className="text-white/20 flex-shrink-0 mt-0.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
            <span className={`text-[13.5px] leading-snug ${f.included ? (isPremium ? 'text-blue-50' : 'text-white/80') : 'text-white/25'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={`flex items-center justify-center py-3.5 rounded-xl font-black text-[14px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] tracking-[-0.01em] ${
          isPremium
            ? 'text-primary bg-white hover:bg-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
            : 'text-white border border-white/15 bg-white/[0.08] hover:bg-white/[0.14] hover:border-white/25'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  )
}
