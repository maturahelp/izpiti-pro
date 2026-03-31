export type UserRole = 'student' | 'admin'
export type SubscriptionPlan = 'free' | 'premium'
export type UserClass = '7' | '12'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  class: UserClass
  examPath: string
  plan: SubscriptionPlan
  joinedAt: string
  lastActiveAt: string
  testsCompleted: number
  lessonsCompleted: number
  avgScore: number
  streakDays: number
  isActive: boolean
  planExpiresAt?: string
}

export const currentUser: User = {
  id: 'user-1',
  name: 'Мария Петрова',
  email: 'maria.petrova@email.com',
  role: 'student',
  class: '12',
  examPath: 'ДЗИ — Български език и литература',
  plan: 'free',
  joinedAt: '2024-01-15',
  lastActiveAt: '2024-03-12',
  testsCompleted: 8,
  lessonsCompleted: 5,
  avgScore: 72,
  streakDays: 4,
  isActive: true,
}

export const adminUsers: User[] = [
  {
    id: 'user-1',
    name: 'Мария Петрова',
    email: 'maria.petrova@email.com',
    role: 'student',
    class: '12',
    examPath: 'ДЗИ — БЕЛ',
    plan: 'free',
    joinedAt: '2024-01-15',
    lastActiveAt: '2024-03-12',
    testsCompleted: 8,
    lessonsCompleted: 5,
    avgScore: 72,
    streakDays: 4,
    isActive: true,
  },
  {
    id: 'user-2',
    name: 'Георги Иванов',
    email: 'georgi.ivanov@email.com',
    role: 'student',
    class: '7',
    examPath: 'НВО — Математика',
    plan: 'premium',
    joinedAt: '2024-01-20',
    lastActiveAt: '2024-03-12',
    testsCompleted: 22,
    lessonsCompleted: 18,
    avgScore: 84,
    streakDays: 12,
    isActive: true,
    planExpiresAt: '2024-06-20',
  },
  {
    id: 'user-3',
    name: 'Елена Димитрова',
    email: 'elena.dimitrova@email.com',
    role: 'student',
    class: '12',
    examPath: 'ДЗИ — Математика',
    plan: 'premium',
    joinedAt: '2024-02-01',
    lastActiveAt: '2024-03-11',
    testsCompleted: 34,
    lessonsCompleted: 28,
    avgScore: 91,
    streakDays: 28,
    isActive: true,
    planExpiresAt: '2024-09-01',
  },
  {
    id: 'user-4',
    name: 'Стефан Николов',
    email: 'stefan.nikolov@email.com',
    role: 'student',
    class: '7',
    examPath: 'НВО — БЕЛ',
    plan: 'free',
    joinedAt: '2024-02-10',
    lastActiveAt: '2024-03-05',
    testsCompleted: 3,
    lessonsCompleted: 2,
    avgScore: 61,
    streakDays: 0,
    isActive: false,
  },
  {
    id: 'user-5',
    name: 'Анна Костова',
    email: 'anna.kostova@email.com',
    role: 'student',
    class: '12',
    examPath: 'ДЗИ — История',
    plan: 'premium',
    joinedAt: '2024-01-08',
    lastActiveAt: '2024-03-12',
    testsCompleted: 41,
    lessonsCompleted: 36,
    avgScore: 88,
    streakDays: 19,
    isActive: true,
    planExpiresAt: '2024-07-08',
  },
  {
    id: 'user-6',
    name: 'Борис Тодоров',
    email: 'boris.todorov@email.com',
    role: 'student',
    class: '7',
    examPath: 'НВО — Математика',
    plan: 'free',
    joinedAt: '2024-03-01',
    lastActiveAt: '2024-03-10',
    testsCompleted: 1,
    lessonsCompleted: 1,
    avgScore: 55,
    streakDays: 1,
    isActive: true,
  },
]

export const progressData = {
  testsCompleted: 8,
  totalTests: 48,
  lessonsCompleted: 5,
  totalLessons: 32,
  avgScore: 72,
  streakDays: 4,
  weeklyActivity: [3, 5, 2, 0, 4, 6, 3],
  scoreHistory: [
    { date: '04.03', score: 65, testName: 'БЕЛ — Правопис' },
    { date: '06.03', score: 72, testName: 'МАТ — Числа' },
    { date: '08.03', score: 85, testName: 'БЕЛ — Пунктуация' },
    { date: '10.03', score: 78, testName: 'МАТ — Уравнения' },
    { date: '11.03', score: 80, testName: 'БЕЛ — Части на речта' },
  ],
  weakTopics: [
    { name: 'Геометрия — триъгълници', avgScore: 52, subjectName: 'Математика' },
    { name: 'Анализ на текст', avgScore: 58, subjectName: 'Български език' },
    { name: 'Функции и графики', avgScore: 61, subjectName: 'Математика' },
  ],
  strongTopics: [
    { name: 'Числа и изрази', avgScore: 90, subjectName: 'Математика' },
    { name: 'Правопис и пунктуация', avgScore: 85, subjectName: 'Български език' },
    { name: 'Части на речта', avgScore: 82, subjectName: 'Български език' },
  ],
  recentActivity: [
    { type: 'test', title: 'Правопис и пунктуация — основни правила', score: 85, date: '10.03.2024' },
    { type: 'lesson', title: 'Запетая при сложно изречение', date: '09.03.2024' },
    { type: 'test', title: 'Числа и изрази — пробен тест 1', score: 90, date: '08.03.2024' },
    { type: 'lesson', title: 'Представките из-, въз-, раз-', date: '07.03.2024' },
    { type: 'material', title: 'Математика НВО — формули и теореми', date: '06.03.2024' },
  ],
}
