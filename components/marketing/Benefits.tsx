'use client'

import { useState } from 'react'
import { FadeIn } from '@/components/ui/fade-in'

const videos = [
  {
    id: 'plan',
    title: 'Подредена подготовка',
    description: 'Всичко е подредено по предмети, теми и класове, за да учиш ясно и последователно.',
  },
  {
    id: 'tests',
    title: 'Интерактивни тестове',
    description: 'Решаваш задачи, получаваш обратна връзка веднага и виждаш къде да подобриш резултата си.',
  },
  {
    id: 'audio',
    title: 'Аудио и видео уроци',
    description: 'Когато искаш бърз преговор, можеш да слушаш или гледаш кратки и практични уроци.',
  },
  {
    id: 'ai',
    title: 'AI помощ при затруднение',
    description: 'При неясна тема получаваш обяснение на разбираем език и насоки за следващата стъпка.',
  },
]

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {direction === 'left' ? <path d="M15 18 9 12l6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

export function Benefits() {
  const [active, setActive] = useState(0)
  const current = videos[active]

  function prev() {
    setActive((v) => (v === 0 ? videos.length - 1 : v - 1))
  }

  function next() {
    setActive((v) => (v === videos.length - 1 ? 0 : v + 1))
  }

  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Защо MaturaHelp</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Как MaturaHelp ще ти помогне с матурите
          </h2>
          <p className="text-[16px] text-text-muted max-w-2xl mx-auto leading-[1.7]">
            Разгледай ключовите възможности на платформата през кратки демонстрационни видеа.
          </p>
        </FadeIn>

        <div className="max-w-4xl mx-auto border border-[#E2E8F0] bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Предишно видео"
              className="w-10 h-10 border border-[#E2E8F0] bg-white text-text hover:bg-[#F8FAFC] transition-colors flex items-center justify-center"
            >
              <ArrowIcon direction="left" />
            </button>

            <div className="text-center flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-[0.1em] text-text-muted mb-1">Функционалност</p>
              <h3 className="text-[19px] font-bold text-text tracking-[-0.02em] truncate">{current.title}</h3>
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Следващо видео"
              className="w-10 h-10 border border-[#E2E8F0] bg-white text-text hover:bg-[#F8FAFC] transition-colors flex items-center justify-center"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>

          <div className="aspect-video w-full bg-[#E2E8F0] border border-[#CBD5E1] flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-[12px] text-text-muted mb-2">Placeholder видео</p>
              <p className="text-[16px] font-semibold text-text">{current.title}</p>
            </div>
          </div>

          <p className="text-[14px] text-text-muted leading-relaxed mt-4 text-center">{current.description}</p>

          <div className="flex justify-center gap-2 mt-4">
            {videos.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(idx)}
                aria-label={`Видео ${idx + 1}`}
                className={`h-2.5 w-8 border transition-colors ${idx === active ? 'bg-primary border-primary' : 'bg-white border-[#CBD5E1]'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
