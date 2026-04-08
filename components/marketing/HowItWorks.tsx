import { FadeIn } from '@/components/ui/fade-in'
import Link from 'next/link'

const steps = [
  {
    step: '01',
    title: 'Създай профил',
    description: 'Регистрирай се безплатно за 30 секунди. Не се изисква кредитна карта.',
  },
  {
    step: '02',
    title: 'Учи по теми и слушай уроци',
    description: 'Следвай структурирания учебен план — слушай аудио уроци и преглеждай материали по теми.',
  },
  {
    step: '03',
    title: 'Решавай тестове и виж грешките си',
    description: 'Провери знанията си с интерактивни тестове. Получи незабавна обратна връзка и обяснения за всяка грешка.',
  },
  {
    step: '04',
    title: 'Ползвай AI помощ и следи напредъка си',
    description: 'Когато нещо е неясно, AI помощникът обяснява темата по-лесно. Виж ясно напредъка си и кои теми трябват повече внимание.',
  },
]

export function HowItWorks() {
  return (
    <section id="kak-raboti" className="py-20 md:py-28 bg-[#FAF8F4] border-y border-[#E5E5E5]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <FadeIn className="mb-14">
          <p className="section-label mb-4">Как работи</p>
          <h2 className="text-[2rem] md:text-[2.8rem] font-extrabold text-[#0D0D0D] tracking-[-0.04em] leading-[1.05] max-w-2xl">
            От нула до уверено на изпита
          </h2>
          <p className="text-[16px] text-[#6B6B6B] max-w-xl mt-4 leading-[1.7]">
            Четири стъпки, с които започваш подготовката и виждаш реален напредък.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#E5E5E5]">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`p-7 bg-white hover:bg-[#FAF8F4] transition-colors duration-200 ${i < 3 ? 'border-r-0 sm:border-r border-b sm:border-b-0 border-[#E5E5E5]' : ''} ${i === 1 ? 'sm:border-b lg:border-b-0' : ''} ${i === 2 ? 'sm:border-r-0 border-b sm:border-b lg:border-b-0 lg:border-r border-[#E5E5E5]' : ''}`}
            >
              {/* Giant step number */}
              <div
                className="text-[5rem] font-extrabold leading-none mb-4 tracking-[-0.05em] select-none"
                style={{ color: i % 2 === 0 ? '#2563EB' : '#E5E5E5' }}
              >
                {s.step}
              </div>
              <h3 className="font-extrabold text-[#0D0D0D] text-[15px] mb-2 tracking-[-0.02em] leading-snug">
                {s.title}
              </h3>
              <p className="text-[13.5px] text-[#6B6B6B] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        <FadeIn delay={0.2} className="mt-8">
          <Link href="/dashboard" className="btn-secondary px-6 py-2.5 text-[14px]">
            Разгледай как работи
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
