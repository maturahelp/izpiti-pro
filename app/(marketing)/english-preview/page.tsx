import Link from 'next/link'
import { officialEnglishMockExams } from '@/lib/official-english-mock-data'

const exams = officialEnglishMockExams

const sessionLabelMap: Record<string, string> = {
  май: 'Май',
  юни: 'Юни',
  август: 'Август',
  септември: 'Септември',
  примерна: 'Примерна',
  пробна: 'Пробна',
}

export default function EnglishPreviewPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Preview
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            English DZI Interactive Preview
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-600">
            Quick review page for the imported English exams, filtered down to reading comprehension and writing only.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-stone-200">
              {exams.length} exams
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-stone-200">
              {exams.reduce((sum, exam) => sum + exam.questions.length, 0)} questions
            </span>
            <Link
              href="/english-preview/2025"
              className="rounded-full bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-700"
            >
              Open Standalone 2025
            </Link>
            <Link
              href="/english-mock"
              className="rounded-full bg-teal-700 px-4 py-2 font-semibold text-white transition hover:bg-teal-800"
            >
              Open Mock Website
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => {
            const reading = exam.questions.filter((q) => q.section === 'reading' || q.section === 'open_reading').length
            const writing = exam.questions.filter((q) => q.section === 'writing').length
            const sessionLabel = sessionLabelMap[exam.session || ''] || exam.session || 'Сесия'

            return (
              <article
                key={exam.id}
                className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {sessionLabel} {exam.year}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-stone-900">
                      {exam.level ? `Английски език ${exam.level}` : 'Английски език'}
                    </h2>
                  </div>
                  {exam.level && (
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {exam.level}
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                  {exam.source_title}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-stone-50 px-3 py-3">
                    <div className="font-semibold text-stone-900">{reading}</div>
                    <div className="mt-1 text-stone-500">Reading</div>
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-3 py-3">
                    <div className="font-semibold text-stone-900">{writing}</div>
                    <div className="mt-1 text-stone-500">Writing</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-stone-500">
                  <span>{exam.questions.length} tasks total</span>
                  <span>{exam.questions.filter((q) => q.type === 'open_response').length} open</span>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/english-mock/${exam.id}`}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
                  >
                    Open Interactive Exam
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
