import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const previews = [
  {
    label: 'Тестове',
    title: 'Реши тест и виж грешките си веднага',
    description: 'Интерактивни тестове с незабавна обратна връзка и обяснение за всяка грешка.',
    color: '#1B4FD8',
    placeholder: (
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.07)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-wide">Въпрос 3 от 20</span>
          <span className="text-[11px] text-text-muted">НВО — БЕЛ</span>
        </div>
        <div className="h-3 bg-[#E2E8F0] rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '15%' }} />
        </div>
        <p className="text-[13px] font-medium text-text mb-4 leading-snug">
          Кое от изречените по-долу съдържа правописна грешка?
        </p>
        {['Той се усмихна широко.', 'Тя беше много умна.', 'Детето плачеше тихо.', 'Вятъра духаше силно.'].map((opt, i) => (
          <div
            key={opt}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border mb-2 text-[12.5px] ${
              i === 3
                ? 'border-success/40 bg-success/5 text-success font-medium'
                : 'border-[#E2E8F0] text-text-muted'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${i === 3 ? 'border-success bg-success' : 'border-[#D1D9E6]'}`}>
              {i === 3 && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            {opt}
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Аудио уроци',
    title: 'Слушай уроци навсякъде, по всяко време',
    description: 'Кратки уроци от 5 до 20 минути с транскрипт и свързан тест след всеки.',
    color: '#D97706',
    placeholder: (
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text">Правопис и пунктуация</p>
            <p className="text-[11px] text-text-muted">Урок 3 · 8 мин.</p>
          </div>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-3">
            <button className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
            </div>
            <span className="text-[11px] text-text-muted tabular-nums">2:47</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {['Въпросителен знак след пряк въпрос', 'Запетая пред "но" и "а"', 'Точка след съкращение'].map((line) => (
            <div key={line} className="flex items-center gap-2 text-[12px] text-text-muted">
              <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
              {line}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'AI помощник',
    title: 'Попитай AI — получи ясен отговор',
    description: 'AI помощникът обяснява теми, анализира грешките ти и предлага следващи стъпки.',
    color: '#7C3AED',
    placeholder: (
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.07)]">
        <div className="space-y-3">
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#F3F0FF] border border-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl px-4 py-3 text-[12.5px] text-text-muted max-w-[85%] border border-[#E2E8F0]">
              Защо "Вятъра духаше" е грешно?
            </div>
          </div>
          <div className="flex gap-2.5 justify-end">
            <div className="bg-primary/[0.07] rounded-xl px-4 py-3 text-[12.5px] text-text max-w-[85%] border border-primary/10 leading-relaxed">
              "Вятърът" е подлог и трябва да е в именителен падеж. Правилно: <span className="font-semibold text-primary">"Вятърът духаше силно."</span>
              <br /><br />
              Запомни: подлозите завършват на <span className="font-semibold">-ът/-ят</span>.
            </div>
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
          <span className="text-[12px] text-text-muted/50 flex-1">Задай следващ въпрос...</span>
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    ),
  },
]

export function ProductPreview() {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Платформата</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Виж как изглежда отвътре
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Тестове, аудио уроци и AI помощник — всичко в една платформа, без да прескачаш между сайтове.
          </p>
        </FadeIn>

        <StaggerChildren className="grid lg:grid-cols-3 gap-6">
          {previews.map((preview) => (
            <StaggerItem key={preview.label}>
              <div className="flex flex-col gap-4">
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.07em] mb-1 inline-block"
                    style={{ color: preview.color }}
                  >
                    {preview.label}
                  </span>
                  <h3 className="font-semibold text-text text-[14.5px] leading-snug tracking-[-0.01em] mb-1">
                    {preview.title}
                  </h3>
                  <p className="text-[13px] text-text-muted leading-relaxed">{preview.description}</p>
                </div>
                {preview.placeholder}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
