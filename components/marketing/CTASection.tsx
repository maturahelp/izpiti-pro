import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-primary-light/80 text-sm font-semibold uppercase tracking-widest mb-4">
          Започни сега
        </p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-5 text-balance">
          Подготви се уверено за НВО и ДЗИ
        </h2>
        <p className="text-primary-light/90 text-lg mb-8 max-w-2xl mx-auto">
          Над 4 800 ученика вече ползват ИзпитиПро. Стартирай безплатно — без кредитна карта.
          7 дни пробен период за Премиум план.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-semibold text-base rounded-lg hover:bg-gray-50 transition-colors"
          >
            Започни безплатно
          </Link>
          <Link
            href="#ceni"
            className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-semibold text-base rounded-lg hover:bg-white/10 transition-colors"
          >
            Виж плановете
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary-light/70">
          {[
            '4 800+ ученика',
            '500+ теста',
            '200+ аудио урока',
            'Работи на телефон',
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
