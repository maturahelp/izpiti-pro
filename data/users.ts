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
  name: '',
  email: '',
  role: 'student',
  class: '7',
  examPath: 'НВО',
  plan: 'free',
  joinedAt: '',
  lastActiveAt: '',
  testsCompleted: 0,
  lessonsCompleted: 0,
  avgScore: 0,
  streakDays: 0,
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
  testsCompleted: 0,
  totalTests: 24,
  lessonsCompleted: 0,
  totalLessons: 7,
  avgScore: 0,
  streakDays: 0,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  scoreHistory: [] as { date: string; score: number; testName: string }[],
  weakTopics: [] as { name: string; avgScore: number; subjectName: string }[],
  strongTopics: [] as { name: string; avgScore: number; subjectName: string }[],
  recentActivity: [] as { type: string; title: string; date: string; score?: number }[],
}
