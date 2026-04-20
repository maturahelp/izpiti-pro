'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { EnglishMockExamPage } from '@/components/english-mock/EnglishMockExamPage'
import { officialEnglishMockExams } from '@/lib/official-english-mock-data'

export default function EnglishMockExamRoute() {
  const params = useParams()
  const rawId = String(params.id)
  const id = (() => {
    try {
      return decodeURIComponent(rawId)
    } catch {
      return rawId
    }
  })()
  const exam = officialEnglishMockExams.find((item) => item.id === id)

  if (!exam) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-serif text-3xl">Exam Not Found</h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            The requested English mock exam is not available.
          </p>
          <Link
            href="/english-mock"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Mock Website
          </Link>
        </div>
      </main>
    )
  }

  return <EnglishMockExamPage exam={exam} />
}
