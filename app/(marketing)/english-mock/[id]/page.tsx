import { redirect } from 'next/navigation'

export default function EnglishMockExamRoute({ params }: { params: { id: string } }) {
  let id = params.id

  try {
    id = decodeURIComponent(params.id)
  } catch {}

  redirect(`/dashboard/tests/${encodeURIComponent(id)}`)
}
