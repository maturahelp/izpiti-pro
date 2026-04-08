import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'

export function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4FD8] via-[#1E3A8A] to-[#0F172A]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.3)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(14,30,90,0.6)_0%,transparent_60%)]" />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      {/* Decorative circles */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full border border-white/[0.05] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full border border-white/[0.03] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-7 text-center">
        <FadeIn>
          <p className="text-[0.6875rem] font-black tracking-[0.12em] uppercase text-white/40 mb-4">
            Започни сега
          </p>
          <h2 className="text-[2rem] md:text-[2.8rem] font-black text-white mb-5 text-balance tracking-[-0.04em] leading-[1.08]">
            Подготви се уверено за НВО и ДЗИ
          </h2>
          <p className="text-[16px] text-white/60 mb-10 max-w-xl mx-auto leading-[1.7]">
            Над 4 800 ученика вече ползват MaturaHelp. Стартирай безплатно — без кредитна карта.
            7 дни пробен период за Премиум план.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 justify-center px-8 py-3.5 bg-white text-primary font-black text-[14.5px] rounded-xl hover:bg-white/95 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.99] tracking-[-0.01em]"
            >
              Започни безплатно
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="#ceni"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 bg-white/[0.08] text-white font-bold text-[14.5px] rounded-xl hover:bg-white/[0.14] hover:border-white/30 transition-all duration-200 tracking-[-0.01em] hover:scale-[1.01]"
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
