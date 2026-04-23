import {
  TestsPageContent,
  type TestMode,
  type TestSection7,
  type TestSection12,
} from '@/components/dashboard/TestsPageContent'

function getInitialGrade(value: string | undefined): '7' | '12' {
  return value === '7' ? '7' : '12'
}

function getInitialSection7(value: string | undefined): TestSection7 {
  return value === 'math' ? 'math' : 'bel'
}

function getInitialSection12(value: string | undefined): TestSection12 {
  return value === 'english' ? 'english' : 'bel'
}

function getInitialMode(value: string | undefined): TestMode {
  return value === 'past' ? 'past' : 'sample'
}

export default async function TestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const grade = Array.isArray(params.grade) ? params.grade[0] : params.grade
  const section = Array.isArray(params.section) ? params.section[0] : params.section
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode

  return (
    <TestsPageContent
      key={`${getInitialGrade(grade)}-${getInitialSection7(section)}-${getInitialSection12(section)}-${getInitialMode(mode)}`}
      initialGrade={getInitialGrade(grade)}
      initialSection7={getInitialSection7(section)}
      initialSection12={getInitialSection12(section)}
      initialMode={getInitialMode(mode)}
    />
  )
}
