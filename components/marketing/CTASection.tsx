import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-[#0B1120] relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(27,79,216,0.18)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(27,79,216,0.1)_0%,transparent_60%)]" />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-7 text-center">
        <FadeIn>
          <p className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-white/40 mb-4">
            Започни сега
          </p>
          <h2 className="text-[2rem] md:text-[2.75rem] font-serif font-bold text-white mb-5 text-balance tracking-[-0.03em] leading-[1.1]">
            Подготви се уверено за НВО и ДЗИ
          </h2>
          <p className="text-[16px] text-white/60 mb-10 max-w-xl mx-auto leading-[1.7]">
            Над 4 800 ученика вече ползват MaturaHelp. Стартирай безплатно — без кредитна карта.
            7 дни пробен период за Премиум план.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-7 py-3 bg-white text-text font-semibold text-[14.5px] rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:-translate-y-px active:translate-y-0 tracking-[-0.01em]"
            >
              Започни безплатно
            </Link>
            <Link
              href="#ceni"
              className="inline-flex items-center justify-center px-7 py-3 border border-white/15 bg-white/[0.06] text-white font-semibold text-[14.5px] rounded-xl hover:bg-white/10 hover:border-white/25 transition-all duration-200 tracking-[-0.01em]"
            >
              Виж плановете
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[12.5px] text-white/35">
            {[
              '4 800+ ученика',
              '500+ теста',
              '200+ аудио урока',
              'Работи на телефон',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
