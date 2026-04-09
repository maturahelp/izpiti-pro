export interface NvoLiteratureWork {
  id: string
  author: string
  title: string
  image: string
  theme: string
}

export const nvoLiteratureThemeOrder = [
  'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
] as const

export const nvoLiteratureWorks: NvoLiteratureWork[] = [
  // І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ
  {
    id: 'nvo-lit-01',
    author: 'Д. Чинтулов',
    title: 'Вятър ечи, Балкан стене',
    image: '/nvo-literature/vyatar-echi-balkan-stene.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-02',
    author: 'Добри Чинтулов',
    title: 'Стани, стани, юнак балкански!',
    image: '/nvo-literature/stani-stani-yunak-balkanskii.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-03',
    author: 'Иван Вазов',
    title: 'Отечество любезно, как хубаво си ти!',
    image: '/nvo-literature/otechestvo-liubezno.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-04',
    author: 'Любен Каравелов',
    title: 'Хубава си, моя горо',
    image: '/nvo-literature/hubava-si-moya-goro.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-05',
    author: 'Пенчо Славейков',
    title: 'Неразделни',
    image: '/nvo-literature/nerazdelni.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-06',
    author: 'Христо Ботев',
    title: 'На прощаване в 1868 г.',
    image: '/nvo-literature/na-proshchavane-1868.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-07',
    author: 'Христо Ботев',
    title: 'Хайдути',
    image: '/nvo-literature/haiduti.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-08',
    author: 'Пейо Яворов',
    title: 'Заточеници',
    image: '/nvo-literature/zatochenitsi.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-09',
    author: 'Иван Вазов',
    title: 'Из „Немили-недраги"',
    image: '/nvo-literature/nemili-nedragi.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-10',
    author: 'Иван Вазов',
    title: 'Опълченците на Шипка',
    image: '/nvo-literature/opalchensite-na-shipka.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-11',
    author: 'Иван Вазов',
    title: 'Из „Под игото" — Представлението',
    image: '/nvo-literature/pod-igoto-predstavlenieto.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-12',
    author: 'Иван Вазов',
    title: 'Радини вълнения',
    image: '/nvo-literature/radini-valneniya.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-13',
    author: 'Иван Вазов',
    title: 'Българският език',
    image: '/nvo-literature/bulgarskiyat-ezik.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  {
    id: 'nvo-lit-14',
    author: 'Иван Вазов',
    title: 'Една българка',
    image: '/nvo-literature/edna-bulgarka.jpg',
    theme: 'І. БЪЛГАРИЯ В ЪЗРОЖДЕНСКИ СВЯТ',
  },
  // ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ
  {
    id: 'nvo-lit-15',
    author: 'Алеко Константинов',
    title: 'Из „До Чикаго и назад"',
    image: '/nvo-literature/do-chikago-i-nazad.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-16',
    author: 'Алеко Константинов',
    title: 'Бай Ганьо пътува',
    image: '/nvo-literature/bai-ganio-patuva.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-17',
    author: 'Йордан Йовков',
    title: 'По жицата',
    image: '/nvo-literature/po-zhitsata.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-18',
    author: 'Йордан Йовков',
    title: 'Серафим',
    image: '/nvo-literature/serafim.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-19',
    author: 'Елин Пелин',
    title: 'По жътва',
    image: '/nvo-literature/po-zhatva.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-20',
    author: 'Елин Пелин',
    title: 'Косачи',
    image: '/nvo-literature/kosachi.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-21',
    author: 'Христо Смирненски',
    title: 'Братчетата на Гаврош',
    image: '/nvo-literature/bratchetata-na-gavrosh.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
  {
    id: 'nvo-lit-22',
    author: 'Веселин Ханчев',
    title: 'Художник',
    image: '/nvo-literature/hudozhnik.jpg',
    theme: 'ІІ. ЧОВЕКЪТ В ОБЩЕСТВОТО — НОРМИ, ЦЕННОСТИ И КОНФЛИКТИ',
  },
]
