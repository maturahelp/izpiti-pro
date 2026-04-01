import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const testimonials = [
  {
    quote:
      'Преди ползвах видеа в YouTube, книги, сайтове — всичко разпиляно. С MaturaHelp за пръв път имах план. Направих 30+ теста за месец и средният ми резултат скочи с 18 точки.',
    name: 'Виктория Александрова',
    role: '12. клас, готви се за ДЗИ по БЕЛ',
    initials: 'В.А.',
    score: '91/100',
    scoreLabel: 'последен тест',
  },
  {
    quote:
      'Дъщеря ми беше много стресирана за НВО. Намерихме MaturaHelp и буквално за две седмици тя вече се чувства уверена. AI-ят обяснява толкова ясно — по-добре от много учители.',
    name: 'Иван Костов',
    role: 'Родител на ученик от 7. клас',
    initials: 'И.К.',
    score: 'Доволен родител',
    scoreLabel: '',
  },
  {
    quote:
      'Математиката ми беше слаба страна. Аудио уроците са страхотни — слушам ги на пат за училище. След всеки урок веднага правя тест и виждам веднага дали съм разбрал.',
    name: 'Георги Иванов',
    role: '7. клас, НВО по Математика',
    initials: 'Г.И.',
    score: '84/100',
    scoreLabel: 'среден резултат',
  },
  {
    quote:
      'Много ми харесва как AI-ят обяснява грешките ми. Не просто казва "грешно" — обяснява ЗАЩО е грешно и как да го запомня. Това е разлика.',
    name: 'Анна Костова',
    role: '12. клас, ДЗИ по История',
    initials: 'А.К.',
    score: '88/100',
    scoreLabel: 'среден резултат',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-white border-y border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Отзиви</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Какво казват учениците
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Над 4 800 ученика и родители вече ползват MaturaHelp за подготовка.
          </p>
        </FadeIn>

        <StaggerChildren className="grid sm:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="card p-7 flex flex-col gap-5 h-full hover:shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 transition-all duration-200">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="13" height="13" viewBox="0 0 24 24" fill="#B45309">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[14px] text-text leading-[1.75] tracking-[-0.005em] flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/[0.08] flex items-center justify-center flex-shrink-0 border border-primary/10">
                      <span className="text-[11px] font-bold text-primary">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-text tracking-[-0.01em]">{t.name}</p>
                      <p className="text-[12px] text-text-muted">{t.role}</p>
                    </div>
                  </div>
                  {t.score && (
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-primary font-serif tracking-[-0.01em]">{t.score}</p>
                      {t.scoreLabel && <p className="text-[11px] text-text-muted">{t.scoreLabel}</p>}
                    </div>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
