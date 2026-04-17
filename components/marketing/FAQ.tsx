'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'За кого е платформата?',
    a: 'Платформата е създадена за ученици, които се подготвят за НВО след 7. клас и ДЗИ след 12. клас. Съдържанието е организирано така, че да помага ясно, подредено и по изпитен формат.',
  },
  {
    q: 'Какво включва абонаментът?',
    a: 'Според избрания план получаваш достъп до видео уроци, учебни материали, тестове, задачи и AI помощник, който помага с обяснения и насоки по време на подготовката.',
  },
  {
    q: 'Колко време важи достъпът?',
    a: 'Това зависи от избрания план. Някои планове са с достъп за 1 месец, а други са валидни до края на изпитния период.',
  },
  {
    q: 'Какво представлява семейният план?',
    a: 'Семейният план дава достъп до НВО и ДЗИ подготовка в един общ абонамент. Подходящ е за семейства с повече от един ученик или ако искаш достъп до цялата платформа.',
  },
  {
    q: 'Как помага AI помощникът?',
    a: 'AI помощникът може да ти обяснява трудни теми, да ти помага при грешки и да те насочва какво да преговориш.',
  },
  {
    q: 'Подходяща ли е платформата за последна подготовка преди изпита?',
    a: 'Да. Платформата е полезна както за дългосрочна подготовка, така и за интензивно преговаряне преди изпита.',
  },
  {
    q: 'Нужни ли са допълнителни учебници или курсове?',
    a: 'Идеята на платформата е да събере най-важното на едно място, за да не се лута ученикът между различни сайтове, файлове и материали.',
  },
  {
    q: 'Как да избера правилния план?',
    a: 'Ако се готвиш за НВО, избери НВО план. Ако се готвиш за ДЗИ, избери ДЗИ план. Ако искаш достъп до всичко, най-подходящ е семейният план.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: '#1e2a4a' }}>
            Често задавани въпроси
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-bold" style={{ color: '#1e2a4a' }}>{faq.q}</span>
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform"
                  style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
