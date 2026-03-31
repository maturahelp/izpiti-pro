export type MaterialType = 'notes' | 'pdf' | 'summary' | 'scheme'
export type MaterialAccess = 'free' | 'premium'

export interface Material {
  id: string
  title: string
  description: string
  type: MaterialType
  subjectId: string
  subjectName: string
  topicId: string
  topicName: string
  examType: 'nvo7' | 'dzi12'
  access: MaterialAccess
  pages?: number
  downloadCount: number
  createdAt: string
}

export const materials: Material[] = [
  {
    id: 'mat-1',
    title: 'Правопис — пълна таблица с правила',
    description: 'Систематизирана таблица на всички правописни правила, тествани на НВО по БЕЛ. Включва примери и изключения.',
    type: 'summary',
    subjectId: 'bg-lang-7',
    subjectName: 'Български език',
    topicId: 'bg7-1',
    topicName: 'Правопис и пунктуация',
    examType: 'nvo7',
    access: 'free',
    pages: 4,
    downloadCount: 3241,
    createdAt: '2024-01-15',
  },
  {
    id: 'mat-2',
    title: 'Пунктуация — кога поставяме запетая',
    description: 'Подробни бележки с всички случаи за употреба на запетая в простото и сложното изречение с примери от реални НВО задачи.',
    type: 'notes',
    subjectId: 'bg-lang-7',
    subjectName: 'Български език',
    topicId: 'bg7-1',
    topicName: 'Правопис и пунктуация',
    examType: 'nvo7',
    access: 'free',
    pages: 6,
    downloadCount: 2876,
    createdAt: '2024-01-20',
  },
  {
    id: 'mat-3',
    title: 'Части на речта — схема за бърза проверка',
    description: 'Визуална схема за разпознаване и определяне на частите на речта. Включва пробни въпроси от изпита.',
    type: 'scheme',
    subjectId: 'bg-lang-7',
    subjectName: 'Български език',
    topicId: 'bg7-2',
    topicName: 'Части на речта',
    examType: 'nvo7',
    access: 'free',
    pages: 2,
    downloadCount: 2134,
    createdAt: '2024-02-01',
  },
  {
    id: 'mat-4',
    title: 'Анализ на текст — пълно ръководство',
    description: 'Стъпково ръководство за четене и анализ на художествен текст с практически примери и чести грешки.',
    type: 'pdf',
    subjectId: 'bg-lang-7',
    subjectName: 'Български език',
    topicId: 'bg7-3',
    topicName: 'Анализ на текст',
    examType: 'nvo7',
    access: 'premium',
    pages: 12,
    downloadCount: 1567,
    createdAt: '2024-02-10',
  },
  {
    id: 'mat-5',
    title: 'Математика НВО — формули и теореми',
    description: 'Пълна справочна листа с всички формули, теореми и дефиниции, необходими за НВО по математика.',
    type: 'summary',
    subjectId: 'math-7',
    subjectName: 'Математика',
    topicId: 'math7-1',
    topicName: 'Числа и изрази',
    examType: 'nvo7',
    access: 'free',
    pages: 5,
    downloadCount: 4123,
    createdAt: '2024-01-10',
  },
  {
    id: 'mat-6',
    title: 'Геометрия — схеми и доказателства',
    description: 'Визуални схеми на всички геометрични теореми с доказателства, тествани на НВО.',
    type: 'scheme',
    subjectId: 'math-7',
    subjectName: 'Математика',
    topicId: 'math7-4',
    topicName: 'Геометрия — триъгълници',
    examType: 'nvo7',
    access: 'premium',
    pages: 8,
    downloadCount: 1234,
    createdAt: '2024-02-15',
  },
  {
    id: 'mat-7',
    title: 'ДЗИ БЕЛ — структура и критерии за оценяване',
    description: 'Официалните критерии за оценяване на ДЗИ по БЕЛ с обяснения и примери за всяка точкова зона.',
    type: 'pdf',
    subjectId: 'bg-lang-12',
    subjectName: 'Български език и литература',
    topicId: 'bg12-3',
    topicName: 'Интерпретативно съчинение',
    examType: 'dzi12',
    access: 'free',
    pages: 10,
    downloadCount: 5678,
    createdAt: '2024-01-05',
  },
  {
    id: 'mat-8',
    title: 'Под игото — подробен анализ и цитати',
    description: 'Пълен литературен анализ на романа "Под игото" с ключови цитати, теми и символи за интерпретативното съчинение.',
    type: 'notes',
    subjectId: 'bg-lang-12',
    subjectName: 'Български език и литература',
    topicId: 'bg12-5',
    topicName: 'Под игото — Иван Вазов',
    examType: 'dzi12',
    access: 'premium',
    pages: 15,
    downloadCount: 2345,
    createdAt: '2024-02-20',
  },
  {
    id: 'mat-9',
    title: 'Образци от минали ДЗИ изпити — 2018-2023',
    description: 'Колекция от образцови работи, получили максимален брой точки на ДЗИ по БЕЛ от последните 5 години.',
    type: 'pdf',
    subjectId: 'bg-lang-12',
    subjectName: 'Български език и литература',
    topicId: 'bg12-3',
    topicName: 'Интерпретативно съчинение',
    examType: 'dzi12',
    access: 'premium',
    pages: 30,
    downloadCount: 3456,
    createdAt: '2024-03-01',
  },
]

export const materialTypeLabels: Record<MaterialType, string> = {
  notes: 'Бележки',
  pdf: 'PDF документ',
  summary: 'Резюме',
  scheme: 'Схема',
}
