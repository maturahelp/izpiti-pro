const benefits = [
  {
    title: 'Подредена подготовка',
    description:
      'Всичко необходимо за НВО и ДЗИ е структурирано по теми, предмети и класове. Без разпилян материал от различни сайтове.',
  },
  {
    title: 'Интерактивни тестове',
    description:
      'Реши тестове с незабавна обратна връзка. Виж грешките си, прочети обяснението и научи от всеки отговор.',
  },
  {
    title: 'Кратки аудио уроци',
    description:
      'Слушай ясни, кратки уроци по всяка тема. Идеални за учене в транспорта, преди лягане или при преговор.',
  },
  {
    title: 'AI помощ при затруднение',
    description:
      'Когато засечеш нещо неразбрано, AI помощникът ти обяснява на разбираем език, задава въпроси и ти помага да научиш темата.',
  },
  {
    title: 'По-достъпно от частни уроци',
    description:
      'Пълен достъп до всички материали, тестове и уроци за по-малко от цената на един час с частен учител.',
  },
  {
    title: 'Проследяване на напредъка',
    description:
      'Виж ясно кои теми владееш добре и кои трябва да доразвиеш. Персонализирани препоръки за следващата стъпка.',
  },
]

export function Benefits() {
  return (
    <section className="py-16 md:py-24 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Защо ИзпитиПро</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            Всичко, от което се нуждаеш
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Платформата е изградена специално за ученици, подготвящи се за НВО и ДЗИ — с фокус върху резултата, а не само съдържанието.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit, i) => (
            <div key={benefit.title} className="card p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary font-serif">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-semibold text-text text-base leading-snug pt-0.5">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed pl-11">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
