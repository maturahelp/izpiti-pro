'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BrandLogo } from '@/components/shared/BrandLogo'

type BrochurePageData = {
  id: string
  chapter: string
  nav: string
  title: string
}

const brochurePages: BrochurePageData[] = [
  { id: 'cover', chapter: 'Начало', nav: 'Начало', title: 'MaturaHelp' },
  { id: 'about', chapter: 'Какво е', nav: 'Какво е', title: 'Какво е MaturaHelp?' },
  { id: 'method', chapter: 'Как се учи', nav: 'Как учиш вътре?', title: 'Как учиш вътре?' },
  { id: 'lessons', chapter: 'Видео уроци', nav: 'Видео', title: 'Видео уроци' },
  { id: 'practice', chapter: 'Практика', nav: 'Практика', title: 'Практика и тестове' },
  { id: 'ai', chapter: 'AI помощник', nav: 'AI', title: 'AI помощник' },
  { id: 'exams', chapter: 'Изпити', nav: 'НВО и ДЗИ', title: 'НВО и ДЗИ' },
  { id: 'start', chapter: 'Старт', nav: 'Старт', title: 'Започни подготовката си' },
]

const smoothEase = [0.21, 0.47, 0.32, 0.98] as const

const pageVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 92 : -92,
    scale: 0.975,
    filter: 'blur(10px)',
  }),
  center: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -92 : 92,
    scale: 0.985,
    filter: 'blur(8px)',
  }),
}

const pageContentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: smoothEase },
  },
}

function clsx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function AnimatedPageContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={pageContentVariants} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  )
}

function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={revealItemVariants} className={className}>
      {children}
    </motion.div>
  )
}

function FloatingShapes({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const reduceMotion = useReducedMotion()
  const shapes = [
    { className: 'left-[7%] top-[18%] h-14 w-28 rounded-[2rem]', float: -18, rotate: -9, duration: 8 },
    { className: 'right-[10%] top-[17%] h-20 w-20 rounded-3xl', float: 16, rotate: 11, duration: 9 },
    { className: 'bottom-[18%] left-[13%] h-16 w-16 rounded-2xl', float: 12, rotate: 18, duration: 10 },
    { className: 'bottom-[20%] right-[15%] h-12 w-32 rounded-[2rem]', float: -14, rotate: -13, duration: 11 },
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.span
          key={`${shape.className}-${index}`}
          className={clsx(
            'absolute block border shadow-[0_18px_44px_rgba(27,40,69,0.08)]',
            shape.className,
            tone === 'dark' ? 'border-white/14 bg-white/6' : 'border-[#5899E2]/18 bg-white/42'
          )}
          initial={{ opacity: tone === 'dark' ? 0.28 : 0.46, rotate: shape.rotate }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, shape.float, 0],
                  rotate: [shape.rotate, shape.rotate + 8, shape.rotate],
                  opacity: tone === 'dark' ? [0.22, 0.42, 0.22] : [0.36, 0.68, 0.36],
                }
          }
          transition={{ duration: shape.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function usePageNavigation() {
  const [pageIndex, setPageIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const readHash = () => {
      const match = window.location.hash.match(/page=(\d+)/)
      if (!match) return
      const next = Math.min(Math.max(Number(match[1]) - 1, 0), brochurePages.length - 1)
      setDirection(next >= pageIndex ? 1 : -1)
      setPageIndex(next)
    }

    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [pageIndex])

  const goToPage = useCallback(
    (nextIndex: number) => {
      const safeIndex = Math.min(Math.max(nextIndex, 0), brochurePages.length - 1)
      setDirection(safeIndex >= pageIndex ? 1 : -1)
      setPageIndex(safeIndex)
      window.location.hash = `page=${safeIndex + 1}`
    },
    [pageIndex]
  )

  const nextPage = useCallback(() => goToPage(pageIndex + 1), [goToPage, pageIndex])
  const prevPage = useCallback(() => goToPage(pageIndex - 1), [goToPage, pageIndex])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') nextPage()
      if (event.key === 'ArrowLeft') prevPage()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nextPage, prevPage])

  return { pageIndex, direction, goToPage, nextPage, prevPage }
}

function BrochureTopBar({
  pageIndex,
  goToPage,
}: {
  pageIndex: number
  goToPage: (index: number) => void
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#D9E4F2]/20 bg-[#1B2845] text-white">
      <div className="flex h-[64px] items-center gap-4 px-4 sm:px-7">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <BrandLogo className="h-9 w-9 shrink-0" />
          <span className="text-lg font-black tracking-normal">MaturaHelp</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 justify-center gap-1 lg:flex" aria-label="Brochure sections">
          {brochurePages.slice(1, 7).map((page, index) => {
            const realIndex = index + 1
            return (
              <motion.button
                key={page.id}
                type="button"
                onClick={() => goToPage(realIndex)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  'rounded-full px-4 py-2 text-xs font-bold transition',
                  pageIndex === realIndex ? 'bg-white text-[#1B2845]' : 'text-white/72 hover:bg-white/10 hover:text-white'
                )}
              >
                {page.nav}
              </motion.button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            disabled
            className="hidden cursor-not-allowed rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white/45 sm:inline-flex"
          >
            Download brochure PDF
          </button>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/register"
              className="rounded-xl bg-[#5899E2] px-4 py-2 text-xs font-black text-white shadow-[0_8px_22px_rgba(88,153,226,0.24)] transition hover:bg-[#335C81]"
            >
              Започни
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={clsx('relative h-[calc(100svh-64px)] min-h-[620px] overflow-x-hidden overflow-y-auto pt-[64px] lg:overflow-hidden', className)}>
      {children}
    </section>
  )
}

function BigSerif({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={clsx('font-black tracking-normal leading-[0.96]', className)}>{children}</h1>
}

function PageNumber({ pageIndex }: { pageIndex: number }) {
  return (
    <div className="absolute bottom-5 right-5 z-20 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#274060] shadow-sm backdrop-blur">
      {String(pageIndex + 1).padStart(2, '0')} / {String(brochurePages.length).padStart(2, '0')}
    </div>
  )
}

function CoverPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-[#1B2845] text-white">
      <video className="absolute inset-0 h-full w-full object-cover opacity-42" src="/landing-video.mp4" autoPlay muted loop playsInline />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,40,69,0.94),rgba(39,64,96,0.42),rgba(27,40,69,0.76))]" />
      <FloatingShapes tone="dark" />
      <AnimatedPageContent className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 pb-14 sm:px-10">
        <RevealItem>
          <p className="mb-5 max-w-lg text-sm font-black uppercase tracking-[0.18em] text-[#D9E4F2]">
            Интерактивна брошура за ученици
          </p>
        </RevealItem>
        <RevealItem>
          <BigSerif className="max-w-3xl text-5xl text-white sm:text-7xl lg:text-8xl">
            MaturaHelp
          </BigSerif>
        </RevealItem>
        <RevealItem>
          <p className="mt-7 max-w-2xl text-2xl font-black leading-tight text-white sm:text-4xl">
            Подредена подготовка за НВО и ДЗИ
          </p>
        </RevealItem>
        <RevealItem>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
            Видео уроци, теория, тестове и AI помощник в една платформа - направена за ученици, които искат да знаят какво да учат, защо е важно и как да проверят напредъка си.
          </p>
        </RevealItem>
        <RevealItem className="mt-9 flex flex-col gap-3 sm:flex-row">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link href="/register" className="block rounded-xl bg-white px-6 py-3 text-center text-sm font-black text-[#1B2845] transition hover:bg-[#D9E4F2]">
              Започни безплатно
            </Link>
          </motion.div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-white/20 px-6 py-3 text-sm font-black text-white/45"
          >
            Download brochure PDF
          </button>
        </RevealItem>
      </AnimatedPageContent>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function AboutPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-white">
      <FloatingShapes />
      <div className="grid h-full lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#D9E4F2] lg:block">
          <Image src="/brand/hero-graduate.webp" alt="" fill sizes="45vw" className="object-cover" priority={false} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,17,43,0.05),rgba(6,17,43,0.58))]" />
          <div className="absolute bottom-12 left-12 right-12">
            <p className="text-5xl font-black leading-none tracking-normal text-white">За ученици</p>
            <p className="mt-4 max-w-md text-base font-semibold leading-7 text-white/80">
              Когато подготовката е подредена, ученето спира да изглежда като хаос.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center px-6 py-12 sm:px-12 lg:px-16">
          <AnimatedPageContent className="max-w-2xl">
            <RevealItem>
              <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#5899E2]">Какво е MaturaHelp?</p>
            </RevealItem>
            <RevealItem>
              <BigSerif className="text-[2.55rem] text-[#1B2845] sm:text-6xl">
                Едно място за цялата подготовка.
              </BigSerif>
            </RevealItem>
            <RevealItem>
              <p className="mt-7 text-lg leading-9 text-slate-700">
                MaturaHelp събира уроци, теория, тестове и помощ при трудните моменти в един ясен път. Вместо да скачаш между учебници, клипове, файлове и случайни сайтове, виждаш какво следва и защо.
              </p>
            </RevealItem>
            <RevealItem className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['01', 'Гледаш урок'],
                ['02', 'Решаваш тест'],
                ['03', 'Питаш, когато не е ясно'],
              ].map(([number, label]) => (
                <motion.div key={number} whileHover={{ y: -4 }} className="border-t-2 border-[#274060] pt-4">
                  <p className="text-4xl font-black text-[#5899E2]">{number}</p>
                  <p className="mt-2 text-sm font-black text-[#1B2845]">{label}</p>
                </motion.div>
              ))}
            </RevealItem>
          </AnimatedPageContent>
        </div>
      </div>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function MethodPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-[#F8FAFC]">
      <FloatingShapes />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6 py-12 sm:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <AnimatedPageContent>
            <RevealItem>
              <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#5899E2]">Как учиш вътре?</p>
            </RevealItem>
            <RevealItem>
              <BigSerif className="text-[2.55rem] text-[#274060] sm:text-6xl">
                Урокът не свършва с гледане.
              </BigSerif>
            </RevealItem>
            <RevealItem>
              <p className="mt-6 text-lg leading-9 text-slate-700">
                Всяка тема е подредена като кратък маршрут. Първо разбираш идеята, после виждаш най-важното, решаваш задачи и проверяваш къде имаш пропуски.
              </p>
            </RevealItem>
          </AnimatedPageContent>
          <AnimatedPageContent className="grid gap-4 sm:grid-cols-2">
            {[
              ['Видео', 'Кратко обяснение на темата с фокус върху изпита.'],
              ['Теория', 'Най-важното е събрано без излишно лутане.'],
              ['Тест', 'Проверяваш дали наистина си разбрал урока.'],
              ['Напредък', 'Виждаш какво остава за преговор.'],
            ].map(([title, text], index) => (
              <RevealItem key={title}>
                <motion.div whileHover={{ y: -6, scale: 1.015 }} className="h-full rounded-2xl bg-white p-6 shadow-[0_14px_38px_rgba(27,40,69,0.08)]">
                <p className="text-sm font-black text-[#5899E2]">0{index + 1}</p>
                <h2 className="mt-5 text-3xl font-black tracking-normal text-[#1B2845]">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{text}</p>
                </motion.div>
              </RevealItem>
            ))}
          </AnimatedPageContent>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-12 w-3/5 skew-x-[-18deg] bg-[#274060]" />
      <div className="absolute bottom-0 right-0 h-12 w-2/5 skew-x-[-18deg] bg-[#5899E2]" />
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function LessonsPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-white">
      <FloatingShapes />
      <div className="relative z-10 mx-auto grid h-full max-w-6xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.92fr_1.08fr]">
        <AnimatedPageContent>
          <RevealItem>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#5899E2]">Видео уроци</p>
          </RevealItem>
          <RevealItem>
            <BigSerif className="text-[2.55rem] text-[#1B2845] sm:text-6xl">
              Виждаш структурата, не само текста.
            </BigSerif>
          </RevealItem>
          <RevealItem>
            <p className="mt-7 text-lg leading-9 text-slate-700">
              Най-важните теми са обяснени кратко, ясно и визуално. Това помага да разбереш какво се търси на изпита и кои детайли наистина имат значение.
            </p>
          </RevealItem>
          <RevealItem>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="mt-8 inline-flex">
              <Link href="/register" className="rounded-xl bg-[#274060] px-6 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(39,64,96,0.18)] transition hover:bg-[#1B2845]">
                Гледай примерен урок
              </Link>
            </motion.div>
          </RevealItem>
        </AnimatedPageContent>
        <RevealItem>
          <motion.div whileHover={{ y: -6, rotate: -0.35 }} className="overflow-hidden rounded-2xl bg-[#1B2845] shadow-[0_22px_58px_rgba(27,40,69,0.18)]">
          <div className="relative aspect-video">
            <video className="h-full w-full object-cover" src="/Sequence%2002_1.mp4" controls preload="metadata" playsInline />
            <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#274060] shadow-sm">
              MaturaHelp видео урок
            </div>
          </div>
          </motion.div>
        </RevealItem>
      </div>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function PracticePage({ pageIndex }: { pageIndex: number }) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const reduceMotion = useReducedMotion()
  const answers = ['A. Ще уча каквото намеря.', 'Б. Ще мина урок, теория и тест.', 'В. Ще оставя всичко за последно.']

  async function handleAnswer(index: number) {
    setSelectedAnswer(index)

    if (index === 1 && !reduceMotion) {
      const confetti = (await import('canvas-confetti')).default
      confetti({
        particleCount: 54,
        spread: 52,
        scalar: 0.75,
        startVelocity: 30,
        origin: { x: 0.72, y: 0.62 },
      })
    }
  }

  return (
    <PageShell className="bg-[#DCE8F7]">
      <FloatingShapes />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6 py-12 sm:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimatedPageContent>
            <RevealItem>
              <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#335C81]">Практика и тестове</p>
            </RevealItem>
            <RevealItem>
              <BigSerif className="text-[2.55rem] text-[#1B2845] sm:text-6xl">
                След всеки урок идва проверка.
              </BigSerif>
            </RevealItem>
            <RevealItem>
              <p className="mt-7 text-lg leading-9 text-slate-700">
                Тестовете показват дали темата е усвоена, а не само прочетена. Така знаеш какво вече владееш и къде има нужда от още преговор.
              </p>
            </RevealItem>
          </AnimatedPageContent>
          <motion.div whileHover={{ y: -6 }} className="rounded-2xl bg-white p-6 shadow-[0_18px_48px_rgba(27,40,69,0.1)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5899E2]">Кратък тест</p>
            <h2 className="mt-5 text-2xl font-black tracking-normal text-[#1B2845]">Кое изречение е подготвено правилно?</h2>
            <div className="mt-6 space-y-3">
              {answers.map((answer, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === 1
                const showCorrect = selectedAnswer !== null && isCorrect
                const showWrong = isSelected && !isCorrect

                return (
                  <motion.button
                    key={answer}
                    type="button"
                    onClick={() => handleAnswer(index)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.985 }}
                    className={clsx(
                      'w-full rounded-xl border px-4 py-3 text-left text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-[#5899E2]/35',
                      showCorrect && 'border-[#5899E2] bg-[#F0F6FC] text-[#274060] shadow-[0_8px_20px_rgba(88,153,226,0.12)]',
                      showWrong && 'border-rose-200 bg-rose-50 text-rose-700',
                      !showCorrect && !showWrong && 'border-slate-100 bg-white text-slate-500 hover:border-[#5899E2]/50 hover:bg-[#F8FAFC]'
                    )}
                    aria-pressed={isSelected}
                  >
                    {answer}
                  </motion.button>
                )
              })}
            </div>
            {selectedAnswer !== null && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-xl bg-[#274060] px-4 py-3 text-sm font-bold leading-6 text-white"
              >
                {selectedAnswer === 1
                  ? 'Верният отговор е Б: подготовката работи най-добре, когато има последователност.'
                  : 'Пробвай отговор Б. Идеята е да минеш през урок, теория и тест, вместо да учиш хаотично.'}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function AiPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-[#1B2845] text-white">
      <div className="absolute inset-0 opacity-18" style={{ backgroundImage: 'linear-gradient(#D9E4F2 1px, transparent 1px), linear-gradient(90deg, #D9E4F2 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
      <FloatingShapes tone="dark" />
      <div className="relative mx-auto grid h-full max-w-6xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
        <AnimatedPageContent>
          <RevealItem>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#9AC2E8]">AI помощник</p>
          </RevealItem>
          <RevealItem>
            <BigSerif className="text-[2.35rem] text-white sm:text-6xl">
              Когато нещо не е ясно, не оставаш сам.
            </BigSerif>
          </RevealItem>
          <RevealItem>
            <p className="mt-7 text-lg leading-9 text-white/75">
              AI помощникът може да обясни трудна тема, да даде насока и да помогне при грешки. Той е подкрепа по време на подготовката и не заменя учител.
            </p>
          </RevealItem>
        </AnimatedPageContent>
        <motion.div whileHover={{ y: -6, scale: 1.01 }} className="rounded-2xl bg-white p-5 text-[#1B2845] shadow-[0_22px_58px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#274060] text-sm font-black text-white">AI</span>
            <div>
              <p className="text-sm font-black">MaturaHelp помощник</p>
              <p className="text-xs font-semibold text-slate-400">насока, когато заседнеш</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="ml-auto max-w-[82%] rounded-xl bg-[#274060] px-4 py-3 text-sm font-bold leading-6 text-white">
              Не разбирам кога се пише пълен член.
            </div>
            <div className="max-w-[88%] rounded-xl bg-[#F0F6FC] px-4 py-3 text-sm font-bold leading-6">
              Провери дали думата може да се замени с &quot;той&quot;. Ако може, обикновено е пълен член.
            </div>
            <div className="max-w-[88%] rounded-xl bg-[#F0F6FC] px-4 py-3 text-sm font-bold leading-6">
              Искаш ли да направим 3 кратки примера за упражнение?
            </div>
          </div>
        </motion.div>
      </div>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function ExamsPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-white">
      <FloatingShapes />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6 py-12 sm:px-10">
        <AnimatedPageContent className="w-full">
          <RevealItem>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#5899E2]">НВО и ДЗИ</p>
          </RevealItem>
          <RevealItem>
            <BigSerif className="max-w-3xl text-[2.55rem] text-[#1B2845] sm:text-6xl">
              Избираш изпита. Следваш пътя.
            </BigSerif>
          </RevealItem>
          <RevealItem className="mt-10 grid gap-6 md:grid-cols-2">
            <motion.div whileHover={{ y: -6 }} className="rounded-2xl bg-[#D9E4F2] p-7">
              <h2 className="text-4xl font-black tracking-normal text-[#274060]">НВО след 7. клас</h2>
              <p className="mt-5 text-base font-semibold leading-8 text-slate-700">
                Подготовка по Български език, Литература и Математика с теми, видео уроци, теория и тестове.
              </p>
              <Link href="/dashboard/tests" className="mt-7 inline-flex rounded-xl bg-[#274060] px-5 py-3 text-sm font-black text-white">
                Виж НВО
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="rounded-2xl bg-[#274060] p-7 text-white">
              <h2 className="text-4xl font-black tracking-normal text-white">ДЗИ след 12. клас</h2>
              <p className="mt-5 text-base font-semibold leading-8 text-white/76">
                Подготовка по Български език, Литература и Английски с ясни материали и изпитна практика.
              </p>
              <Link href="/dashboard/tests" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-[#274060]">
                Виж ДЗИ
              </Link>
            </motion.div>
          </RevealItem>
        </AnimatedPageContent>
      </div>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function StartPage({ pageIndex }: { pageIndex: number }) {
  return (
    <PageShell className="bg-[#1B2845] text-white">
      <FloatingShapes tone="dark" />
      <div className="relative z-10 mx-auto grid h-full max-w-6xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2">
        <AnimatedPageContent>
          <RevealItem>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#9AC2E8]">За ученици</p>
          </RevealItem>
          <RevealItem>
            <BigSerif className="text-[2.55rem] text-white sm:text-6xl">
              Започни подготовката си спокойно.
            </BigSerif>
          </RevealItem>
          <RevealItem>
            <p className="mt-7 text-lg leading-9 text-white/74">
              Ако искаш да учиш по-ясно, да виждаш напредъка си и да имаш помощ, когато нещо не е ясно, MaturaHelp е мястото, от което да започнеш.
            </p>
          </RevealItem>
          <RevealItem className="mt-9 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/register" className="block rounded-xl bg-white px-6 py-3 text-center text-sm font-black text-[#1B2845]">
                Започни безплатно
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/#pricing" className="block rounded-xl border border-white/20 px-6 py-3 text-center text-sm font-black text-white">
                Виж плановете
              </Link>
            </motion.div>
          </RevealItem>
        </AnimatedPageContent>
        <motion.div whileHover={{ y: -6, scale: 1.01 }} className="rounded-2xl border border-white/10 bg-white/7 p-7">
          <p className="text-5xl font-black tracking-normal">MaturaHelp</p>
          <div className="mt-10 space-y-5 text-lg font-semibold leading-8 text-white/78">
            <p>Нови възможности.</p>
            <p>По-малко лутане.</p>
            <p>Повече увереност преди изпита.</p>
          </div>
          <p className="mt-12 text-3xl font-black tracking-normal text-white">Учи ясно. Учи спокойно.</p>
        </motion.div>
      </div>
      <PageNumber pageIndex={pageIndex} />
    </PageShell>
  )
}

function renderPage(id: string, pageIndex: number) {
  switch (id) {
    case 'cover':
      return <CoverPage pageIndex={pageIndex} />
    case 'about':
      return <AboutPage pageIndex={pageIndex} />
    case 'method':
      return <MethodPage pageIndex={pageIndex} />
    case 'lessons':
      return <LessonsPage pageIndex={pageIndex} />
    case 'practice':
      return <PracticePage pageIndex={pageIndex} />
    case 'ai':
      return <AiPage pageIndex={pageIndex} />
    case 'exams':
      return <ExamsPage pageIndex={pageIndex} />
    default:
      return <StartPage pageIndex={pageIndex} />
  }
}

export function BrochurePage() {
  const reduceMotion = useReducedMotion()
  const { pageIndex, direction, goToPage, nextPage, prevPage } = usePageNavigation()
  const activePage = brochurePages[pageIndex]
  const progress = useMemo(() => `${((pageIndex + 1) / brochurePages.length) * 100}%`, [pageIndex])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-hidden bg-[#1B2845]">
        <BrochureTopBar pageIndex={pageIndex} goToPage={goToPage} />
        <div className="fixed left-0 right-0 top-[64px] z-40 h-1 bg-white/10">
          <div className="h-full bg-[#5899E2] transition-[width] duration-300" style={{ width: progress }} />
        </div>

        <main className="relative pt-[64px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activePage.id}
              custom={direction}
              variants={pageVariants}
              initial={reduceMotion ? false : 'enter'}
              animate="center"
              exit={reduceMotion ? undefined : 'exit'}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease: smoothEase }}
            >
              {renderPage(activePage.id, pageIndex)}
            </motion.div>
          </AnimatePresence>
        </main>

        <motion.button
          type="button"
          onClick={prevPage}
          disabled={pageIndex === 0}
          aria-label="Предишна страница"
          whileHover={pageIndex === 0 ? undefined : { width: 50 }}
          whileTap={pageIndex === 0 ? undefined : { scale: 0.96 }}
          className="fixed left-0 top-1/2 z-50 flex h-20 w-11 -translate-y-1/2 items-center justify-center rounded-r-xl bg-white text-3xl font-light text-[#1B2845] shadow-md transition hover:bg-[#D9E4F2] disabled:cursor-not-allowed disabled:opacity-35"
        >
          ‹
        </motion.button>
        <motion.button
          type="button"
          onClick={nextPage}
          disabled={pageIndex === brochurePages.length - 1}
          aria-label="Следваща страница"
          whileHover={pageIndex === brochurePages.length - 1 ? undefined : { width: 50 }}
          whileTap={pageIndex === brochurePages.length - 1 ? undefined : { scale: 0.96 }}
          className="fixed right-0 top-1/2 z-50 flex h-20 w-11 -translate-y-1/2 items-center justify-center rounded-l-xl bg-white text-3xl font-light text-[#1B2845] shadow-md transition hover:bg-[#D9E4F2] disabled:cursor-not-allowed disabled:opacity-35"
        >
          ›
        </motion.button>

        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full bg-[#1B2845]/86 px-3 py-2 backdrop-blur">
          {brochurePages.map((page, index) => (
            <motion.button
              key={page.id}
              type="button"
              onClick={() => goToPage(index)}
              aria-label={`Отиди на страница ${index + 1}: ${page.chapter}`}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.9 }}
              className={clsx('h-2.5 rounded-full transition-all', pageIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/70')}
            />
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}
