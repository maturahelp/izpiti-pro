export const adminAnalytics = {
  overview: {
    totalUsers: 4872,
    activeSubscribers: 1234,
    testsCompletedTotal: 48920,
    lessonsPlayedTotal: 31450,
    totalRevenue: 18510,
    aiQueriesTotal: 12876,
    userGrowthPercent: 18,
    revenueGrowthPercent: 24,
    avgSessionMinutes: 28,
    conversionRate: 25.3,
  },
  monthlyRevenue: [
    { month: 'Окт', revenue: 9200 },
    { month: 'Ное', revenue: 10800 },
    { month: 'Дек', revenue: 11400 },
    { month: 'Яну', revenue: 13200 },
    { month: 'Фев', revenue: 15600 },
    { month: 'Мар', revenue: 18510 },
  ],
  usersByClass: [
    { class: '7. клас', count: 2134, percent: 44 },
    { class: '12. клас', count: 2738, percent: 56 },
  ],
  topTests: [
    { name: 'Правопис и пунктуация — НВО', completions: 1842, avgScore: 74 },
    { name: 'Числа и изрази — пробен тест 1', completions: 2103, avgScore: 71 },
    { name: 'Стилистика — ДЗИ БЕЛ', completions: 1567, avgScore: 66 },
    { name: 'Уравнения — НВО Математика', completions: 1456, avgScore: 63 },
    { name: 'Под игото — анализ', completions: 934, avgScore: 62 },
  ],
  topLessons: [
    { name: 'Представките из-, въз-, раз-', plays: 3421 },
    { name: 'Запетая при сложно изречение', plays: 2876 },
    { name: 'Числени изрази — степени и корени', plays: 2567 },
    { name: 'Интерпретативно съчинение — структура', plays: 2234 },
    { name: 'Линейни уравнения с едно неизвестно', plays: 1987 },
  ],
  recentUsers: [
    { name: 'Мария Петрова', email: 'maria.petrova@email.com', plan: 'free', joinedAt: '12.03.2024' },
    { name: 'Борис Тодоров', email: 'boris.todorov@email.com', plan: 'free', joinedAt: '11.03.2024' },
    { name: 'Калина Михайлова', email: 'kalina.m@email.com', plan: 'premium', joinedAt: '10.03.2024' },
    { name: 'Никола Стефанов', email: 'nikola.s@email.com', plan: 'premium', joinedAt: '09.03.2024' },
    { name: 'Виктория Александрова', email: 'viki.a@email.com', plan: 'free', joinedAt: '08.03.2024' },
  ],
}

export const subscriptionStats = {
  activePremium: 1234,
  freeUsers: 3638,
  monthlyChurn: 3.2,
  avgRevenuePerUser: 15,
  plans: [
    { name: 'Месечен план', price: 15.99, subscribers: 678 },
    { name: 'Годишен план', price: 119.99, subscribers: 556 },
  ],
  recentSubscriptions: [
    { user: 'Калина Михайлова', plan: 'Месечен', amount: 15.99, date: '10.03.2024', status: 'active' },
    { user: 'Никола Стефанов', plan: 'Годишен', amount: 119.99, date: '09.03.2024', status: 'active' },
    { user: 'Ива Колева', plan: 'Месечен', amount: 15.99, date: '08.03.2024', status: 'active' },
    { user: 'Христо Панов', plan: 'Годишен', amount: 119.99, date: '07.03.2024', status: 'cancelled' },
    { user: 'Симона Иванова', plan: 'Месечен', amount: 15.99, date: '06.03.2024', status: 'active' },
  ],
}
