export interface NvoLiteratureWork {
  id: string
  author: string
  title: string
  image: string
  theme: string
}

export const nvoLiteratureThemeOrder = [
  'Родолюбие и свобода',
  'Борба и саможертва',
  'Хуманизъм и нравственост',
  'Живот, труд и природа',
  'Откъси от произведения',
] as const

export const nvoLiteratureWorks: NvoLiteratureWork[] = [
  {
    id: 'nvo-lit-01',
    author: 'Добри Чинтулов',
    title: 'Стани, стани, юнак балкански!',
    image: '/nvo-literature/stani-stani-yunak-balkanskii.jpg',
    theme: 'Родолюбие и свобода',
  },
  {
    id: 'nvo-lit-02',
    author: 'Д. Чинтулов',
    title: 'Вятър ечи, Балкан стене',
    image: '/nvo-literature/vyatar-echi-balkan-stene.jpg',
    theme: 'Родолюбие и свобода',
  },
  {
    id: 'nvo-lit-03',
    author: 'Любен Каравелов',
    title: 'Хубава си, моя горо',
    image: '/nvo-literature/hubava-si-moya-goro.jpg',
    theme: 'Родолюбие и свобода',
  },
  {
    id: 'nvo-lit-04',
    author: 'Иван Вазов',
    title: 'Отечество любезно, как хубаво си ти!',
    image: '/nvo-literature/otechestvo-liubezno.jpg',
    theme: 'Родолюбие и свобода',
  },
  {
    id: 'nvo-lit-05',
    author: 'Иван Вазов',
    title: 'Българският език',
    image: '/nvo-literature/bulgarskiyat-ezik.jpg',
    theme: 'Родолюбие и свобода',
  },
  {
    id: 'nvo-lit-06',
    author: 'Пейо Яворов',
    title: 'Заточеници',
    image: '/nvo-literature/zatochenitsi.jpg',
    theme: 'Родолюбие и свобода',
  },
  {
    id: 'nvo-lit-07',
    author: 'Христо Ботев',
    title: 'На прощаване в 1868 г.',
    image: '/nvo-literature/na-proshchavane-1868.jpg',
    theme: 'Борба и саможертва',
  },
  {
    id: 'nvo-lit-08',
    author: 'Христо Ботев',
    title: 'Хайдути',
    image: '/nvo-literature/haiduti.jpg',
    theme: 'Борба и саможертва',
  },
  {
    id: 'nvo-lit-09',
    author: 'Иван Вазов',
    title: 'Опълченците на Шипка',
    image: '/nvo-literature/opalchensite-na-shipka.jpg',
    theme: 'Борба и саможертва',
  },
  {
    id: 'nvo-lit-10',
    author: 'Иван Вазов',
    title: 'Една българка',
    image: '/nvo-literature/edna-bulgarka.jpg',
    theme: 'Борба и саможертва',
  },
  {
    id: 'nvo-lit-11',
    author: 'Христо Смирненски',
    title: 'Братчетата на Гаврош',
    image: '/nvo-literature/bratchetata-na-gavrosh.jpg',
    theme: 'Хуманизъм и нравственост',
  },
  {
    id: 'nvo-lit-12',
    author: 'Йордан Йовков',
    title: 'Серафим',
    image: '/nvo-literature/serafim.jpg',
    theme: 'Хуманизъм и нравственост',
  },
  {
    id: 'nvo-lit-13',
    author: 'Йордан Йовков',
    title: 'По жицата',
    image: '/nvo-literature/po-zhitsata.jpg',
    theme: 'Хуманизъм и нравственост',
  },
  {
    id: 'nvo-lit-14',
    author: 'Пенчо Славейков',
    title: 'Неразделни',
    image: '/nvo-literature/nerazdelni.jpg',
    theme: 'Хуманизъм и нравственост',
  },
  {
    id: 'nvo-lit-15',
    author: 'Елин Пелин',
    title: 'По жътва',
    image: '/nvo-literature/po-zhatva.jpg',
    theme: 'Живот, труд и природа',
  },
  {
    id: 'nvo-lit-16',
    author: 'Елин Пелин',
    title: 'Косачи',
    image: '/nvo-literature/kosachi.jpg',
    theme: 'Живот, труд и природа',
  },
  {
    id: 'nvo-lit-17',
    author: 'Веселин Ханчев',
    title: 'Художник',
    image: '/nvo-literature/hudozhnik.jpg',
    theme: 'Живот, труд и природа',
  },
  {
    id: 'nvo-lit-18',
    author: 'Иван Вазов',
    title: 'Из „Немили-недраги"',
    image: '/nvo-literature/nemili-nedragi.jpg',
    theme: 'Откъси от произведения',
  },
  {
    id: 'nvo-lit-19',
    author: 'Иван Вазов',
    title: 'Из „Под игото" — Представлението',
    image: '/nvo-literature/pod-igoto-predstavlenieto.jpg',
    theme: 'Откъси от произведения',
  },
  {
    id: 'nvo-lit-20',
    author: 'Иван Вазов',
    title: 'Радини вълнения',
    image: '/nvo-literature/radini-valneniya.jpg',
    theme: 'Откъси от произведения',
  },
  {
    id: 'nvo-lit-21',
    author: 'Алеко Константинов',
    title: 'Бай Ганьо пътува',
    image: '/nvo-literature/bai-ganio-patuva.jpg',
    theme: 'Откъси от произведения',
  },
  {
    id: 'nvo-lit-22',
    author: 'Алеко Константинов',
    title: 'Из „До Чикаго и назад"',
    image: '/nvo-literature/do-chikago-i-nazad.jpg',
    theme: 'Откъси от произведения',
  },
]
