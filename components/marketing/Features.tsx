import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const features = [
  {
    title: 'Интерактивни тестове',
    description:
      'Над 500 теста по всички теми за НВО и ДЗИ. Незабавна проверка, подробни обяснения и следене на резултатите.',
    stat: '500+',
    statLabel: 'теста по всички предмети',
    points: [
      'Тестове по теми и по пълен изпитен формат',
      'Незабавна обратна връзка с обяснения',
      'История на резултатите',
      'Режим за повторение на грешките',
    ],
  },
  {
    title: 'Аудио уроци',
    description:
      'Кратки, ясни аудио уроци по всяка тема. Можеш да учиш навсякъде — по пътя, у дома или в почивката.',
    stat: '200+',
    statLabel: 'аудио урока',
    points: [
      'Уроци от 5 до 20 минути',
      'Транскрипт за четене',
      'Резюме след всеки урок',
      'Свързан тест за проверка',
    ],
  },
  {
    title: 'Учебни материали',
    description:
      'Бележки, резюмета, схеми и PDF документи за всяка тема. Ясно структурирани и лесни за преглед.',
    stat: '300+',
    statLabel: 'материала за сваляне',
    points: [
      'Структурирани по теми и предмети',
      'Бележки, схеми, резюмета и PDF',
      'Нови материали всяка седмица',
      'Лесен достъп от всяко устройство',
    ],
  },
  {
    title: 'AI помощник',
    description:
      'Задай въпрос по всяка тема и получи ясен отговор. AI-ят помага да разбереш — не само да научиш наизуст.',
    stat: '∞',
    statLabel: 'въпроси за Премиум',
    points: [
      'Обяснява теми с прости думи',
      'Анализира грешните ти отговори',
      'Предлага следващи стъпки',
      'Работи на български',
    ],
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Функции</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Всичко в една платформа
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Няма нужда да събираш материали от различни места. MaturaHelp е единственото, от което се нуждаеш.
          </p>
        </FadeIn>

        <StaggerChildren className="grid lg:grid-cols-2 gap-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="card p-7 flex flex-col gap-5 h-full hover:shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[1.125rem] font-serif font-bold text-text tracking-[-0.02em] leading-snug">
                    {feature.title}
                  </h3>
                  <div className="text-right flex-shrink-0 bg-primary/[0.06] rounded-xl px-3 py-1.5 border border-primary/10">
                    <p className="text-[15px] font-bold text-primary font-serif leading-none mb-0.5">{feature.stat}</p>
                    <p className="text-[10.5px] text-primary/60 leading-tight whitespace-nowrap">{feature.statLabel}</p>
                  </div>
                </div>
                <p className="text-[13.5px] text-text-muted leading-relaxed">{feature.description}</p>
                <ul className="space-y-2 mt-auto">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[13.5px] text-text">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="text-primary flex-shrink-0 mt-0.5"
                      >
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
