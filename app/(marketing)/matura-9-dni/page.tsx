import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MaturaFinalSurveyPage } from '@/components/marketing/MaturaFinalSurveyPage'

export const metadata: Metadata = {
  title: 'Финална оферта за ДЗИ | MaturaHelp',
  description:
    'Кратка анкета за 12. клас преди ДЗИ и финална оферта с 50% отстъпка.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MaturaNineDaysPage() {
  return (
    <Suspense fallback={null}>
      <MaturaFinalSurveyPage />
    </Suspense>
  )
}
