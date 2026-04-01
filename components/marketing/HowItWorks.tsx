import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const steps = [
  {
    step: '01',
    title: 'Създай профил',
    description: 'Регистрирай се безплатно за 30 секунди. Не се изисква кредитна карта.',
  },
  {
    step: '02',
    title: 'Избери клас и изпит',
    description: 'Посочи дали се готвиш за НВО (7. клас) или ДЗИ (12. клас) и кой предмет.',
  },
  {
    step: '03',
    title: 'Учи по теми',
    description: 'Следвай структурирания учебен план — слушай аудио уроци и преглеждай материали по теми.',
  },
  {
    step: '04',
    title: 'Решавай тестове',
    description: 'Провери знанията си с интерактивни тестове. Получи незабавна обратна връзка и обяснения.',
  },
  {
    step: '05',
    title: 'Ползвай AI помощ',
    description: 'Когато нещо е неясно, AI помощникът обяснява темата по-лесно и отговаря на въпросите ти.',
  },
  {
    step: '06',
    title: 'Следи напредъка си',
    description: 'Виж ясно къде се намираш и кои теми трябват повече внимание. Напредвай уверено.',
  },
]

export function HowItWorks() {
  return (
    <section id="kak-raboti" className="py-20 md:py-28 bg-white border-y border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Как работи</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            От нула до уверено на изпита
          </h2>
          <p className="text-[16px] text-text-muted max-w-xl mx-auto leading-[1.7]">
            Шест прости стъпки, с които започваш подготовката и виждаш реален напредък.
          </p>
        </FadeIn>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {steps.map((s) => (
            <StaggerItem key={s.step}>
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(15,23,42,0.06)] group-hover:border-primary/30 group-hover:bg-primary/[0.04] transition-colors duration-200">
                    <span className="text-[11px] font-bold text-primary/80 tabular-nums">{s.step}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-text text-[14.5px] mb-1.5 tracking-[-0.01em]">{s.title}</h3>
                  <p className="text-[13.5px] text-text-muted leading-relaxed">{s.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
