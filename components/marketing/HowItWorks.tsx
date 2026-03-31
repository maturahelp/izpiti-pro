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
    <section id="kak-raboti" className="py-16 md:py-24 bg-white border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Как работи</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            От нула до уверено на изпита
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Шест прости стъпки, с които започваш подготовката и виждаш реален напредък.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{s.step}</span>
                </div>
                {i < steps.length - 1 && i % 3 !== 2 && (
                  <div className="hidden lg:block w-px h-full bg-border ml-5 mt-2" />
                )}
              </div>
              <div className="pt-1.5 pb-4">
                <h3 className="font-semibold text-text mb-1.5">{s.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
