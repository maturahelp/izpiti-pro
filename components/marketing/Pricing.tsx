import Link from 'next/link'

const freePlan = {
  name: 'Безплатен план',
  price: '0',
  period: '',
  description: 'За да опиташ платформата и видиш дали работи за теб.',
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
  description: 'Пълен достъп до всичко, от което се нуждаеш за подготовка.',
  cta: 'Започни 7 дни безплатно',
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
    <section id="ceni" className="py-16 md:py-24 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Цени</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            По-достъпно от частни уроци
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Един час с частен учител струва 40-80 лв. ИзпитиПро Премиум — 15.99 лв./месец за пълен достъп.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <PlanCard plan={freePlan} />
          {/* Premium */}
          <PlanCard plan={premiumPlan} />
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Без скрити такси. Отказ от абонамента по всяко време.
          <br />
          7 дни безплатен пробен период за Премиум план.
        </p>
      </div>
    </section>
  )
}

function PlanCard({ plan }: { plan: typeof freePlan | typeof premiumPlan }) {
  const isPremium = 'highlight' in plan && plan.highlight

  return (
    <div className={`card p-6 flex flex-col gap-6 relative ${isPremium ? 'border-primary ring-2 ring-primary ring-offset-2' : ''}`}>
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
            Най-популярен
          </span>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-text mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-4xl font-bold font-serif text-text">{plan.price}</span>
          {plan.price !== '0' && (
            <span className="text-text-muted text-sm">{plan.period}</span>
          )}
          {plan.price === '0' && (
            <span className="text-text-muted text-sm">лв.</span>
          )}
        </div>
        {'yearlyNote' in plan && plan.yearlyNote && (
          <p className="text-xs text-success font-medium">{plan.yearlyNote}</p>
        )}
        <p className="text-sm text-text-muted mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            {f.included ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success flex-shrink-0 mt-0.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-light flex-shrink-0 mt-0.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
            <span className={`text-sm ${f.included ? 'text-text' : 'text-text-light'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={isPremium ? 'btn-primary justify-center' : 'btn-secondary justify-center'}
      >
        {plan.cta}
      </Link>
    </div>
  )
}
