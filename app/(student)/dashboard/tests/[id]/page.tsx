import TestPageClient from '@/components/dashboard/TestPageClient'

function decodeTestId(rawId: string) {
  try {
    return decodeURIComponent(rawId)
  } catch {
    return rawId
  }
}

export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const testId = decodeTestId(rawId)

  return <TestPageClient key={testId} testId={testId} />
}
