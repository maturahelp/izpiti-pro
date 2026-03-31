'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'За кой клас е платформата?',
    a: 'ИзпитиПро е създадена за ученици от 7. клас, подготвящи се за НВО, и за ученици от 12. клас, подготвящи се за ДЗИ. Съдържанието е разделено по клас и предмет.',
  },
  {
    q: 'Какво е включено в безплатния план?',
    a: 'Безплатният план включва 5 теста на месец, 3 аудио урока и достъп до избрани учебни материали. Достатъчно е, за да опиташ платформата и да видиш дали работи за теб.',
  },
  {
    q: 'Как работи AI помощникът?',
    a: 'AI помощникът е обучен специално за съдържанието на НВО и ДЗИ. Задай въпрос по дадена тема или помоли да обясни защо даден отговор е грешен. Помощникът отговаря на български и адаптира обяснението към нивото ти.',
  },
  {
    q: 'Има ли безплатен пробен период за Премиум?',
    a: 'Да. Можеш да ползваш Премиум план 7 дни безплатно без кредитна карта. Ако не сте доволни, отменяш преди изтичането и не плащаш нищо.',
  },
  {
    q: 'Работи ли платформата на телефон?',
    a: 'Да. ИзпитиПро работи напълно от всеки браузър — телефон, таблет или компютър. Не е нужна инсталация на приложение.',
  },
  {
    q: 'Как работи абонаментът и как го спирам?',
    a: 'Абонаментът се подновява автоматично всеки месец (или година, ако сте избрали годишен план). Можеш да го спреш по всяко време от страницата "Абонамент" в профила си. Достъпът остава активен до края на платения период.',
  },
  {
    q: 'Дали новото съдържание се добавя редовно?',
    a: 'Да. Добавяме нови тестове, аудио уроци и материали всяка седмица. Следваме актуалната учебна програма на МОН за НВО и ДЗИ.',
  },
  {
    q: 'Мога ли да използвам платформата за няколко предмета едновременно?',
    a: 'Да. С Премиум план имаш достъп до всички предмети и изпити. Можеш да готвиш и за НВО по БЕЛ и по Математика едновременно, или за ДЗИ по няколко предмета.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="chesto-zadavani-vaprosi" className="py-16 md:py-24 bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">ЧЗВ</p>
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            Често задавани въпроси
          </h2>
          <p className="text-text-muted text-lg">
            Не намираш отговор? Пиши ни на{' '}
            <a href="mailto:support@izpitipro.bg" className="text-primary hover:underline">
              support@izpitipro.bg
            </a>
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-text text-sm pr-4">{faq.q}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    'flex-shrink-0 text-text-muted transition-transform duration-200',
                    openIndex === i && 'rotate-180'
                  )}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
