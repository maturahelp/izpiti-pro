const features = [
  {
    title: 'Интерактивни тестове',
    description:
      'Над 500 теста по всички теми за НВО и ДЗИ. Незабавна проверка, подробни обяснения и следене на резултатите.',
    stat: '500+ теста',
    statLabel: 'по всички предмети',
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
    stat: '200+ урока',
    statLabel: 'аудио съдържание',
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
    stat: '300+ материала',
    statLabel: 'за сваляне и четене',
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
    stat: 'Без ограничение',
    statLabel: 'въпроси за Премиум',
    points: [
      'Обяснява теми с прости думи',
      'Анализира грешните ти отговори',
      'Предлага следващи стъпки',
      'Работи на български',
    ],
  },
  {
    title: 'Проследяване на напредъка',
    description:
      'Виж точно кои теми владееш и кои трябват работа. Ясно визуализирано без излишен шум.',
    stat: 'Реално',
    statLabel: 'проследяване',
    points: [
      'Резултати по теми и предмети',
      'Слаби и силни области',
      'Последна активност',
      'Препоръки за следваща стъпка',
    ],
  },
]

export function Features() {
  return (
    <section className="py-16 md:py-24 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Функции</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            Всичко в една платформа
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Няма нужда да събираш материали от различни места. ИзпитиПро е единственото, от което се нуждаеш.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="section-title text-xl">{feature.title}</h3>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-primary font-serif">{feature.stat}</p>
                  <p className="text-xs text-text-muted">{feature.statLabel}</p>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
              <ul className="space-y-2">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-text">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
