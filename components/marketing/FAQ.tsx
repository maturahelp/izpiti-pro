'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

const faqs = [
  {
    q: 'За кои класове е платформата?',
    a: 'MaturaHelp е за ученици от 7. клас, подготвящи се за НВО, и за ученици от 12. клас, подготвящи се за ДЗИ. Съдържанието е разделено по клас, предмет и тема.',
  },
  {
    q: 'Кои предмети са включени?',
    a: 'За НВО (7. клас): Български език и Математика. За ДЗИ (12. клас): Български език и литература, Математика, История, География, Биология, Химия и Физика. Добавяме нови предмети редовно.',
  },
  {
    q: 'Какво получавам в безплатния план?',
    a: 'Безплатният план включва 5 теста на месец, 3 аудио урока и достъп до избрани учебни материали. Достатъчно е, за да видиш как работи платформата и дали начинът на учене е подходящ за теб.',
  },
  {
    q: 'Как работи AI помощникът?',
    a: 'Задай въпрос по дадена тема или помоли да обясни защо даден отговор е грешен. AI помощникът отговаря на български, адаптира обяснението към нивото ти и предлага следващи стъпки за учене.',
  },
  {
    q: 'Мога ли да уча от телефон?',
    a: 'Да. MaturaHelp работи напълно от всеки браузър — телефон, таблет или компютър. Не е нужна инсталация на приложение. Аудио уроците са особено удобни за слушане в транспорта.',
  },
  {
    q: 'Подходящо ли е, ако изоставам с материала?',
    a: 'Да, точно за такива случаи е направена платформата. Структурираният учебен план помага да нагониш материала стъпка по стъпка. AI помощникът обяснява по-лесно темите, с които имаш затруднения.',
  },
  {
    q: 'Може ли родител да закупи абонамента?',
    a: 'Да. Родителите могат да закупят Премиум абонамент за детето си. Акаунтът се ползва от ученика, а плащането се извършва стандартно с карта. При въпроси пишете ни на support@maturahelp.bg.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="chesto-zadavani-vaprosi" className="py-20 md:py-28 bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-7">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">ЧЗВ</p>
          <h2 className="text-[2rem] md:text-[2.6rem] font-black text-[#0F172A] tracking-[-0.04em] mb-4">
            Често задавани въпроси
          </h2>
          <p className="text-[16px] text-[#64748B] leading-[1.7]">
            Не намираш отговор? Пиши ни на{' '}
            <a href="mailto:support@maturahelp.bg" className="text-primary hover:text-primary-dark transition-colors underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60 font-bold">
              support@maturahelp.bg
            </a>
          </p>
        </FadeIn>

        <StaggerChildren className="space-y-2.5">
          {faqs.map((faq, i) => (
            <StaggerItem key={faq.q}>
              <div className={cn(
                'rounded-2xl border transition-all duration-200 overflow-hidden',
                openIndex === i
                  ? 'bg-white border-[#1B4FD8]/20 shadow-[0_4px_16px_rgba(27,79,216,0.08),0_1px_4px_rgba(27,79,216,0.05)]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]'
              )}>
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors duration-150"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className={cn(
                    'font-extrabold text-[14px] pr-4 tracking-[-0.02em] transition-colors duration-150',
                    openIndex === i ? 'text-[#0F172A]' : 'text-[#0F172A]/75'
                  )}>
                    {faq.q}
                  </span>
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    openIndex === i ? 'bg-primary' : 'bg-[#E2E8F0]'
                  )}>
                    <motion.div
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className={openIndex === i ? 'text-white' : 'text-[#64748B]'}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </motion.div>
                  </div>
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
                        <div className="w-full h-px bg-[#E2E8F0] mb-4" />
                        <p className="text-[13.5px] text-[#475569] leading-[1.8]">{faq.a}</p>
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
