const testimonials = [
  {
    quote:
      'Преди ползвах видеа в YouTube, книги, сайтове — всичко разпиляно. С ИзпитиПро за пръв път имах план. Направих 30+ теста за месец и средният ми резултат скочи с 18 точки.',
    name: 'Виктория Александрова',
    role: '12. клас, готви се за ДЗИ по БЕЛ',
    initials: 'В.А.',
    score: '91/100',
    scoreLabel: 'последен тест',
  },
  {
    quote:
      'Дъщеря ми беше много стресирана за НВО. Намерихме ИзпитиПро и буквално за две седмици тя вече се чувства уверена. AI-ят обяснява толкова ясно — по-добре от много учители.',
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
    <section className="py-16 md:py-24 bg-white border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Отзиви</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            Какво казват учениците
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Над 4 800 ученика и родители вече ползват ИзпитиПро за подготовка.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6 flex flex-col gap-4">
              <div className="flex items-start gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-text leading-relaxed italic">"{t.quote}"</p>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
                {t.score && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary font-serif">{t.score}</p>
                    {t.scoreLabel && <p className="text-xs text-text-muted">{t.scoreLabel}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
