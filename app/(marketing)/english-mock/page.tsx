import Link from 'next/link'
import { officialEnglishMockExams } from '@/lib/official-english-mock-data'

const sessionLabelMap: Record<string, string> = {
  май: 'Май',
  юни: 'Юни',
  август: 'Август',
  септември: 'Септември',
  примерна: 'Примерна',
  пробна: 'Пробна',
}

export default function EnglishMockIndexPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Mock Website</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">English DZI Mock Website</h1>
          <p className="mt-4 text-base leading-7 text-stone-600">
            Interactive paper-style pages for the reading comprehension and writing parts of the official English exams.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-stone-200">
              {officialEnglishMockExams.length} exams
            </span>
            <Link
              href="/english-preview/2025"
              className="rounded-full bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-700"
            >
              Open Approved 2025
            </Link>
            <Link
              href="/english-generated"
              className="rounded-full bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800"
            >
              Review 500 Generated Questions
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {officialEnglishMockExams.map((exam) => {
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
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{exam.source_title}</p>

                <div className="mt-5 flex items-center justify-between text-sm text-stone-500">
                  <span>{exam.questions.length} tasks</span>
                  <span>{exam.questions.filter((q) => q.section === 'writing').length} writing</span>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/english-mock/${exam.id}`}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    Open Mock Exam
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
