'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const faqs = [
  {
    q: 'За кой клас е платформата?',
    a: 'MaturaHelp е създадена за ученици от 7. клас, подготвящи се за НВО, и за ученици от 12. клас, подготвящи се за ДЗИ. Съдържанието е разделено по клас и предмет.',
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
    a: 'Да. MaturaHelp работи напълно от всеки браузър — телефон, таблет или компютър. Не е нужна инсталация на приложение.',
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
    <section id="chesto-zadavani-vaprosi" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">ЧЗВ</p>
          <h2 className="text-[2rem] md:text-[2.5rem] font-serif font-bold text-text tracking-[-0.03em] mb-4">
            Често задавани въпроси
          </h2>
          <p className="text-[16px] text-text-muted leading-[1.7]">
            Не намираш отговор? Пиши ни на{' '}
            <a href="mailto:support@izpitipro.bg" className="text-primary hover:text-primary-dark transition-colors underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60">
              support@izpitipro.bg
            </a>
          </p>
        </FadeIn>

        <StaggerChildren className="space-y-2">
          {faqs.map((faq, i) => (
            <StaggerItem key={faq.q}>
              <div className={cn(
                'rounded-2xl border transition-all duration-200 overflow-hidden',
                openIndex === i
                  ? 'bg-white border-[#E2E8F0] shadow-[0_2px_8px_rgba(15,23,42,0.06),0_0_0_1px_rgba(15,23,42,0.03)]'
                  : 'bg-white/60 border-[#E2E8F0] hover:bg-white hover:border-[#D1D9E6]'
              )}>
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors duration-150"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className={cn(
                    'font-semibold text-[14px] pr-4 tracking-[-0.01em] transition-colors duration-150',
                    openIndex === i ? 'text-text' : 'text-text/80'
                  )}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="flex-shrink-0"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={cn(
                        'transition-colors duration-150',
                        openIndex === i ? 'text-primary' : 'text-text-light'
                      )}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-6 pb-5">
                        <p className="text-[13.5px] text-text-muted leading-[1.75]">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
