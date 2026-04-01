import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const groups = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Ученици в 7. клас',
    description: 'Подготвяш се за НВО по БЕЛ или Математика и искаш структуриран план, а не купчина материали от различни места.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: 'Ученици в 12. клас',
    description: 'Матурата наближава и трябва да покриеш много материал. Платформата ти дава план, тестове и AI помощ — всичко на едно място.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Ученици, изоставащи с материала',
    description: 'Имаш пропуски и не знаеш откъде да започнеш. Структурираният учебен план и аудио уроците помагат да нагониш стъпка по стъпка.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Родители, търсещи алтернатива',
    description: 'Частните уроци са скъпи и не винаги удобни. MaturaHelp е достъпна и ефективна алтернатива — детето учи в собствено темпо, по всяко време.',
  },
]

export function ForWhom() {
  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">За кого</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            За кого е платформата
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            MaturaHelp е създадена за ученици и родители, които искат подредена и достъпна подготовка за НВО и ДЗИ.
          </p>
        </FadeIn>

        <StaggerChildren className="grid sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <StaggerItem key={group.title}>
              <div className="card p-6 flex gap-4 h-full hover:shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center flex-shrink-0 border border-primary/10 mt-0.5 text-primary">
                  {group.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-text text-[14.5px] mb-1.5 tracking-[-0.01em]">{group.title}</h3>
                  <p className="text-[13.5px] text-text-muted leading-relaxed">{group.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
