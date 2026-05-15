import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Question = {
  number: number
  type: 'single_choice' | 'open_response'
  question: string
  options?: Record<string, string>
  correct_option?: string
  official_answer?: string
  answer_guide?: string | Record<string, string>
  question_image?: string
  points?: number
  section: 'nvo4'
  source_tags: {
    source_id: string
    topic_bucket: string
  }
}

type Exam = {
  id: string
  title: string
  year: number
  subject: string
  published_at: string
  source_title: string
  source_text?: string
  exam_type: 'nvo4_bel' | 'nvo4_math'
  questions: Question[]
}

const root = process.cwd()
const mockPath = path.join(root, 'data', 'mock_nvo4_exam_practice.json')
const figureDir = path.join(root, 'public', 'nvo4-generated-figures')

function writeFigure(filename: string, svg: string) {
  mkdirSync(figureDir, { recursive: true })
  writeFileSync(path.join(figureDir, filename), svg)
  return `/nvo4-generated-figures/${filename}`
}

function svgFrame(width: number, height: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`
}

function circleFigure(id: string, variant: number) {
  const labels = ['A', 'B', 'C', 'M', 'K']
  const offset = variant % 8
  return writeFigure(`${id}-q13.svg`, svgFrame(260, 220, `
    <circle cx="130" cy="110" r="72" fill="none" stroke="#222" stroke-width="2"/>
    <circle cx="130" cy="110" r="3.5" fill="#222"/>
    <line x1="130" y1="110" x2="130" y2="38" stroke="#222" stroke-width="2"/>
    <line x1="130" y1="110" x2="${183 + offset}" y2="62" stroke="#222" stroke-width="2"/>
    <line x1="75" y1="157" x2="${183 + offset}" y2="62" stroke="#222" stroke-width="2"/>
    <line x1="87" y1="174" x2="196" y2="144" stroke="#222" stroke-width="2"/>
    <text x="121" y="128" font-size="18" font-family="Arial">O</text>
    <text x="123" y="30" font-size="18" font-family="Arial">${labels[0]}</text>
    <text x="${190 + offset}" y="61" font-size="18" font-family="Arial">${labels[1]}</text>
    <text x="62" y="170" font-size="18" font-family="Arial">${labels[2]}</text>
    <text x="81" y="194" font-size="18" font-family="Arial">${labels[3]}</text>
    <text x="201" y="145" font-size="18" font-family="Arial">${labels[4]}</text>
  `))
}

function trianglesFigure(id: string, variant: number) {
  const shift = variant % 12
  return writeFigure(`${id}-q14.svg`, svgFrame(300, 170, `
    <polygon points="30,140 150,20 270,140" fill="none" stroke="#222" stroke-width="2"/>
    <line x1="90" y1="80" x2="210" y2="80" stroke="#222" stroke-width="2"/>
    <line x1="150" y1="20" x2="${150 + shift}" y2="140" stroke="#222" stroke-width="2"/>
    <line x1="90" y1="80" x2="${150 + shift}" y2="140" stroke="#222" stroke-width="2"/>
    <line x1="210" y1="80" x2="${150 + shift}" y2="140" stroke="#222" stroke-width="2"/>
  `))
}

function distanceFigure(id: string, variant: number) {
  const first = 48 + variant
  const second = first + 12
  return writeFigure(`${id}-q15.svg`, svgFrame(420, 110, `
    <line x1="48" y1="56" x2="360" y2="56" stroke="#222" stroke-width="3"/>
    <circle cx="48" cy="56" r="5" fill="#222"/><circle cx="238" cy="56" r="5" fill="#222"/><circle cx="360" cy="56" r="5" fill="#222"/>
    <text x="26" y="35" font-size="18" font-family="Arial">София</text>
    <text x="196" y="35" font-size="18" font-family="Arial">Самоков</text>
    <text x="326" y="35" font-size="18" font-family="Arial">Боровец</text>
    <text x="128" y="86" font-size="18" font-family="Arial">${first} км</text>
    <text x="270" y="86" font-size="18" font-family="Arial">${second} км</text>
  `))
}

function barModelFigure(id: string, variant: number) {
  const apples = 400 + variant * 20
  return writeFigure(`${id}-q16.svg`, svgFrame(380, 140, `
    <text x="22" y="38" font-size="18" font-family="Arial">ябълки</text>
    <rect x="110" y="20" width="100" height="26" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2"/>
    <text x="134" y="39" font-size="16" font-family="Arial">${apples} кг</text>
    <text x="22" y="90" font-size="18" font-family="Arial">круши</text>
    <rect x="110" y="72" width="100" height="26" fill="#dcfce7" stroke="#166534" stroke-width="2"/>
    <rect x="210" y="72" width="100" height="26" fill="#dcfce7" stroke="#166534" stroke-width="2"/>
  `))
}

function shadedGridFigure(id: string, variant: number) {
  const cells = Array.from({ length: 12 }, (_, i) => {
    const x = 20 + (i % 4) * 42
    const y = 20 + Math.floor(i / 4) * 42
    const shaded = i < 5 + (variant % 3)
    return `<rect x="${x}" y="${y}" width="42" height="42" fill="${shaded ? '#111827' : '#fff'}" stroke="#222" stroke-width="2"/>`
  }).join('')
  return writeFigure(`${id}-q19.svg`, svgFrame(210, 160, cells))
}

function tableFigure(id: string, variant: number) {
  const totals = [140 + variant * 3, 160 + variant * 2, 130 + variant * 4]
  const free = [22 + variant, 18 + variant, 31 + variant]
  const rows = totals.map((total, index) => {
    const y = 58 + index * 34
    return `<text x="28" y="${y}" font-size="16" font-family="Arial">Ниво ${index + 1}</text><text x="150" y="${y}" font-size="16" font-family="Arial">${total}</text><text x="250" y="${y}" font-size="16" font-family="Arial">${free[index]}</text>`
  }).join('')
  return writeFigure(`${id}-q20.svg`, svgFrame(340, 170, `
    <rect x="12" y="18" width="310" height="132" fill="none" stroke="#222" stroke-width="2"/>
    <line x1="120" y1="18" x2="120" y2="150" stroke="#222" stroke-width="1.5"/>
    <line x1="220" y1="18" x2="220" y2="150" stroke="#222" stroke-width="1.5"/>
    <line x1="12" y1="42" x2="322" y2="42" stroke="#222" stroke-width="1.5"/>
    <text x="28" y="36" font-size="14" font-family="Arial">Ниво</text><text x="140" y="36" font-size="14" font-family="Arial">Общо</text><text x="240" y="36" font-size="14" font-family="Arial">Свободни</text>
    ${rows}
  `))
}

function installmentFigure(id: string, variant: number) {
  const cash = 820 + variant * 30
  const monthly = 85 + variant * 2
  const months = 11 + (variant % 2)
  return writeFigure(`${id}-q23.svg`, svgFrame(340, 125, `
    <rect x="16" y="18" width="308" height="88" rx="8" fill="#f8fafc" stroke="#222" stroke-width="2"/>
    <text x="34" y="48" font-size="18" font-family="Arial">Цена в брой: ${cash} лв.</text>
    <text x="34" y="82" font-size="18" font-family="Arial">На вноски: ${months} x ${monthly} лв.</text>
  `))
}

function barChartFigure(id: string, variant: number) {
  const values = [360 + variant * 20, 280 + variant * 15, 420 + variant * 10]
  const max = Math.max(...values)
  const bars = values.map((value, index) => {
    const h = Math.round((value / max) * 110)
    const x = 58 + index * 90
    return `<rect x="${x}" y="${140 - h}" width="42" height="${h}" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2"/><text x="${x - 8}" y="162" font-size="14" font-family="Arial">${['домати', 'краст.', 'чушки'][index]}</text><text x="${x}" y="${132 - h}" font-size="14" font-family="Arial">${value}</text>`
  }).join('')
  return writeFigure(`${id}-q24.svg`, svgFrame(330, 180, `<line x1="36" y1="140" x2="300" y2="140" stroke="#222" stroke-width="2"/>${bars}`))
}

function shopFigure(id: string, variant: number) {
  const prices = [120 + variant * 2, 48 + variant, 32 + variant, 24 + variant, 18 + variant]
  return writeFigure(`${id}-q25.svg`, svgFrame(430, 135, `
    <rect x="12" y="16" width="406" height="96" fill="none" stroke="#222" stroke-width="2"/>
    <line x1="12" y1="46" x2="418" y2="46" stroke="#222" stroke-width="1.5"/>
    ${['яке', 'ръкавици', 'шал', 'шапка', 'топка'].map((item, i) => `<text x="${28 + i * 78}" y="36" font-size="15" font-family="Arial">${item}</text><text x="${34 + i * 78}" y="82" font-size="17" font-family="Arial">${prices[i]} лв.</text>`).join('')}
  `))
}

function storyFigure(id: string, variant: number) {
  return writeFigure(`${id}-q25.svg`, svgFrame(520, 170, `
    <rect x="18" y="18" width="145" height="120" rx="8" fill="#fef3c7" stroke="#92400e" stroke-width="2"/>
    <rect x="188" y="18" width="145" height="120" rx="8" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
    <rect x="358" y="18" width="145" height="120" rx="8" fill="#dcfce7" stroke="#166534" stroke-width="2"/>
    <text x="42" y="82" font-size="18" font-family="Arial">1. Проблем</text>
    <text x="214" y="82" font-size="18" font-family="Arial">2. Решение</text>
    <text x="390" y="82" font-size="18" font-family="Arial">3. Радост</text>
    <text x="42" y="156" font-size="13" font-family="Arial">Серия картини ${variant}</text>
  `))
}

function sc(number: number, question: string, options: Record<string, string>, correct: string, id: string, bucket: string, image?: string): Question {
  return {
    number,
    type: 'single_choice',
    question,
    options,
    correct_option: correct,
    official_answer: correct,
    answer_guide: correct,
    question_image: image,
    points: 2,
    section: 'nvo4',
    source_tags: { source_id: `${id}_q${String(number).padStart(2, '0')}`, topic_bucket: bucket },
  }
}

function open(number: number, question: string, answer: string, id: string, bucket: string, image?: string, points = 4): Question {
  return {
    number,
    type: 'open_response',
    question,
    official_answer: answer,
    answer_guide: answer,
    question_image: image,
    points,
    section: 'nvo4',
    source_tags: { source_id: `${id}_q${String(number).padStart(2, '0')}`, topic_bucket: bucket },
  }
}

function openMultipart(
  number: number,
  question: string,
  prompts: Record<string, string>,
  answers: Record<string, string>,
  id: string,
  bucket: string,
  image: string,
  points: number,
): Question {
  return {
    number,
    type: 'open_response',
    question,
    options: prompts,
    official_answer: Object.entries(answers).map(([label, answer]) => `${label}) ${answer}`).join('\n'),
    answer_guide: answers,
    question_image: image,
    points,
    section: 'nvo4',
    source_tags: { source_id: `${id}_q${String(number).padStart(2, '0')}`, topic_bucket: bucket },
  }
}

function makeMathMock(index: number): Exam {
  const id = `generated_nvo4_math_mock_${String(index).padStart(2, '0')}`
  const a = index
  const sumA = 8300 + a * 12
  const sumB = 670 + a * 8
  const product = (604 + a) * 7
  const apples = 400 + a * 20
  const gridCells = 5 + (a % 3)
  const side = 5 + (a % 2)
  const tableTotals = [140 + a * 3, 160 + a * 2, 130 + a * 4]
  const tableFree = [22 + a, 18 + a, 31 + a]
  const occupied = tableTotals.reduce((total, value, i) => total + value - tableFree[i], 0)
  const cash = 820 + a * 30
  const monthly = 85 + a * 2
  const months = 11 + (a % 2)
  const installmentDiff = monthly * months - cash
  const chartValues = [360 + a * 20, 280 + a * 15, 420 + a * 10]
  const chairPrice = 60 + a * 5
  const tablePrice = 90 + a * 10
  const notebooks = 240 + a * 6
  const textbooks = notebooks / 3
  const workbooks = 500 + a * 10
  const jacket = 120 + a * 2
  const gloves = 48 + a
  const scarf = 32 + a
  const hat = 24 + a

  return {
    id,
    title: `Пробен НВО по математика ${index}`,
    year: 2026,
    subject: 'Математика',
    published_at: '',
    source_title: `Генериран пробен НВО по математика ${index}`,
    exam_type: 'nvo4_math',
    questions: [
      sc(1, `Кое от числата съдържа в записа си ${7 + a} милиона и ${4 + a} десетохиляди?`, { А: `${70 + a} 4${a}5 203`, Б: `${7 + a}4${a} 056 203`, В: `${7 + a}0${4 + a} 006 203` }, 'В', id, 'place-value'),
      sc(2, `Колко е сборът на числата ${sumA} и ${sumB}?`, { А: String(sumA + sumB - 100), Б: String(sumA + sumB), В: String(sumA + sumB + 10) }, 'Б', id, 'addition'),
      sc(3, `Колко е разликата на числата ${800000 + a * 100} и ${180 + a}?`, { А: String(799820 + a * 99), Б: String(799820 + a * 100), В: String(800180 + a) }, 'Б', id, 'subtraction'),
      sc(4, `Колко е произведението на числата ${604 + a} и 7?`, { А: String(product - 70), Б: String(product), В: String(product + 7) }, 'Б', id, 'multiplication'),
      sc(5, `Колко е произведението на числата ${4080 + a * 10} и 11?`, { А: String((4080 + a * 10) * 10), Б: String((4080 + a * 10) * 11), В: String((4080 + a * 10) * 11 + 1) }, 'Б', id, 'multiplication'),
      sc(6, `Колко е частното на числата ${5300 + a * 25} и 5?`, { А: String((5300 + a * 25) / 5 - 10), Б: String((5300 + a * 25) / 5), В: String((5300 + a * 25) / 5 + 100) }, 'Б', id, 'division'),
      sc(7, `Колко е частното на числата ${(2000 + a) * 36} и 36?`, { А: String(200 + a), Б: String(2010 + a), В: String(2000 + a) }, 'В', id, 'division'),
      sc(8, `Колко е стойността на израза?\n${960 + a} \\(\\cdot\\) 26 + ${40 - a} \\(\\cdot\\) 26`, { А: '25 038', Б: '25 075', В: '26 000' }, 'В', id, 'expressions'),
      sc(9, `Как се намира неизвестното число?\n${4900 + a * 7} : \\(\\square\\) = 7`, { А: `${4900 + a * 7} : 7`, Б: `${4900 + a * 7} \\(\\cdot\\) 7`, В: `${4900 + a * 7} – 7` }, 'А', id, 'unknowns'),
      sc(10, 'В кой от числовите изрази първо трябва да се извърши действие деление?', { А: '(156 – 6) : 3', Б: '153 + 744 : 3', В: '750 : (47 + 3)' }, 'Б', id, 'order-of-operations'),
      sc(11, `Камион превозва ${5 + a} тона зърно в чували по 50 килограма. Колко броя са чувалите?`, { А: String(10 + a), Б: String((5 + a) * 20), В: String((5 + a) * 200) }, 'Б', id, 'units'),
      sc(12, `Кое число трябва да се постави в празните квадратчета, за да е вярно равенството?\n(250 + 50 + 750) \\(\\cdot\\) \\(\\square\\) = \\(\\square\\)`, { А: '0', Б: '1', В: '10' }, 'А', id, 'unknowns'),
      sc(13, 'Коя от изброените отсечки е радиус на окръжността?', { А: 'ОА', Б: 'СВ', В: 'МК' }, 'А', id, 'geometry', circleFigure(id, a)),
      sc(14, 'Колко са триъгълниците на чертежа?', { А: '6', Б: '8', В: '10' }, 'Б', id, 'geometry', trianglesFigure(id, a)),
      sc(15, 'Разстоянието от София до Самоков е показано на схемата. Колко километра е разстоянието от Самоков до Боровец?', { А: `${12 + a} км`, Б: `${24 + a} км`, В: `${60 + a} км` }, 'А', id, 'distance', distanceFigure(id, a)),
      sc(16, `Схемата илюстрира теглото на ябълките и крушите. Ябълките са ${apples} кг. Колко тежат крушите?`, { А: `${apples} кг`, Б: `${apples * 2} кг`, В: `${apples * 3} кг` }, 'Б', id, 'models', barModelFigure(id, a)),
      open(17, 'На всяка стена на куба е залепен по един стикер. Колко стикера общо са залепени?', '6', id, 'geometry'),
      open(18, `Колко е третинката от произведението на числата ${500 + a * 3} и 6?`, String((500 + a * 3) * 2), id, 'fractions'),
      open(19, `Страната на всеки квадрат от фигурата е ${side} дм. Колко квадратни дециметра е лицето на оцветената част?`, String(gridCells * side * side), id, 'area', shadedGridFigure(id, a)),
      open(20, 'Подземен паркинг има три нива. Използвай данните от таблицата и пресметни колко общо са заетите места.', String(occupied), id, 'tables', tableFigure(id, a)),
      open(21, `Три еднакви стола струват ${chairPrice * 3} лв., а два стола и четири маси струват ${2 * chairPrice + 4 * tablePrice} лв. Колко лева струва една маса?`, String(tablePrice), id, 'word-problems', undefined, 8),
      open(22, `В книжарница има общо ${notebooks + textbooks + workbooks} тетрадки, учебници и сборници. Тетрадките са ${notebooks} и са 3 пъти повече от учебниците. Колко са сборниците?`, String(workbooks), id, 'word-problems', undefined, 8),
      open(23, 'С колко лева се оскъпява пералнята при плащане на вноски?', String(installmentDiff), id, 'money', installmentFigure(id, a), 8),
      open(24, 'Схемата илюстрира продажбите на различни зеленчуци. Колко килограма зеленчуци общо са продадени?', String(chartValues.reduce((total, value) => total + value, 0)), id, 'charts', barChartFigure(id, a), 8),
      openMultipart(
        25,
        'Използвай информацията за артикулите в спортен магазин и реши задачите.',
        {
          А: 'Колко лева общо струват двата най-скъпи артикула?',
          Б: 'Колко лева са необходими за яке, ръкавици, два шала и шапка?',
          В: 'В края на сезона всички артикули над 100 лева са на половин цена. Колко лева ще струват три якета и три чифта ръкавици?',
        },
        {
          А: String(jacket + gloves),
          Б: String(jacket + gloves + 2 * scarf + hat),
          В: String((jacket / 2) * 3 + gloves * 3),
        },
        id,
        'tables',
        shopFigure(id, a),
        20,
      ),
    ],
  }
}

const belContexts = [
  ['Писмото в раницата', 'Мира намира в раницата си писмо от своята учителка. В него пише, че най-сигурният начин да се справи с трудна задача е да я раздели на малки стъпки. Мира прочита писмото няколко пъти, усмихва се и решава първо да подреди мислите си. След часа тя помага и на Дани, който се притеснява от задачите за четене. Двамата разбират, че спокойствието и постоянството вървят заедно.'],
  ['Старата карта', 'В училищната библиотека Петър открива стара карта на града. По нея улиците изглеждат като тънки нишки, а площадите - като малки острови. Библиотекарката му разказва, че картата е използвана от ученици преди много години. Петър решава да направи изложба, за да покаже как градът се е променил. Накрая целият клас добавя снимки, бележки и спомени.'],
  ['Денят на добрата дума', 'В понеделник класът на Ива обяви Ден на добрата дума. Всеки трябваше да каже нещо мило на човек, който има нужда от подкрепа. Отначало задачата изглеждаше лесна, но децата разбраха, че добрата дума трябва да бъде искрена. До края на деня стаята стана по-светла, защото всички се усмихваха повече.'],
  ['Малкият изследовател', 'Никола обичаше да наблюдава двора след дъжд. Той записваше в тетрадка как се стичат капките, къде се събират локвите и кога изгрява слънцето. Един ден забеляза, че мравките пренасят зрънца по суха пътека. Никола подготви кратък разказ за наблюдението си и го представи пред класа.'],
  ['Празникът на книгите', 'В читалището подредиха маса с любими детски книги. Ралица избра книга с приказки, но първо прочете последната страница и се засмя. Баба й обясни, че всяка история е пътешествие и е хубаво да се върви от началото. Ралица започна от първата глава и скоро забрави шума около себе си.'],
  ['Неочакваният гост', 'По време на часа по музика на прозореца кацна пъстра пеперуда. Децата замълчаха, а госпожа Маринова тихо отвори прозореца. Пеперудата полетя из стаята, сякаш слушаше песента им. След часа учениците нарисуваха картини и написаха кратки изречения за необикновения гост.'],
  ['Състезанието', 'Отборът на четвърти клас се подготвяше за училищно състезание. Алекс искаше да решава всички задачи сам, но скоро разбра, че добрият отбор слуша всеки участник. Когато Мария предложи по-кратък начин за решение, всички я подкрепиха. На финала не победиха, но бяха горди, че са работили заедно.'],
  ['Градината на баба', 'В градината на баба Елена всяко растение имаше малка табелка. Там пишеше кога е засадено и от какво се нуждае. Лора първо се засмя на табелките, но после разбра колко помагат. През ваканцията тя поливаше цветята по график и научи, че грижата изисква внимание.'],
  ['Снежната следа', 'След първия сняг Борис видя странна следа до входа. Тя се виеше покрай дървото и изчезваше зад пейката. Вместо да я стъпче, той я проследи внимателно и откри малко изгубено кученце. Борис извика съседите и скоро животното се върна при стопанина си.'],
  ['Новият часовник', 'В класната стая поставиха нов часовник. Той тиктакаше силно и напомняше на всички, че времето не бива да се губи. В началото децата се разсейваха от звука, но после го приеха като помощник. Когато работеха съсредоточено, минутите стигаха за всичко важно.'],
]

function makeBelMock(index: number): Exam {
  const id = `generated_nvo4_bel_mock_${String(index).padStart(2, '0')}`
  const [title, text] = belContexts[index - 1]
  const character = ['Мира', 'Петър', 'Ива', 'Никола', 'Ралица', 'децата', 'Алекс', 'Лора', 'Борис', 'учениците'][index - 1]
  const editWords = ['свеш', 'дарво', 'бестрашно', 'лач', 'учи', 'обичът', 'расхождат', 'хлат', 'четът', 'пишът', 'испит', 'сбъркано']

  return {
    id,
    title: `Пробен НВО по БЕЛ ${index}`,
    year: 2026,
    subject: 'Български език и литература',
    published_at: '',
    source_title: `Генериран пробен НВО по БЕЛ ${index}`,
    source_text: `Прочети внимателно текста и задачите към него.\n\n${title}\n\n${text}`,
    exam_type: 'nvo4_bel',
    questions: [
      sc(1, 'Кой е главният герой в текста?', { А: character, Б: 'случаен минувач', В: 'непознат учител' }, 'А', id, 'reading'),
      sc(2, 'Кое заглавие най-точно отговаря на текста?', { А: title, Б: 'Забравеният урок', В: 'Празният двор' }, 'А', id, 'reading'),
      sc(3, 'Какво качество проявява героят?', { А: 'невнимание', Б: 'упоритост и грижа', В: 'безразличие' }, 'Б', id, 'reading'),
      sc(4, 'Коя дума може да замени думата "подкрепа"?', { А: 'помощ', Б: 'шум', В: 'почивка' }, 'А', id, 'reading'),
      sc(5, 'Как се променя настроението в текста?', { А: 'от спокойно към тревожно', Б: 'от неуверено към по-уверено', В: 'от радостно към сърдито' }, 'Б', id, 'reading'),
      open(6, 'Кой помага на героя да стигне до решение?', 'Отговорът се приема, ако е посочено лице или обстоятелство от текста.', id, 'reading'),
      open(7, 'Запиши две думи или израза от текста, които показват отношението на героя.', 'Оценява се откриване на подходящи думи или изрази от текста.', id, 'reading'),
      open(8, 'Запиши две действия на героя в правилната последователност.', 'Оценява се вярна последователност според текста.', id, 'reading'),
      open(9, 'Каква е поуката от текста? Докажи с пример.', 'Оценява се смислен отговор с пример от текста.', id, 'reading'),
      open(10, 'Защо последното действие на героя е важно? Обоснови се.', 'Оценява се аргументиран отговор.', id, 'reading'),
      open(11, 'Запиши три довода, че героят постъпва разумно.', 'Оценява се собствено мнение с три подходящи довода.', id, 'reading'),
      sc(12, 'Колко са съществителните собствени имена в изречението?\nМира и Дани влязоха в библиотеката на госпожа Иванова.', { А: 'две', Б: 'три', В: 'четири' }, 'Б', id, 'grammar'),
      sc(13, 'Колко съществителни имена има в изречението?\nНа масата лежаха книга, молив и тетрадка.', { А: 'две', Б: 'три', В: 'четири' }, 'В', id, 'grammar'),
      sc(14, 'В кое лице и число е глаголът в изречението?\nУчениците подреждат тетрадките си.', { А: '1 л., ед. ч.', Б: '2 л., мн. ч.', В: '3 л., мн. ч.' }, 'В', id, 'grammar'),
      sc(15, 'В кое изречение глаголът е употребен в минало време?', { А: 'Децата четат тихо.', Б: 'Децата четоха тихо.', В: 'Децата ще четат тихо.' }, 'Б', id, 'grammar'),
      sc(16, 'В кой ред думите са сродни?', { А: 'вода, воден, водичка', Б: 'гора, град, гост', В: 'уча, урок, двор' }, 'А', id, 'grammar'),
      sc(17, 'В кой ред думите съдържат само корен?', { А: 'полет, препис, изход', Б: 'дом, стол, клас', В: 'безшумен, подводен, надпис' }, 'Б', id, 'grammar'),
      sc(18, 'С коя представка е уместно да се допълни думата?\nДетето __писа домашното си внимателно.', { А: 'на-', Б: 'пре-', В: 'до-' }, 'В', id, 'grammar'),
      sc(19, 'С коя сложна дума може да се допълни изречението?\nРазказвачът беше много _____________.', { А: 'сладкодумен', Б: 'безшумен', В: 'тъмносин' }, 'А', id, 'grammar'),
      sc(20, 'Колко числителни имена има в изречението?\nТретият ученик прочете две страници.', { А: 'едно', Б: 'две', В: 'три' }, 'Б', id, 'grammar'),
      sc(21, 'В кое изречение трябва да се употреби учтива форма?', { А: 'Госпожо, Вие сте много любезна.', Б: 'Приятели, вие сте готови.', В: 'Момчета, вие започвате.' }, 'А', id, 'grammar'),
      sc(22, 'В кое изречение прилагателното име е употребено в преносно значение?', { А: 'Имам синя раница.', Б: 'Тя има златно сърце.', В: 'Купихме дървена маса.' }, 'Б', id, 'grammar'),
      sc(23, 'С коя дума могат да се свържат простите изречения?\nЗапочна да вали, ___ ние останахме в двора.', { А: 'но', Б: 'че', В: 'защото' }, 'А', id, 'grammar'),
      open(24, `Открий правописните грешки в текста и запиши правилно сгрешените думи.\nВъздухът беше ${editWords[0]}. До старото ${editWords[1]} децата вървяха ${editWords[2]}. Слънчев ${editWords[3]} огря ${editWords[4]} им. Те ${editWords[5]} да се ${editWords[6]} на ${editWords[7]}, но трябваше да ${editWords[8]} и ${editWords[9]} за ${editWords[10]}.`, 'Приемат се правилно поправените сгрешени думи.', id, 'editing'),
      open(25, 'Състави кратък текст по серията картини. Постави заглавие и използвай опорните думи: проблем, решение, радост.', 'Оценява се свързан текст със заглавие, последователност и правилна писмена реч.', id, 'writing', storyFigure(id, index)),
    ],
  }
}

function main() {
  const existing = existsSync(mockPath) ? JSON.parse(readFileSync(mockPath, 'utf8')) as { exams: Exam[] } : { exams: [] }
  const sourceExams = existing.exams.filter((exam) => !exam.id.startsWith('generated_nvo4_'))
  const generated = [
    ...Array.from({ length: 10 }, (_, index) => makeBelMock(index + 1)),
    ...Array.from({ length: 10 }, (_, index) => makeMathMock(index + 1)),
  ]
  writeFileSync(mockPath, `${JSON.stringify({ exams: [...sourceExams, ...generated] }, null, 2)}\n`)
  console.log(`Wrote ${sourceExams.length} source model/sample exams and ${generated.length} generated mock exams`)
}

main()
