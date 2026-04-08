import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const benefits = [
  {
    title: 'Подредена подготовка',
    description: 'Всичко необходимо за НВО и ДЗИ е структурирано по теми, предмети и класове. Без разпилян материал от различни сайтове.',
  },
  {
    title: 'Интерактивни тестове',
    description: 'Реши тестове с незабавна обратна връзка. Виж грешките си, прочети обяснението и научи от всеки отговор.',
  },
  {
    title: 'Кратки аудио уроци',
    description: 'Слушай ясни, кратки уроци по всяка тема. Идеални за учене в транспорта, преди лягане или при преговор.',
  },
  {
    title: 'AI помощ при затруднение',
    description: 'Когато засечеш нещо неразбрано, AI помощникът ти обяснява на разбираем език, задава въпроси и ти помага да научиш темата.',
  },
  {
    title: 'По-достъпно от частни уроци',
    description: 'Пълен достъп до всички материали, тестове и уроци за по-малко от цената на един час с частен учител.',
  },
  {
    title: 'Проследяване на напредъка',
    description: 'Виж ясно кои теми владееш добре и кои трябва да доразвиеш. Персонализирани препоръки за следващата стъпка.',
  },
]

export function Benefits() {
  return (
    <section className="py-20 md:py-28 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <FadeIn className="mb-14">
          <p className="section-label-light mb-4">Защо MaturaHelp</p>
          <h2 className="text-[2rem] md:text-[2.8rem] font-extrabold text-white tracking-[-0.04em] leading-[1.05] max-w-2xl">
            Какво получаваш още в първите 7 дни
          </h2>
          <p className="text-[16px] text-white/40 max-w-xl mt-4 leading-[1.7]">
            Платформата е изградена специално за ученици, подготвящи се за НВО и ДЗИ — с фокус върху резултата, а не само съдържанието.
          </p>
        </FadeIn>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
          {benefits.map((benefit, i) => (
            <StaggerItem key={benefit.title}>
              <div className="bg-[#111111] p-7 hover:bg-[#1A1A1A] transition-colors duration-200 group">
                <div className="flex items-start gap-4">
                  <span className="text-[11px] font-extrabold text-[#2563EB] tracking-[0.08em] mt-0.5 flex-shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-white text-[15px] mb-2 tracking-[-0.02em] leading-snug">
                      {benefit.title}
                    </h3>
                    <p className="text-[13.5px] text-white/40 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
