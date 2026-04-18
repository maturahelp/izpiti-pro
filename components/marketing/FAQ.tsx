'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

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
    q: 'Как да избера правилния план?',
    a: 'Ако се готвиш за НВО, избери НВО план. Ако се готвиш за ДЗИ, избери ДЗИ план. Ако искаш достъп до всичко, най-подходящ е семейният план.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="chesto-zadavani-vaprosi" className="relative py-16 md:py-24 bg-gradient-to-b from-[#F8FAFF] to-white">
      <span id="faq" className="absolute -top-20" aria-hidden="true" />
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e2a4a]">
            Често задавани въпроси
          </h2>
        </FadeIn>

        <StaggerChildren className="space-y-4">
          {faqs.map((faq, i) => (
            <StaggerItem key={faq.q}>
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="text-sm font-bold text-[#1e2a4a]">{faq.q}</span>
                  <motion.svg
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('w-5 h-5 flex-shrink-0 transition-colors', openIndex === i ? 'text-[#3b82f6]' : 'text-gray-400')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
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
