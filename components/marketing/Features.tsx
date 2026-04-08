import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const features = [
  {
    title: 'Интерактивни тестове',
    description: 'Над 500 теста по всички теми за НВО и ДЗИ. Незабавна проверка, подробни обяснения и следене на резултатите.',
    stat: '500+',
    statLabel: 'теста по всички предмети',
    points: [
      'Тестове по теми и по пълен изпитен формат',
      'Незабавна обратна връзка с обяснения',
      'История на резултатите',
      'Режим за повторение на грешките',
    ],
    accent: '#2563EB',
  },
  {
    title: 'Аудио уроци',
    description: 'Кратки, ясни аудио уроци по всяка тема. Можеш да учиш навсякъде — по пътя, у дома или в почивката.',
    stat: '200+',
    statLabel: 'аудио урока',
    points: [
      'Уроци от 5 до 20 минути',
      'Транскрипт за четене',
      'Резюме след всеки урок',
      'Свързан тест за проверка',
    ],
    accent: '#059669',
  },
  {
    title: 'Учебни материали',
    description: 'Бележки, резюмета, схеми и PDF документи за всяка тема. Ясно структурирани и лесни за преглед.',
    stat: '300+',
    statLabel: 'материала за сваляне',
    points: [
      'Структурирани по теми и предмети',
      'Бележки, схеми, резюмета и PDF',
      'Нови материали всяка седмица',
      'Лесен достъп от всяко устройство',
    ],
    accent: '#B45309',
  },
  {
    title: 'AI помощник',
    description: 'Задай въпрос по всяка тема и получи ясен отговор. AI-ят помага да разбереш — не само да научиш наизуст.',
    stat: '∞',
    statLabel: 'въпроси за Премиум',
    points: [
      'Обяснява теми с прости думи',
      'Анализира грешните ти отговори',
      'Предлага следващи стъпки',
      'Работи на български',
    ],
    accent: '#7C3AED',
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF8F4]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <FadeIn className="mb-14">
          <p className="section-label mb-4">Функции</p>
          <h2 className="text-[2rem] md:text-[2.8rem] font-extrabold text-[#0D0D0D] tracking-[-0.04em] leading-[1.05] max-w-2xl">
            Всичко в една платформа
          </h2>
          <p className="text-[16px] text-[#6B6B6B] max-w-xl mt-4 leading-[1.7]">
            Няма нужда да събираш материали от различни места. MaturaHelp е единственото, от което се нуждаеш.
          </p>
        </FadeIn>

        {/* Staggered layout: offset alternate cards */}
        <StaggerChildren className="grid lg:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <StaggerItem key={feature.title}>
              <div
                className={`bg-white rounded-[8px] border border-[#E5E5E5] p-7 flex flex-col gap-5 h-full hover:border-[#B0B0B0] hover:-translate-y-[3px] transition-all duration-200 ${i % 2 === 1 ? 'lg:mt-6' : ''}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Stat as accent */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[2.2rem] font-extrabold tracking-[-0.04em] leading-none" style={{ color: feature.accent }}>
                        {feature.stat}
                      </span>
                      <span className="text-[12px] text-[#6B6B6B] font-medium">{feature.statLabel}</span>
                    </div>
                    <h3 className="text-[1.05rem] font-extrabold text-[#0D0D0D] tracking-[-0.03em] leading-snug">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                <p className="text-[13.5px] text-[#6B6B6B] leading-relaxed">{feature.description}</p>

                {/* Divider */}
                <div className="h-px bg-[#E5E5E5]" />

                <ul className="space-y-2 mt-auto">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[13.5px] text-[#0D0D0D]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        className="flex-shrink-0 mt-0.5" style={{ color: feature.accent }}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
