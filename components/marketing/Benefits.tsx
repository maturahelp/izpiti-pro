import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

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
    <section className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Защо MaturaHelp</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Всичко, от което се нуждаеш
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Платформата е изградена специално за ученици, подготвящи се за НВО и ДЗИ — с фокус върху резултата, а не само съдържанието.
          </p>
        </FadeIn>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, i) => (
            <StaggerItem key={benefit.title}>
              <div className="card p-6 flex flex-col gap-4 h-full hover:shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/[0.07] flex items-center justify-center flex-shrink-0 border border-primary/10 mt-px">
                    <span className="text-[11px] font-bold text-primary/80 font-serif tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text text-[14.5px] leading-snug pt-1 tracking-[-0.01em]">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-[13.5px] text-text-muted leading-relaxed pl-[46px]">
                  {benefit.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
