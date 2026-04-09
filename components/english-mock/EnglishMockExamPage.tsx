'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { buildEnglishMockGroups } from '@/lib/english-mock'
import type { OfficialEnglishExam } from '@/lib/official-english-mock-data'

export function EnglishMockExamPage({
  exam,
  backHref = '/english-mock',
  backLabel = 'Back to Mock Website',
}: {
  exam: OfficialEnglishExam
  backHref?: string
  backLabel?: string
}) {
  const [choiceAnswers, setChoiceAnswers] = useState<Record<number, string>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({})

  const groups = useMemo(() => buildEnglishMockGroups(exam), [exam])
  const readingCount = exam.questions.filter((question) => question.section !== 'writing').length
  const writingCount = exam.questions.filter((question) => question.section === 'writing').length

  return (
    <main className="min-h-screen bg-[#dfd6c7] text-stone-900">
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
            <span className="rounded-full border border-stone-400 bg-[#f6f0e5] px-3 py-1">Reading Only</span>
            <span className="rounded-full border border-stone-400 bg-[#f6f0e5] px-3 py-1">Writing Included</span>
            <span className="rounded-full border border-stone-400 bg-[#f6f0e5] px-3 py-1">Listening Excluded</span>
          </div>
          <Link
            href={backHref}
            className="rounded-full border border-stone-500 bg-[#fffaf0] px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            {backLabel}
          </Link>
        </div>

        <article className="mx-auto mt-5 max-w-4xl border border-stone-500 bg-[#fffdf8] shadow-[0_24px_60px_rgba(41,31,17,0.24)]">
          <header className="border-b border-stone-400 px-6 py-8 text-center md:px-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-600">Interactive Mock Website</p>
            <h1 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              {exam.level ? `English DZI ${exam.level}` : 'English DZI'} {exam.year}
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-700">{exam.source_title}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-700">
              <span className="border border-stone-300 bg-[#faf4e9] px-3 py-1.5">{readingCount} reading tasks</span>
              <span className="border border-stone-300 bg-[#faf4e9] px-3 py-1.5">{writingCount} writing tasks</span>
              <span className="border border-stone-300 bg-[#faf4e9] px-3 py-1.5">Original exam numbering preserved</span>
            </div>
          </header>

          <div className="px-4 py-4 md:px-8 md:py-8">
            {groups.map((group, index) => (
              <section
                key={group.key}
                className={index === 0 ? '' : 'mt-8 border-t border-dashed border-stone-300 pt-8'}
              >
                {(() => {
                  const isWritingGroup = group.questions.some((question) => question.section === 'writing')

                  return (
                <div className="border border-stone-300 bg-[#fcf7ee] px-4 py-3 md:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    {isWritingGroup ? 'Writing' : 'Reading Comprehension'}
                  </p>
                  {!isWritingGroup && <h2 className="mt-2 font-serif text-2xl">{group.title}</h2>}
                  {group.instruction && (
                    <p className={`${isWritingGroup ? 'mt-1' : 'mt-3'} whitespace-pre-wrap text-sm leading-7 text-stone-700`}>
                      {group.instruction}
                    </p>
                  )}
                </div>
                  )
                })()}

                {group.paragraphs.length > 0 && (
                  <div className="border-x border-b border-stone-300 bg-white px-5 py-6 md:px-10">
                    <div className="space-y-5 text-[1.04rem] leading-8 text-stone-900">
                      {group.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex} className="whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-x border-b border-stone-300 bg-[#fffdfa]">
                  {group.questions.map((question) =>
                    question.type === 'single_choice' ? (
                      <ChoiceRow
                        key={question.number}
                        number={question.original_number}
                        prompt={question.question}
                        options={Object.entries(question.options || {})}
                        value={choiceAnswers[question.number]}
                        onChange={(value) =>
                          setChoiceAnswers((prev) => ({ ...prev, [question.number]: value }))
                        }
                      />
                    ) : (
                      <OpenRow
                        key={question.number}
                        number={question.original_number}
                        prompt={question.question}
                        rows={question.section === 'writing' ? 12 : 4}
                        value={openAnswers[question.number] || ''}
                        onChange={(value) =>
                          setOpenAnswers((prev) => ({ ...prev, [question.number]: value }))
                        }
                      />
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}

function ChoiceRow({
  number,
  prompt,
  options,
  value,
  onChange,
}: {
  number: number
  prompt: string
  options: Array<[string, string]>
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <article className="border-t border-stone-200 px-5 py-5 first:border-t-0 md:px-8">
      <div className="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
        <div className="text-lg font-semibold text-stone-500">{number}.</div>
        <div>
          <h3 className="whitespace-pre-wrap text-base leading-7 text-stone-900">{prompt}</h3>
          <div className="mt-4 space-y-2.5">
            {options.map(([label, option]) => {
              const selected = value === label

              return (
                <label
                  key={`${number}-${label}`}
                  className={`flex cursor-pointer items-start gap-3 border px-3 py-3 text-sm leading-6 transition ${
                    selected
                      ? 'border-stone-900 bg-[#f6efdf]'
                      : 'border-stone-300 bg-white hover:bg-[#faf6ee]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${number}`}
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
        </div>
      </div>
    </article>
  )
}

function OpenRow({
  number,
  prompt,
  rows,
  value,
  onChange,
}: {
  number: number
  prompt: string
  rows: number
  value: string
  onChange: (value: string) => void
}) {
  return (
    <article className="border-t border-stone-200 px-5 py-5 first:border-t-0 md:px-8">
      <div className="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
        <div className="text-lg font-semibold text-stone-500">{number}.</div>
        <div>
          <h3 className="whitespace-pre-wrap text-base leading-7 text-stone-900">{prompt}</h3>
          <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your answer here..."
            className="mt-4 w-full resize-y border border-stone-300 bg-[linear-gradient(to_bottom,transparent_0,transparent_35px,#e9dfcf_36px)] px-4 py-3 text-sm leading-9 text-stone-900 outline-none transition focus:border-stone-700 focus:bg-white"
          />
        </div>
      </div>
    </article>
  )
}
