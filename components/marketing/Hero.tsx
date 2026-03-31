import Link from 'next/link'

const badges = [
  'Безплатен старт',
  'НВО и ДЗИ',
  'AI помощник',
  'Без инсталация',
]

export function Hero() {
  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-primary">Нова учебна платформа</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text leading-tight mb-5 text-balance">
              Подготви се за НВО и ДЗИ{' '}
              <span className="text-primary">без хаос</span>
            </h1>

            <p className="text-lg text-text-muted leading-relaxed mb-8">
              Тестове, аудио уроци, учебни материали и AI помощник на едно място.
              Подредена подготовка за 7. и 12. клас — без скъпи частни уроци.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">
                Започни безплатно
              </Link>
              <Link href="#kak-raboti" className="btn-secondary px-6 py-3 text-base">
                Как работи
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 text-xs font-medium text-text-muted bg-gray-50 border border-border px-3 py-1.5 rounded-full"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-success">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right: app preview */}
          <div className="relative">
            <AppPreviewCard />
          </div>
        </div>
      </div>
    </section>
  )
}

function AppPreviewCard() {
  return (
    <div className="card shadow-modal overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-[10px] font-serif">И</span>
          </span>
          <span className="text-xs font-semibold text-text">ИзпитиПро</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-success-light text-success text-[10px] font-semibold">Активен</span>
          <span className="text-[10px] text-text-muted">Мария П.</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Welcome */}
        <div>
          <p className="text-[10px] text-text-muted mb-0.5">Добре дошла,</p>
          <p className="text-sm font-bold text-text font-serif">Мария Петрова</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Тестове', value: '8' },
            { label: 'Уроци', value: '5' },
            { label: 'Резултат', value: '72%' },
          ].map((s) => (
            <div key={s.label} className="bg-bg rounded-lg p-2 text-center">
              <p className="text-base font-bold text-text font-serif">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div className="bg-primary-light rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-primary mb-0.5">Продължи урока</p>
            <p className="text-xs font-semibold text-text">Запетая при сложно изречение</p>
            <p className="text-[10px] text-text-muted mt-0.5">БЕЛ — 45% завършен</p>
          </div>
          <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-text-muted mb-1">
            <span>Напредък в темата</span>
            <span>45%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div className="h-1.5 bg-primary rounded-full" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Test card */}
        <div className="border border-border rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Следващ тест</p>
            <p className="text-xs font-semibold text-text">Части на речта — тест 2</p>
            <p className="text-[10px] text-text-muted">25 въпроса · 40 мин</p>
          </div>
          <span className="text-[10px] font-semibold text-amber bg-amber-light px-2 py-1 rounded-full">Среден</span>
        </div>

        {/* AI helper */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#1B4FD8"/>
            </svg>
          </div>
          <p className="text-[10px] text-text-muted">
            <span className="text-text font-medium">AI помощник</span> — задай въпрос по темата
          </p>
        </div>
      </div>
    </div>
  )
}
