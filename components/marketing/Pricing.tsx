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
    <section id="ceni" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Цени</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            По-достъпно от частни уроци
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
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
          <p className="text-[14px] font-medium text-text-muted">
            По-достъпно от дори един частен урок месечно.
          </p>
          <p className="text-[13px] text-text-muted/70">
            Без скрити такси. Отказ от абонамента по всяко време.
          </p>
        </FadeIn>

        <FadeIn delay={0.3} className="mt-10 max-w-3xl mx-auto border border-[#E2E8F0] bg-white px-6 py-5">
          <p className="text-[15px] font-semibold text-text text-center mb-4">Начини на плащане</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { id: 'card', label: 'С карта' },
              { id: 'cash', label: 'В брой' },
              { id: 'epay', label: 'Чрез ePay' },
            ].map((method) => (
              <div key={method.id} className="border border-[#E2E8F0] bg-[#F8FAFC] py-3 px-3 text-center">
                <div className="w-7 h-7 mx-auto mb-2 text-primary">
                  {method.id === 'card' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="5" width="19" height="14" rx="2" />
                      <path d="M2.5 9h19M7 15h3" />
                    </svg>
                  )}
                  {method.id === 'cash' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="6" width="18" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2.5" />
                      <path d="M7 9h.01M17 15h.01" />
                    </svg>
                  )}
                  {method.id === 'epay' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h16M4 12h16M4 17h9" />
                      <rect x="2.5" y="4" width="19" height="16" rx="2" />
                    </svg>
                  )}
                </div>
                <p className="text-[13px] font-medium text-text">{method.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function PlanCard({ plan }: { plan: typeof freePlan | typeof premiumPlan }) {
  const isPremium = 'highlight' in plan && plan.highlight

  return (
    <div className={`relative flex flex-col gap-6 rounded-2xl p-7 h-full ${
      isPremium
        ? 'bg-white border-2 border-primary shadow-[0_8px_32px_rgba(27,79,216,0.14),0_2px_4px_rgba(27,79,216,0.06)]'
        : 'bg-white border border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.02)]'
    }`}>
      {isPremium && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-3.5 py-1 bg-primary text-white text-[11px] font-bold rounded-full shadow-[0_1px_4px_rgba(27,79,216,0.3)] tracking-[0.01em]">
            Най-популярен
          </span>
        </div>
      )}

      <div>
        <p className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-3">{plan.name}</p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[2.5rem] font-bold font-serif text-text leading-none tracking-[-0.03em]">{plan.price}</span>
          {plan.price !== '0' && (
            <span className="text-[13.5px] text-text-muted mb-1">{plan.period}</span>
          )}
          {plan.price === '0' && (
            <span className="text-[13.5px] text-text-muted mb-1">лв.</span>
          )}
        </div>
        {'yearlyNote' in plan && plan.yearlyNote && (
          <p className="text-[12px] text-success font-medium mb-2">{plan.yearlyNote}</p>
        )}
        <p className="text-[13.5px] text-text-muted leading-relaxed mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            {f.included ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-success flex-shrink-0 mt-0.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-light flex-shrink-0 mt-0.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
            <span className={`text-[13.5px] leading-snug ${f.included ? 'text-text' : 'text-text-light'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={`${isPremium ? 'btn-primary' : 'btn-secondary'} justify-center py-3 text-[14px]`}
      >
        {plan.cta}
      </Link>
    </div>
  )
}
