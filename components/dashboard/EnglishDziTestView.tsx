'use client'

import { buildEnglishMockGroups, type EnglishMockGroup } from '@/lib/english-mock'
import type { OfficialEnglishExam, OfficialEnglishQuestion } from '@/lib/official-english-mock-data'
import { cn } from '@/lib/utils'

type SingleChoiceAnswers = Record<number, string>
type OpenResponses = Record<number, Record<string, string>>

interface Props {
  exam: OfficialEnglishExam
  answers: SingleChoiceAnswers
  openResponses: OpenResponses
  submitted: boolean
  revealAnswers: boolean
  onAnswer: (num: number, val: string) => void
  onOpenResponse: (num: number, label: string, val: string) => void
}

export function EnglishDziTestView({
  exam,
  answers,
  openResponses,
  submitted,
  revealAnswers,
  onAnswer,
  onOpenResponse,
}: Props) {
  const groups = buildEnglishMockGroups(exam)
  if (!groups.length) return null

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <EnglishGroup
          key={group.key}
          group={group}
          examId={exam.id}
          answers={answers}
          openResponses={openResponses}
          submitted={submitted}
          revealAnswers={revealAnswers}
          onAnswer={onAnswer}
          onOpenResponse={onOpenResponse}
        />
      ))}
    </div>
  )
}

function EnglishGroup({
  group,
  examId,
  answers,
  openResponses,
  submitted,
  revealAnswers,
  onAnswer,
  onOpenResponse,
}: {
  group: EnglishMockGroup
  examId: string
  answers: SingleChoiceAnswers
  openResponses: OpenResponses
  submitted: boolean
  revealAnswers: boolean
  onAnswer: (num: number, val: string) => void
  onOpenResponse: (num: number, label: string, val: string) => void
}) {
  const isWriting = group.questions.every((q) => q.section === 'writing')
  const sectionLabel = isWriting ? 'WRITING' : 'READING COMPREHENSION'

  return (
    <div className="space-y-4">
      {/* Section label */}
      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-text-muted">
        {sectionLabel}
      </p>

      {/* Group title */}
      <h2 className="text-xl font-bold text-text leading-tight">{group.title}</h2>

      {/* Instruction (task directive, "BOTH tasks" note, etc.) */}
      {group.instruction && (
        <p className="text-sm text-text leading-relaxed">{group.instruction}</p>
      )}

      {/* Passage card */}
      {group.paragraphs.length > 0 && (
        <div className="card p-5 space-y-3">
          {group.paragraphs.map((para, i) => (
            <p key={i} className="text-sm text-text leading-relaxed whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6 pt-2">
        {group.questions.map((q) => (
          <EnglishQuestionItem
            key={q.number}
            question={q}
            examId={examId}
            answers={answers}
            openResponses={openResponses}
            submitted={submitted}
            revealAnswers={revealAnswers}
            onAnswer={onAnswer}
            onOpenResponse={onOpenResponse}
          />
        ))}
      </div>
    </div>
  )
}

function EnglishQuestionItem({
  question,
  examId,
  answers,
  openResponses,
  submitted,
  revealAnswers,
  onAnswer,
  onOpenResponse,
}: {
  question: OfficialEnglishQuestion
  examId: string
  answers: SingleChoiceAnswers
  openResponses: OpenResponses
  submitted: boolean
  revealAnswers: boolean
  onAnswer: (num: number, val: string) => void
  onOpenResponse: (num: number, label: string, val: string) => void
}) {
  const showFeedback = submitted || revealAnswers
  const chosen = answers[question.number]
  const isWriting = question.section === 'writing'

  const openState = openResponses[question.number] || {}
  const textareaValue = openState['Отговор'] || ''

  return (
    <div className="space-y-3">
      {/* Question number + text */}
      <div className="flex gap-3">
        <span className="text-sm font-semibold text-text-muted min-w-[2.25rem] leading-relaxed pt-0.5 flex-shrink-0">
          {question.number}.
        </span>
        <p className="flex-1 text-sm font-semibold text-text leading-relaxed whitespace-pre-wrap">
          {question.question}
        </p>
      </div>

      {/* Single choice options — bordered rows matching example format */}
      {question.type === 'single_choice' && question.options && (
        <div className="ml-9 border border-border rounded-xl overflow-hidden divide-y divide-border">
          {Object.entries(question.options).map(([label, text]) => {
            const isSelected = chosen === label
            const isCorrect = label === question.correct_option
            const showCorrect = showFeedback && isCorrect
            const showWrong = showFeedback && isSelected && !isCorrect

            return (
              <label
                key={label}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-sm select-none',
                  showCorrect
                    ? 'bg-green-50 text-green-800'
                    : showWrong
                    ? 'bg-red-50 text-red-800'
                    : isSelected
                    ? 'bg-primary-light text-primary'
                    : 'bg-white text-text hover:bg-gray-50'
                )}
              >
                <input
                  type="radio"
                  name={`english-q-${examId}-${question.number}`}
                  value={label}
                  checked={isSelected}
                  onChange={() => onAnswer(question.number, label)}
                  className="flex-shrink-0"
                />
                <span>
                  <span className="font-semibold">{label})</span>{' '}
                  {text}
                </span>
                {showCorrect && <span className="ml-auto font-bold text-green-600">✓</span>}
                {showWrong && <span className="ml-auto font-bold text-red-600">✗</span>}
              </label>
            )
          })}
        </div>
      )}

      {/* MC feedback */}
      {showFeedback && question.type === 'single_choice' && (
        <div
          className={cn(
            'ml-9 px-3 py-2 rounded-lg text-xs font-medium',
            chosen === question.correct_option
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          )}
        >
          {chosen ? `Your choice: ${chosen}.` : 'No answer selected.'}{' '}
          {chosen === question.correct_option
            ? `Correct: ${question.correct_option}.`
            : `Correct answer: ${question.correct_option}.`}
        </div>
      )}

      {/* Open response textarea */}
      {question.type === 'open_response' && (
        <div className="ml-9 space-y-2">
          <textarea
            rows={isWriting ? 8 : 3}
            placeholder="Write your answer here..."
            value={textareaValue}
            onChange={(e) => onOpenResponse(question.number, 'Отговор', e.target.value)}
            className="w-full resize-y border border-border rounded-xl px-4 py-3 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted/40"
          />

          {showFeedback && question.official_answer && (
            <div className="px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
              <strong>Official answer:</strong>{' '}
              <span className="whitespace-pre-wrap">{question.official_answer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
