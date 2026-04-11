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

export default function EnglishGeneratedMaterialsPage() {
  const [choiceAnswers, setChoiceAnswers] = useState<Record<number, string>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  return (
    <main className="min-h-screen bg-[#e6ddcd] text-stone-950">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">
              Generated Materials Preview
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
              500 English DZI-Style Practice Questions
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              A review page for generated 12th grade English materials. It follows the official exam patterns with
              ABCD reading comprehension and DZI-style writing prompts.
            </p>
          </div>
          <Link
            href="/english-mock"
            className="rounded-full border border-stone-600 bg-[#fffaf0] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-white"
          >
            Back to Official Mocks
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            {generatedEnglishQuestionCount} questions
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            {generatedEnglishReadingQuestionCount} ABCD reading
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            {generatedEnglishWritingQuestionCount} writing
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            Listening excluded
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            B2-oriented
          </span>
          <span className="rounded-full border border-stone-400 bg-[#fbf4e8] px-3 py-1.5">
            Materials section draft
          </span>
        </div>

        <article className="mt-8 border border-stone-500 bg-[#fffdf8] shadow-[0_24px_60px_rgba(41,31,17,0.22)]">
          <header className="border-b border-stone-400 px-6 py-7 text-center md:px-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600">
              Английски език - 12 клас
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Generated Reading and Writing Practice</h2>
            <p className="mt-4 text-sm leading-7 text-stone-700">
              Use this page to review the final split before adding the generated bank to the materials section.
            </p>
          </header>

          <div className="px-4 py-4 md:px-8 md:py-8">
            <MaterialCategoryHeader
              eyebrow="Reading"
              title="45 Reading Comprehension Tests"
              description="Each reading test contains one passage and 10 ABCD questions. These are grouped separately from writing so they can be moved directly into the reading part of the materials section."
              stats={`${generatedEnglishReadingQuestionCount} ABCD questions`}
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
              eyebrow="Writing"
              title="50 Writing Prompts"
              description="Formal letters, opinion essays, stories and descriptions are grouped here as a separate writing bank."
              stats={`${generatedEnglishWritingQuestionCount} writing tasks`}
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
      </section>
    </main>
  )
}

function MaterialCategoryHeader({
  eyebrow,
  title,
  description,
  stats,
  className = '',
}: {
  eyebrow: string
  title: string
  description: string
  stats: string
  className?: string
}) {
  return (
    <div className={`${className} rounded-[2rem] border border-stone-300 bg-stone-950 px-5 py-6 text-white md:px-8`}>
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
    <section className={className}>
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
  const skillLabel = question.skill

  return (
    <article className="border-t border-stone-200 px-5 py-5 first:border-t-0 md:px-8">
      <div className="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
        <div className="text-lg font-semibold text-stone-500">{question.id}.</div>
        <div>
          <div className="mb-3 inline-flex rounded-full bg-[#f1eadc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
            {skillLabel}
          </div>

          {question.type === 'writing' ? (
            <WritingQuestion
              question={question}
              value={openValue}
              revealed={revealed}
              onChange={onOpenChange}
              onToggleReveal={onToggleReveal}
            />
          ) : (
            <ChoiceQuestion
              question={question}
              value={choiceValue}
              revealed={revealed}
              onChange={onChoiceChange}
              onToggleReveal={onToggleReveal}
            />
          )}
        </div>
      </div>
    </article>
  )
}

function ChoiceQuestion({
  question,
  value,
  revealed,
  onChange,
  onToggleReveal,
}: {
  question: Extract<GeneratedEnglishQuestion, { type: 'single_choice' }>
  value?: string
  revealed: boolean
  onChange: (value: string) => void
  onToggleReveal: () => void
}) {
  return (
    <div>
      <h4 className="whitespace-pre-wrap text-base leading-7 text-stone-900">{question.prompt}</h4>
      <div className="mt-4 space-y-2.5">
        {Object.entries(question.options).map(([label, option]) => {
          const selected = value === label
          const correct = question.correctOption === label
          const showCorrect = revealed && correct

          return (
            <label
              key={`${question.id}-${label}`}
              className={`flex cursor-pointer items-start gap-3 border px-3 py-3 text-sm leading-6 transition ${
                showCorrect
                  ? 'border-emerald-700 bg-emerald-50'
                  : selected
                    ? 'border-stone-900 bg-[#f6efdf]'
                    : 'border-stone-300 bg-white hover:bg-[#faf6ee]'
              }`}
            >
              <input
                type="radio"
                name={`generated-q-${question.id}`}
                checked={selected}
                onChange={() => onChange(label)}
                className="mt-1"
              />
              <span className="inline-flex min-w-7 justify-center font-semibold text-stone-700">{label})</span>
              <span className="whitespace-pre-wrap">{option}</span>
            </label>
          )
        })}
      </div>
      <RevealButton revealed={revealed} onClick={onToggleReveal} />
      {revealed && (
        <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Correct answer: {question.correctOption}
        </p>
      )}
    </div>
  )
}

function WritingQuestion({
  question,
  value,
  revealed,
  onChange,
  onToggleReveal,
}: {
  question: Extract<GeneratedEnglishQuestion, { type: 'writing' }>
  value: string
  revealed: boolean
  onChange: (value: string) => void
  onToggleReveal: () => void
}) {
  return (
    <div>
      <h4 className="whitespace-pre-wrap text-base leading-7 text-stone-900">{question.prompt}</h4>
      <p className="mt-2 text-sm font-semibold text-stone-700">Word limit: {question.wordLimit}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-800">
        {question.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-500" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <textarea
        rows={10}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your draft here..."
        className="mt-4 w-full resize-y border border-stone-300 bg-[linear-gradient(to_bottom,transparent_0,transparent_35px,#e9dfcf_36px)] px-4 py-3 text-sm leading-9 text-stone-900 outline-none transition focus:border-stone-700 focus:bg-white"
      />
      <RevealButton revealed={revealed} onClick={onToggleReveal} label="Show checklist" hideLabel="Hide checklist" />
      {revealed && (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">
          <p className="font-semibold">Checklist</p>
          <ul className="mt-2 space-y-1">
            {question.checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RevealButton({
  revealed,
  onClick,
  label = 'Show answer',
  hideLabel = 'Hide answer',
}: {
  revealed: boolean
  onClick: () => void
  label?: string
  hideLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 rounded-full border border-stone-400 bg-[#fff8ec] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700 transition hover:bg-white"
    >
      {revealed ? hideLabel : label}
    </button>
  )
}
