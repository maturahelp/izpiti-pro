'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  generatedEnglishMaterialSections,
  generatedEnglishQuestionCount,
  generatedEnglishReadingQuestionCount,
  generatedEnglishWritingQuestionCount,
  type GeneratedEnglishQuestion,
} from '@/lib/english-generated-materials'

const readingSections = generatedEnglishMaterialSections.filter((section) => section.mode === 'reading')
const writingSections = generatedEnglishMaterialSections.filter((section) => section.mode === 'writing')

interface EnglishGeneratedMaterialsPageProps {
  backHref?: string
  backLabel?: string
}

export function EnglishGeneratedMaterialsPage({
  backHref = '/dashboard/tests',
  backLabel = 'Към тестовете',
}: EnglishGeneratedMaterialsPageProps) {
  const [choiceAnswers, setChoiceAnswers] = useState<Record<number, string>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-300 bg-[#e6ddcd] text-stone-950">
      <div className="px-4 py-6 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">
              Практика по английски
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
              500 задачи по английски език за ДЗИ
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Reading passages и writing prompts по модела на изпита. Използвай ги за самостоятелна практика,
              повторение и допълнителна тренировка по най-често срещаните формати.
            </p>
          </div>
          <Link
            href={backHref}
            className="rounded-full border border-stone-600 bg-[#fffaf0] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-white"
          >
            {backLabel}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            {generatedEnglishQuestionCount} задачи
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            {generatedEnglishReadingQuestionCount} reading въпроса
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            {generatedEnglishWritingQuestionCount} writing теми
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            Listening не е включен
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            Ориентир: ниво B2
          </span>
        </div>

        <article className="mt-8 border border-stone-500 bg-[#fffdf8] shadow-[0_24px_60px_rgba(41,31,17,0.22)]">
          <header className="border-b border-stone-400 px-6 py-7 text-center md:px-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600">
              Английски език - 12 клас
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Reading и Writing практика</h2>
            <p className="mt-4 text-sm leading-7 text-stone-700">
              Подбрахме reading тестове и writing теми в един поток, за да можеш да решаваш директно в платформата.
            </p>
          </header>

          <div className="px-4 py-4 md:px-8 md:py-8">
            <MaterialCategoryHeader
              id="reading"
              eyebrow="Reading"
              title="45 Reading Comprehension Tests"
              description="Всеки reading тест включва един текст и 10 ABCD въпроса. Можеш да ги решаваш по ред или да отваряш директно конкретен раздел."
              stats={`${generatedEnglishReadingQuestionCount} ABCD въпроса`}
            />

            {readingSections.map((section, sectionIndex) => (
              <MaterialSection
                key={section.id}
                section={section}
                className={sectionIndex === 0 ? 'mt-5' : 'mt-10 border-t border-dashed border-stone-300 pt-10'}
                choiceAnswers={choiceAnswers}
                openAnswers={openAnswers}
                revealed={revealed}
                setChoiceAnswers={setChoiceAnswers}
                setOpenAnswers={setOpenAnswers}
                setRevealed={setRevealed}
              />
            ))}

            <MaterialCategoryHeader
              id="writing"
              eyebrow="Writing"
              title="50 Writing Prompts"
              description="Formal letters, opinion essays, stories и descriptions, подредени като отделен writing банк за допълнителна тренировка."
              stats={`${generatedEnglishWritingQuestionCount} writing задачи`}
              className="mt-12"
            />

            {writingSections.map((section, sectionIndex) => (
              <MaterialSection
                key={section.id}
                section={section}
                className={sectionIndex === 0 ? 'mt-5' : 'mt-10 border-t border-dashed border-stone-300 pt-10'}
                choiceAnswers={choiceAnswers}
                openAnswers={openAnswers}
                revealed={revealed}
                setChoiceAnswers={setChoiceAnswers}
                setOpenAnswers={setOpenAnswers}
                setRevealed={setRevealed}
              />
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function MaterialCategoryHeader({
  id,
  eyebrow,
  title,
  description,
  stats,
  className = '',
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  stats: string
  className?: string
}) {
  return (
    <div id={id} className={`${className} scroll-mt-6 rounded-[2rem] border border-stone-300 bg-stone-950 px-5 py-6 text-white md:px-8`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-serif text-3xl">{title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-200">{description}</p>
        </div>
        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
          {stats}
        </span>
      </div>
    </div>
  )
}

function MaterialSection({
  section,
  className,
  choiceAnswers,
  openAnswers,
  revealed,
  setChoiceAnswers,
  setOpenAnswers,
  setRevealed,
}: {
  section: (typeof generatedEnglishMaterialSections)[number]
  className: string
  choiceAnswers: Record<number, string>
  openAnswers: Record<number, string>
  revealed: Record<number, boolean>
  setChoiceAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  setOpenAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  setRevealed: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}) {
  return (
    <section id={section.id} className={`${className} scroll-mt-6`}>
      <div className="border border-stone-300 bg-[#fcf7ee] px-4 py-4 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          {section.mode === 'writing' ? 'Writing' : 'Reading Comprehension'}
        </p>
        <h3 className="mt-2 font-serif text-2xl">{section.title}</h3>
        <p className="mt-2 text-sm leading-7 text-stone-700">{section.sourceNote}</p>
      </div>

      {section.passage && (
        <div className="border-x border-b border-stone-300 bg-white px-5 py-6 md:px-10">
          <div className="space-y-5 text-[1.04rem] leading-8 text-stone-900">
            {section.passage.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div className="border-x border-b border-stone-300 bg-[#fffdfa]">
        {section.questions.map((question) => (
          <QuestionRow
            key={question.id}
            question={question}
            choiceValue={choiceAnswers[question.id]}
            openValue={openAnswers[question.id] || ''}
            revealed={Boolean(revealed[question.id])}
            onChoiceChange={(value) =>
              setChoiceAnswers((prev) => ({ ...prev, [question.id]: value }))
            }
            onOpenChange={(value) =>
              setOpenAnswers((prev) => ({ ...prev, [question.id]: value }))
            }
            onToggleReveal={() =>
              setRevealed((prev) => ({ ...prev, [question.id]: !prev[question.id] }))
            }
          />
        ))}
      </div>
    </section>
  )
}

function QuestionRow({
  question,
  choiceValue,
  openValue,
  revealed,
  onChoiceChange,
  onOpenChange,
  onToggleReveal,
}: {
  question: GeneratedEnglishQuestion
  choiceValue?: string
  openValue: string
  revealed: boolean
  onChoiceChange: (value: string) => void
  onOpenChange: (value: string) => void
  onToggleReveal: () => void
}) {
  return (
    <article className="border-t border-stone-200 px-5 py-5 first:border-t-0 md:px-8">
      <div className="grid gap-4 md:grid-cols-[72px_minmax(0,1fr)]">
        <div className="text-lg font-semibold text-stone-500">{question.id}.</div>
        <div>
          <h3 className="whitespace-pre-wrap text-base leading-7 text-stone-900">{question.prompt}</h3>

          {question.type === 'single_choice' ? (
            <div className="mt-4 space-y-2.5">
              {Object.entries(question.options).map(([label, option]) => {
                const selected = choiceValue === label

                return (
                  <label
                    key={`${question.id}-${label}`}
                    className={`flex cursor-pointer items-start gap-3 border px-3 py-3 text-sm leading-6 transition ${
                      selected
                        ? 'border-stone-900 bg-[#f6efdf]'
                        : 'border-stone-300 bg-white hover:bg-[#faf6ee]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`generated-question-${question.id}`}
                      checked={selected}
                      onChange={() => onChoiceChange(label)}
                      className="mt-1"
                    />
                    <span className="inline-flex min-w-7 justify-center font-semibold text-stone-700">{label})</span>
                    <span className="whitespace-pre-wrap">{option}</span>
                  </label>
                )
              })}
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
                <span className="rounded-full bg-[#f6efdf] px-3 py-1 font-semibold">
                  Обем: {question.wordLimit}
                </span>
                <span className="rounded-full bg-[#f6efdf] px-3 py-1 font-semibold">
                  Умение: {question.skill}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-stone-200 bg-[#fffaf2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Насоки</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                  {question.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-stone-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <textarea
                rows={10}
                value={openValue}
                onChange={(event) => onOpenChange(event.target.value)}
                placeholder="Напиши своя отговор тук..."
                className="mt-4 w-full resize-y border border-stone-300 bg-[linear-gradient(to_bottom,transparent_0,transparent_35px,#e9dfcf_36px)] px-4 py-3 text-sm leading-9 text-stone-900 outline-none transition focus:border-stone-700 focus:bg-white"
              />
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggleReveal}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#f6efdf]"
            >
              {revealed ? 'Скрий насоките' : 'Покажи насоките'}
            </button>
            <span className="text-xs text-stone-500">Умение: {question.skill}</span>
          </div>

          {revealed && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {question.type === 'single_choice' ? 'Верен отговор' : 'Checklist'}
              </p>
              {question.type === 'single_choice' ? (
                <p className="mt-2 text-sm font-semibold text-emerald-900">
                  {question.correctOption}) {question.options[question.correctOption]}
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
                  {question.checklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-700" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
