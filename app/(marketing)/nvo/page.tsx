import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { CTASection } from '@/components/marketing/CTASection'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/fade-in'

export const metadata: Metadata = {
  title: 'Подготовка за НВО 7 клас — Тестове и Уроци | MaturaHelp',
  description:
    'Подготви се за НВО след 7 клас с MaturaHelp. 500+ теста по БЕЛ и Математика, видео уроци и AI помощник. Използвана от 4 800+ ученици. Пробвай безплатно.',
  alternates: { canonical: '/nvo' },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: 'https://www.maturahelp.com/nvo',
    siteName: 'MaturaHelp',
    title: 'Подготовка за НВО 7 клас | MaturaHelp',
    description:
      'Тестове, видео уроци и AI помощник за НВО по БЕЛ и Математика. Подготви се уверено за 17 и 19 юни 2026.',
    images: [{ url: '/brand/maturahelp-logo.png', width: 512, height: 512, alt: 'MaturaHelp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Подготовка за НВО 7 клас | MaturaHelp',
    description:
      'Тестове, видео уроци и AI помощник за НВО по БЕЛ и Математика. Подготви се уверено за 17 и 19 юни 2026.',
    images: ['/brand/maturahelp-logo.png'],
  },
}

const nvoSubjects = [
  {
    name: 'НВО Български език и литература',
    date: '17 юни 2026',
    accent: '#2563EB',
    bg: '#EFF6FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    items: [
      'Видео уроци по всички литературни произведения',
      'Тестове за четивна компетентност',
      'Практика по правопис и граматика',
      'Теми и анализи по изпитен формат',
      'Тестове от минали НВО изпити',
    ],
  },
  {
    name: 'НВО Математика',
    date: '19 юни 2026',
    accent: '#059669',
    bg: '#ECFDF5',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    ),
    items: [
      'Задачи по всички теми от учебната програма',
      'Геометрия, алгебра и числени изрази',
      'Решения с обяснения стъпка по стъпка',
      'Тестове в реален изпитен формат',
      'Тестове от минали НВО изпити',
    ],
  },
]

const nvoFaqs = [
  {
    q: 'Кога е НВО 2026?',
    a: 'НВО по Български език и литература е на 17 юни 2026 г. НВО по Математика е на 19 юни 2026 г.',
  },
  {
    q: 'За кой клас е НВО подготовката?',
    a: 'НВО се полага след завършване на 7 клас. Платформата е насочена именно към ученици в 7 клас, подготвящи се за националното външно оценяване.',
  },
  {
    q: 'Какво включва безплатният план?',
    a: 'Безплатният план включва 1 видео урок с анализ и упражнение, всички литературни текстове, всички изпити от минали години, Тема 1 по Български и Подтема 1 по Математика.',
  },
  {
    q: 'Кога изтича достъпът за НВО?',
    a: 'Платеният план "НВО до края на изпитите" дава достъп до 19 юни 2026 г. — деня на последния НВО изпит.',
  },
  {
    q: 'Как помага AI помощникът?',
    a: 'AI помощникът отговаря на въпроси по всяка тема, обяснява трудни правила и задачи с прости думи и те насочва при грешни отговори.',
  },
  {
    q: 'Работи ли на телефон?',
    a: 'Да. Платформата е оптимизирана за мобилни устройства и работи добре на всеки телефон или таблет.',
  },
]

export default function NvoPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EDE9FE 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 md:pt-28 md:pb-20">
          <FadeIn className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/70 border border-blue-100 text-blue-700 text-[12px] font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              НВО 7 клас — 17 и 19 юни 2026
            </div>
            <h1 className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] font-extrabold text-[#1B2845] leading-[1.08] tracking-[-0.04em] mb-5">
              Подготовка за{' '}
              <span className="text-[#2563EB]">НВО 7 клас</span> —<br className="hidden sm:block" />
              всичко на едно място
            </h1>
            <p className="text-[16px] md:text-[17px] text-gray-500 leading-[1.7] mb-8 max-w-xl">
              Видео уроци, 500+ теста по БЕЛ и Математика и AI помощник в една платформа.
              Използвана от <strong className="text-[#1B2845] font-semibold">4 800+ ученици</strong> в България.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white font-bold text-[14px] rounded-full hover:bg-[#1d4ed8] transition-colors shadow-[0_4px_16px_rgba(37,99,235,0.35)]"
              >
                Започни безплатно
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a
                href="#ceni"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-[#1B2845] font-semibold text-[14px] rounded-full hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Виж плановете
              </a>
            </div>
          </FadeIn>

          {/* Stats bar */}
          <div className="mt-12 flex flex-wrap gap-8">
            {[
              { value: '4 800+', label: 'Активни ученици' },
              { value: '500+', label: 'Теста за НВО' },
              { value: '200+', label: 'Видео урока' },
              { value: '2', label: 'Предмета покрити' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[1.6rem] font-extrabold text-[#2563EB] leading-none tracking-[-0.04em]">{s.value}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-12">
            <p className="text-[11px] font-black tracking-[0.1em] uppercase text-[#2563EB] mb-3">Предмети</p>
            <h2 className="text-[1.8rem] md:text-[2.4rem] font-extrabold text-[#0D0D0D] tracking-[-0.04em] leading-[1.1]">
              Покриваме и двата НВО изпита
            </h2>
            <p className="text-[15px] text-[#6B6B6B] mt-3 max-w-lg leading-relaxed">
              Пълна подготовка по Български език и литература и Математика — в един абонамент.
            </p>
          </FadeIn>

          <StaggerChildren className="grid md:grid-cols-2 gap-5">
            {nvoSubjects.map((subject) => (
              <StaggerItem key={subject.name}>
                <div
                  className="rounded-2xl border border-[#E5E5E5] p-7 flex flex-col gap-5 hover:border-[#B0B0B0] hover:-translate-y-[3px] transition-all duration-200 bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: subject.bg, color: subject.accent }}
                    >
                      {subject.icon}
                    </div>
                    <div>
                      <h3 className="text-[1rem] font-extrabold text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                        {subject.name}
                      </h3>
                      <p className="text-[12px] mt-0.5 font-semibold" style={{ color: subject.accent }}>
                        Изпит: {subject.date}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-[#E5E5E5]" />
                  <ul className="space-y-2.5">
                    {subject.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-[#444]">
                        <svg
                          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" className="flex-shrink-0 mt-0.5" style={{ color: subject.accent }}
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <HowItWorks />

      {/* Pricing */}
      <section id="ceni" className="relative py-16 md:py-24 bg-white">
        <span id="pricing" className="absolute -top-20" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-12">
            <p className="text-[11px] font-black tracking-[0.1em] uppercase text-[#2563EB] mb-3">Цени</p>
            <h2 className="text-[1.8rem] md:text-[2.4rem] font-extrabold text-[#0D0D0D] tracking-[-0.04em] leading-[1.1]">
              Избери план за НВО
            </h2>
            <p className="text-[15px] text-[#6B6B6B] mt-3 max-w-lg leading-relaxed">
              Започни безплатно и надгради, когато решиш.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            {/* Free plan */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 flex flex-col">
              <p className="text-[11px] font-black text-[#2563EB] uppercase tracking-wide mb-2">Безплатен НВО</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-[#0D0D0D]">0 €</span>
                <span className="text-gray-400 text-sm ml-1">безплатно</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 mt-2">
                Започни подготовката без ангажимент — виж как работи платформата.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Литература: 1 видео урок + упражнение',
                  'Всички литературни текстове',
                  'Всички НВО изпити от минали години',
                  'Български: Тема 1 — теория + упражнение',
                  'Математика: Подтема 1 на Тема 1',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600">
                    <span className="text-[#2563EB] mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-auto block text-center font-semibold py-3 rounded-full text-[13.5px] bg-white text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all"
              >
                Регистрирай се безплатно
              </Link>
            </div>

            {/* Paid plan */}
            <div className="bg-white rounded-2xl border-2 border-[#2563EB] p-8 flex flex-col relative shadow-[0_8px_30px_rgba(37,99,235,0.12)]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                Препоръчан
              </span>
              <p className="text-[11px] font-black text-[#2563EB] uppercase tracking-wide mb-2">НВО до края на изпитите</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-[#0D0D0D]">30 €</span>
                <span className="text-gray-400 text-sm ml-1">еднократно</span>
              </div>
              <p className="text-[12px] text-[#2563EB] font-semibold mt-0.5 mb-2">Достъп до 19 юни 2026 г.</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                За ученици, които искат спокойствие и пълен достъп до самите изпити.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Пълен достъп до материалите за НВО',
                  'Видео уроци по всички теми и произведения',
                  'Подготовка за НВО БЕЛ — 17 юни 2026 г.',
                  'Подготовка за НВО МАТ — 19 юни 2026 г.',
                  'Упражнения и тестове в изпитен формат',
                  'AI помощник за въпроси и обяснения',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600">
                    <span className="text-[#2563EB] mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=nvo-full"
                className="mt-auto block text-center font-bold py-3 rounded-full text-[13.5px] text-white bg-[#2563EB] hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-200 transition-all"
              >
                Вземи достъп до 19 юни
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <NvoFaq />

      <CTASection />
      <Footer />
    </>
  )
}

function NvoFaq() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F8FAFF] to-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-[1.8rem] md:text-[2.4rem] font-extrabold text-[#0D0D0D] tracking-[-0.04em]">
            Въпроси за НВО
          </h2>
        </FadeIn>
        <StaggerChildren className="space-y-3">
          {nvoFaqs.map((faq) => (
            <StaggerItem key={faq.q}>
              <details className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] group">
                <summary className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-[14px] font-bold text-[#0D0D0D]">{faq.q}</span>
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-gray-400 group-open:text-[#2563EB] group-open:rotate-180 transition-transform duration-200"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 text-[13.5px] text-gray-500 leading-relaxed">{faq.a}</p>
              </details>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
