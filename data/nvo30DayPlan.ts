/**
 * Дневен план "29 дни до НВО" — 7. клас.
 *
 * Старт: 22 май 2026 (петък)
 * Край:  19 юни 2026 (петък) — НВО Математика
 * Други ключови дати:
 *   ден 27 = 17 юни — НВО БЕЛ
 *   ден 29 = 19 юни — НВО Математика
 *
 * Препоръчителен дневен ангажимент: 45–75 минути.
 * Plan-ът се прилага САМО за ученици с class='7' и активен план
 * (free user-ите виждат списъка но кликовете водят към subscription).
 */

export type PlanTaskType =
  | 'past_exam' // /dashboard/tests/[id]
  | 'beron_test' // /dashboard/tests/[id]
  | 'literature_work' // /dashboard/materials → отвори произведението
  | 'literature_exercise' // /dashboard/literature-exercise/[workId]
  | 'math_subtopic' // /dashboard/materials → математика секция
  | 'bel_rule' // /dashboard/materials → български секция
  | 'retell_model' // /dashboard/materials → преразказ модели
  | 'review' // вътрешна задача — без направляващ линк
  | 'rest' // мотивационна — почивка

export type PlanTask = {
  type: PlanTaskType
  label: string
  href?: string
  refId?: string
  optional?: boolean
  estimatedMin?: number
}

export type PlanDay = {
  dayIndex: number
  date: string // YYYY-MM-DD
  weekday: string // съкратено
  title: string
  summary?: string
  tasks: PlanTask[]
  isExamDay?: boolean
  examLabel?: string
}

export const PLAN_START_ISO = '2026-05-22'
export const PLAN_END_ISO = '2026-06-19'

export const nvo30DayPlan: PlanDay[] = [
  {
    dayIndex: 1,
    date: '2026-05-22',
    weekday: 'Пт',
    title: 'Старт: входен тест',
    summary:
      'Започваме с миналогодишна матура по БЕЛ — за да видим точно къде сме. Не се притеснявай от резултата; той е база.',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО БЕЛ 2018 — пълен тест',
        href: '/dashboard/tests/nvo-bel-2018',
        estimatedMin: 60,
      },
      {
        type: 'review',
        label: 'Прегледай къде сгреши и кои теми ти бягат',
        estimatedMin: 10,
      },
    ],
  },
  {
    dayIndex: 2,
    date: '2026-05-23',
    weekday: 'Сб',
    title: 'Литература: Възрожденският свят',
    tasks: [
      { type: 'literature_work', label: 'Вятър ечи, Балкан стене', refId: 'nvo-lit-01', estimatedMin: 15 },
      { type: 'literature_work', label: 'Стани, стани, юнак балкански', refId: 'nvo-lit-02', estimatedMin: 15 },
      { type: 'literature_work', label: 'Отечество любезно', refId: 'nvo-lit-03', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 3,
    date: '2026-05-24',
    weekday: 'Нд',
    title: 'Математика: Числа и алгебра — основи',
    tasks: [
      { type: 'math_subtopic', label: 'Естествени числа, делимост', refId: 'alg-natural', estimatedMin: 20 },
      { type: 'math_subtopic', label: 'Рационални числа, проценти', refId: 'alg-rational', estimatedMin: 20 },
      { type: 'math_subtopic', label: 'Цели изрази, формули за съкратено умножение', refId: 'alg-expressions', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 4,
    date: '2026-05-25',
    weekday: 'Пн',
    title: 'Литература: Родина и природа',
    tasks: [
      { type: 'literature_work', label: 'Хубава си, моя горо', refId: 'nvo-lit-04', estimatedMin: 15 },
      { type: 'literature_work', label: 'Неразделни', refId: 'nvo-lit-05', estimatedMin: 15 },
      { type: 'bel_rule', label: 'Запетая в простото изречение', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 5,
    date: '2026-05-26',
    weekday: 'Вт',
    title: 'Математика: Уравнения',
    tasks: [
      { type: 'math_subtopic', label: 'Линейни уравнения', refId: 'alg-linear-eq', estimatedMin: 25 },
      { type: 'math_subtopic', label: 'Модулни уравнения', refId: 'alg-abs-eq', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Линейни неравенства', refId: 'alg-ineq', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 6,
    date: '2026-05-27',
    weekday: 'Ср',
    title: 'Литература: Хайдушкият мотив',
    tasks: [
      { type: 'literature_work', label: 'На прощаване в 1868 г.', refId: 'nvo-lit-06', estimatedMin: 20 },
      { type: 'literature_work', label: 'Хайдути', refId: 'nvo-lit-07', estimatedMin: 15 },
      { type: 'literature_work', label: 'Заточеници', refId: 'nvo-lit-08', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 7,
    date: '2026-05-28',
    weekday: 'Чт',
    title: 'Математика: Геометрия — равнина',
    tasks: [
      { type: 'math_subtopic', label: 'Лице и периметър', refId: 'geom-area', estimatedMin: 25 },
      { type: 'math_subtopic', label: 'Многоъгълник', refId: 'geom-polygon', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Координатна система', refId: 'geom-coord', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 8,
    date: '2026-05-29',
    weekday: 'Пт',
    title: 'Литература: Войната за свобода',
    tasks: [
      { type: 'literature_work', label: 'Из „Немили-недраги"', refId: 'nvo-lit-09', estimatedMin: 20 },
      { type: 'literature_work', label: 'Опълченците на Шипка', refId: 'nvo-lit-10', estimatedMin: 20 },
      { type: 'literature_exercise', label: 'Упражнение: Опълченците', refId: 'nvo-lit-10', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 9,
    date: '2026-05-30',
    weekday: 'Сб',
    title: 'Тренировъчен тест: БЕЛ 2020',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО БЕЛ 2020 — пълен тест',
        href: '/dashboard/tests/nvo-bel-2020',
        estimatedMin: 60,
      },
      { type: 'review', label: 'Анализ на грешките — върни се на слабите теми', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 10,
    date: '2026-05-31',
    weekday: 'Нд',
    title: 'Литература: Под игото',
    tasks: [
      { type: 'literature_work', label: 'Из „Под игото" — Представлението', refId: 'nvo-lit-11', estimatedMin: 25 },
      { type: 'literature_work', label: 'Радини вълнения', refId: 'nvo-lit-12', estimatedMin: 20 },
      { type: 'literature_exercise', label: 'Упражнение: Представлението', refId: 'nvo-lit-11', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 11,
    date: '2026-06-01',
    weekday: 'Пн',
    title: 'Математика: Тела',
    tasks: [
      { type: 'math_subtopic', label: 'Призми и пирамиди', refId: 'geom-prisms', estimatedMin: 25 },
      { type: 'math_subtopic', label: 'Цилиндър, конус, кълбо', refId: 'geom-round', estimatedMin: 25 },
    ],
  },
  {
    dayIndex: 12,
    date: '2026-06-02',
    weekday: 'Вт',
    title: 'Литература: Език и народ',
    tasks: [
      { type: 'literature_work', label: 'Българският език', refId: 'nvo-lit-13', estimatedMin: 20 },
      { type: 'literature_work', label: 'Една българка', refId: 'nvo-lit-14', estimatedMin: 20 },
      { type: 'bel_rule', label: 'Представки из-, въз-, раз-, без-', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 13,
    date: '2026-06-03',
    weekday: 'Ср',
    title: 'Тренировъчен тест: Математика 2020',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО Математика 2020 — пълен тест',
        href: '/dashboard/tests/nvo-math-2020',
        estimatedMin: 60,
      },
      { type: 'review', label: 'Анализ: кои задачи ти отнемат най-много време', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 14,
    date: '2026-06-04',
    weekday: 'Чт',
    title: 'Литература: Срещата с непознатото',
    tasks: [
      { type: 'literature_work', label: 'Из „До Чикаго и назад"', refId: 'nvo-lit-15', estimatedMin: 20 },
      { type: 'literature_work', label: 'Бай Ганьо пътува', refId: 'nvo-lit-16', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 15,
    date: '2026-06-05',
    weekday: 'Пт',
    title: 'Математика: Триъгълници',
    tasks: [
      { type: 'math_subtopic', label: 'Съседни и противоположни ъгли', refId: 'geom-angles', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Успоредни прави', refId: 'geom-parallel', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Ъгли в триъгълника', refId: 'geom-triangle-angles', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 16,
    date: '2026-06-06',
    weekday: 'Сб',
    title: 'Литература: Социалното неравенство',
    tasks: [
      { type: 'literature_work', label: 'По жицата', refId: 'nvo-lit-17', estimatedMin: 20 },
      { type: 'literature_work', label: 'Серафим', refId: 'nvo-lit-18', estimatedMin: 20 },
      { type: 'retell_model', label: 'Модел на преразказ с дидактическа задача', estimatedMin: 25 },
    ],
  },
  {
    dayIndex: 17,
    date: '2026-06-07',
    weekday: 'Нд',
    title: 'Математика: Триъгълници (продължение)',
    tasks: [
      { type: 'math_subtopic', label: 'Еднакви триъгълници, Питагор', refId: 'geom-congruent', estimatedMin: 25 },
      { type: 'math_subtopic', label: 'Равнобедрен и равностранен триъгълник', refId: 'geom-isosceles', estimatedMin: 20 },
      { type: 'math_subtopic', label: 'Правоъгълен триъгълник, ъгъл 30°', refId: 'geom-right-triangle', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 18,
    date: '2026-06-08',
    weekday: 'Пн',
    title: 'Литература: Селският свят',
    tasks: [
      { type: 'literature_work', label: 'По жътва', refId: 'nvo-lit-19', estimatedMin: 15 },
      { type: 'literature_work', label: 'Косачи', refId: 'nvo-lit-20', estimatedMin: 15 },
      { type: 'literature_work', label: 'Братчетата на Гаврош', refId: 'nvo-lit-21', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 19,
    date: '2026-06-09',
    weekday: 'Вт',
    title: 'Тренировъчен тест: БЕЛ 2022',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО БЕЛ 2022 — пълен тест',
        href: '/dashboard/tests/nvo-bel-2022',
        estimatedMin: 60,
      },
      { type: 'review', label: 'Анализ на грешките', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 20,
    date: '2026-06-10',
    weekday: 'Ср',
    title: 'Математика: Четириъгълници, неравенства',
    tasks: [
      { type: 'math_subtopic', label: 'Симетрала, ъглополовяща', refId: 'geom-bisectors', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Неравенство на триъгълника', refId: 'geom-triangle-ineq', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Успоредник, правоъгълник, ромб, квадрат', refId: 'geom-parallelogram', estimatedMin: 25 },
    ],
  },
  {
    dayIndex: 21,
    date: '2026-06-11',
    weekday: 'Чт',
    title: 'Литература: Финална тема + кратък тест',
    tasks: [
      { type: 'literature_work', label: 'Художник', refId: 'nvo-lit-22', estimatedMin: 20 },
      {
        type: 'beron_test',
        label: 'Тренировъчен правопис (лесен)',
        href: '/dashboard/tests/g7_easy_test_01',
        estimatedMin: 20,
      },
    ],
  },
  {
    dayIndex: 22,
    date: '2026-06-12',
    weekday: 'Пт',
    title: 'Тренировъчен тест: Математика 2023',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО Математика 2023 — пълен тест',
        href: '/dashboard/tests/nvo-math-2023',
        estimatedMin: 60,
      },
      { type: 'math_subtopic', label: 'Диаграми и графики', refId: 'stats-charts', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 23,
    date: '2026-06-13',
    weekday: 'Сб',
    title: 'Преговор: правопис + преразказ',
    tasks: [
      {
        type: 'beron_test',
        label: 'Правопис — среден тест',
        href: '/dashboard/tests/g7_medium_test_01',
        estimatedMin: 25,
      },
      { type: 'retell_model', label: 'Преразказ: 3 типа дидактически задачи', estimatedMin: 30 },
    ],
  },
  {
    dayIndex: 24,
    date: '2026-06-14',
    weekday: 'Нд',
    title: 'Математика: Финални теми',
    tasks: [
      { type: 'math_subtopic', label: 'Разлагане на многочлени', refId: 'alg-factor', estimatedMin: 20 },
      { type: 'math_subtopic', label: 'Множества и операции', refId: 'stats-sets', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Вероятност', refId: 'stats-probability', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Пропорции', refId: 'model-proportions', estimatedMin: 15 },
    ],
  },
  {
    dayIndex: 25,
    date: '2026-06-15',
    weekday: 'Пн',
    title: 'Финална репетиция: БЕЛ 2024',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО БЕЛ 2024 — пълен тест',
        href: '/dashboard/tests/nvo-bel-2024',
        estimatedMin: 60,
      },
      { type: 'review', label: 'Прегледай слабите си теми', estimatedMin: 20 },
    ],
  },
  {
    dayIndex: 26,
    date: '2026-06-16',
    weekday: 'Вт',
    title: 'Лек преглед преди БЕЛ',
    summary: 'Без пълни тестове — само кратки преговори. Лягай рано.',
    tasks: [
      {
        type: 'beron_test',
        label: 'Бърз тест правопис (труден)',
        href: '/dashboard/tests/g7_hard_test_01',
        optional: true,
        estimatedMin: 15,
      },
      { type: 'math_subtopic', label: 'Средноаритметично', refId: 'model-average', estimatedMin: 15 },
      { type: 'math_subtopic', label: 'Моделиране с уравнения', refId: 'model-equations', estimatedMin: 15 },
      { type: 'rest', label: 'Прибери учебниците до 21:00. Заспи рано.', estimatedMin: 0 },
    ],
  },
  {
    dayIndex: 27,
    date: '2026-06-17',
    weekday: 'Ср',
    title: 'НВО БЕЛ — изпитен ден',
    isExamDay: true,
    examLabel: 'НВО Български език и литература',
    summary:
      'Закуси, вземи документ за самоличност и химикалка. Не правиш нищо извън ритуала. Успех.',
    tasks: [
      { type: 'rest', label: 'Без учене сутринта — само лек преглед на ключови имена и дати', estimatedMin: 0 },
      { type: 'rest', label: 'След изпита: почивка. Не сравнявай отговори.', estimatedMin: 0 },
    ],
  },
  {
    dayIndex: 28,
    date: '2026-06-18',
    weekday: 'Чт',
    title: 'Финална репетиция: Математика 2024',
    tasks: [
      {
        type: 'past_exam',
        label: 'НВО Математика 2024 — пълен тест',
        href: '/dashboard/tests/nvo-math-2024',
        estimatedMin: 60,
      },
      { type: 'review', label: 'Бърз преглед на най-проблемните теми', estimatedMin: 30 },
      { type: 'rest', label: 'Заспи рано.', estimatedMin: 0 },
    ],
  },
  {
    dayIndex: 29,
    date: '2026-06-19',
    weekday: 'Пт',
    title: 'НВО Математика — изпитен ден',
    isExamDay: true,
    examLabel: 'НВО Математика',
    summary: 'Закуси, вземи документ за самоличност, химикал и геометрични инструменти. Спокойствие.',
    tasks: [
      { type: 'rest', label: 'Сутринта — само бърз преглед на формули', estimatedMin: 0 },
      { type: 'rest', label: 'След изпита: ти го направи.', estimatedMin: 0 },
    ],
  },
]

/**
 * Връща ден от плана според днешната дата (Europe/Sofia).
 * Извън диапазона на плана връща null.
 */
export function getPlanDayForDate(date: Date | string = new Date()): PlanDay | null {
  const d = typeof date === 'string' ? new Date(date) : date
  const iso = d.toISOString().slice(0, 10)
  return nvo30DayPlan.find((day) => day.date === iso) ?? null
}

/**
 * Общ брой задачи в плана (за прогрес процент).
 */
export const TOTAL_PLAN_TASKS = nvo30DayPlan.reduce((sum, d) => sum + d.tasks.length, 0)
