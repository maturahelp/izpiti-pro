export interface Subject {
  id: string
  name: string
  code: string
  examType: 'nvo7' | 'dzi12'
  color: string
  topicsCount: number
  testsCount: number
  lessonsCount: number
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  order: number
  lessonsCount: number
  testsCount: number
}

export const subjects: Subject[] = [
  {
    id: 'bg-lang-7',
    name: 'Български език',
    code: 'БЕЛ',
    examType: 'nvo7',
    color: '#1B4FD8',
    topicsCount: 14,
    testsCount: 28,
    lessonsCount: 42,
  },
  {
    id: 'math-7',
    name: 'Математика',
    code: 'МАТ',
    examType: 'nvo7',
    color: '#D97706',
    topicsCount: 18,
    testsCount: 36,
    lessonsCount: 54,
  },
  {
    id: 'bg-lang-12',
    name: 'Български език и литература',
    code: 'БЕЛ',
    examType: 'dzi12',
    color: '#1B4FD8',
    topicsCount: 22,
    testsCount: 44,
    lessonsCount: 66,
  },
  {
    id: 'math-12',
    name: 'Математика',
    code: 'МАТ',
    examType: 'dzi12',
    color: '#D97706',
    topicsCount: 24,
    testsCount: 48,
    lessonsCount: 72,
  },
  {
    id: 'history-12',
    name: 'История и цивилизации',
    code: 'ИСТ',
    examType: 'dzi12',
    color: '#7C3AED',
    topicsCount: 20,
    testsCount: 40,
    lessonsCount: 60,
  },
  {
    id: 'geography-12',
    name: 'География и икономика',
    code: 'ГЕО',
    examType: 'dzi12',
    color: '#16A34A',
    topicsCount: 16,
    testsCount: 32,
    lessonsCount: 48,
  },
  {
    id: 'biology-12',
    name: 'Биология и здравно образование',
    code: 'БЗО',
    examType: 'dzi12',
    color: '#059669',
    topicsCount: 18,
    testsCount: 36,
    lessonsCount: 54,
  },
  {
    id: 'chemistry-12',
    name: 'Химия и опазване на околната среда',
    code: 'ХОС',
    examType: 'dzi12',
    color: '#DC2626',
    topicsCount: 16,
    testsCount: 32,
    lessonsCount: 48,
  },
  {
    id: 'physics-12',
    name: 'Физика и астрономия',
    code: 'ФИЗ',
    examType: 'dzi12',
    color: '#0891B2',
    topicsCount: 14,
    testsCount: 28,
    lessonsCount: 42,
  },
]

export const topics: Topic[] = [
  { id: 'bg7-1', subjectId: 'bg-lang-7', name: 'Правопис и пунктуация', order: 1, lessonsCount: 4, testsCount: 3 },
  { id: 'bg7-2', subjectId: 'bg-lang-7', name: 'Части на речта', order: 2, lessonsCount: 3, testsCount: 2 },
  { id: 'bg7-3', subjectId: 'bg-lang-7', name: 'Анализ на текст', order: 3, lessonsCount: 5, testsCount: 4 },
  { id: 'bg7-4', subjectId: 'bg-lang-7', name: 'Съчинение-разсъждение', order: 4, lessonsCount: 4, testsCount: 3 },
  { id: 'bg7-5', subjectId: 'bg-lang-7', name: 'Изразни средства', order: 5, lessonsCount: 3, testsCount: 2 },
  { id: 'math7-1', subjectId: 'math-7', name: 'Числа и изрази', order: 1, lessonsCount: 4, testsCount: 3 },
  { id: 'math7-2', subjectId: 'math-7', name: 'Уравнения и неравенства', order: 2, lessonsCount: 5, testsCount: 4 },
  { id: 'math7-3', subjectId: 'math-7', name: 'Функции и графики', order: 3, lessonsCount: 4, testsCount: 3 },
  { id: 'math7-4', subjectId: 'math-7', name: 'Геометрия — триъгълници', order: 4, lessonsCount: 4, testsCount: 3 },
  { id: 'math7-5', subjectId: 'math-7', name: 'Геометрия — четириъгълници', order: 5, lessonsCount: 3, testsCount: 2 },
  { id: 'bg12-1', subjectId: 'bg-lang-12', name: 'Стилистика и изразни средства', order: 1, lessonsCount: 5, testsCount: 4 },
  { id: 'bg12-2', subjectId: 'bg-lang-12', name: 'Анализ на художествен текст', order: 2, lessonsCount: 6, testsCount: 5 },
  { id: 'bg12-3', subjectId: 'bg-lang-12', name: 'Интерпретативно съчинение', order: 3, lessonsCount: 5, testsCount: 4 },
  { id: 'bg12-4', subjectId: 'bg-lang-12', name: 'Хана — Христо Смирненски', order: 4, lessonsCount: 3, testsCount: 2 },
  { id: 'bg12-5', subjectId: 'bg-lang-12', name: 'Под игото — Иван Вазов', order: 5, lessonsCount: 4, testsCount: 3 },
  { id: 'bg12-6', subjectId: 'bg-lang-12', name: 'Градушка — Пейо Яворов', order: 6, lessonsCount: 3, testsCount: 2 },
]

export const examTypes = {
  nvo7: { label: '7. клас НВО', description: 'Национално вътрешно оценяване' },
  dzi12: { label: '12. клас ДЗИ', description: 'Държавен зрелостен изпит' },
}
