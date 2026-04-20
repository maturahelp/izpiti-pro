export const MOCK_NVO_MATH_FIGURES = {
  '2018_math_q13': '/figures/mock-nvo-math/2018_math_q13.svg',
  '2019_math_q17': '/figures/mock-nvo-math/2019_math_q17.svg',
  '2020_math_q10': '/figures/mock-nvo-math/2020_math_q10.svg',
  '2020_math_q11': '/figures/mock-nvo-math/2020_math_q11.svg',
  '2020_math_q12': '/figures/mock-nvo-math/2020_math_q12.svg',
  '2020_math_q13': '/figures/mock-nvo-math/2020_math_q13.svg',
  '2020_math_q15': '/figures/mock-nvo-math/2020_math_q15.svg',
  '2020_math_q16': '/figures/mock-nvo-math/2020_math_q16.svg',
  '2021_math_q11': '/figures/mock-nvo-math/2021_math_q11.svg',
  '2021_math_q12': '/figures/mock-nvo-math/2021_math_q12.svg',
  '2021_math_q17': '/figures/mock-nvo-math/2021_math_q17.svg',
  '2022_math_q13': '/figures/mock-nvo-math/2022_math_q13.svg',
  '2022_math_q14': '/figures/mock-nvo-math/2022_math_q14.svg',
  '2022_math_q15': '/figures/mock-nvo-math/2022_math_q15.svg',
  '2023_math_q12': '/figures/mock-nvo-math/2023_math_q12.svg',
  '2023_math_q13': '/figures/mock-nvo-math/2023_math_q13.svg',
  '2023_math_q16': '/figures/mock-nvo-math/2023_math_q16.svg',
  '2024_math_q19': '/figures/mock-nvo-math/2024_math_q19.svg',
  '2025_math_q09': '/figures/mock-nvo-math/2025_math_q09.svg',
  '2025_math_q10': '/figures/mock-nvo-math/2025_math_q10.svg',
} as const

type MockNvoMathFigureSourceId = keyof typeof MOCK_NVO_MATH_FIGURES

export function getMockNvoMathFigure(sourceId?: string): string | undefined {
  if (!sourceId) return undefined
  return Object.prototype.hasOwnProperty.call(MOCK_NVO_MATH_FIGURES, sourceId)
    ? MOCK_NVO_MATH_FIGURES[sourceId as MockNvoMathFigureSourceId]
    : undefined
}
