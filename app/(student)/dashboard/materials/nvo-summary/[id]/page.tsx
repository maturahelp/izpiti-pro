'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/dashboard/TopBar'
import { nvoLiteratureRichSummaries } from '@/data/nvoLiteratureRichSummaries'

export default function NvoSummaryPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const summary = nvoLiteratureRichSummaries[params.id]

  if (!summary) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <TopBar title="Резюме" />
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          <p className="text-text-muted">Резюмето за това произведение все още не е добавено.</p>
          <Link href="/dashboard/materials" className="mt-4 inline-block text-primary hover:underline">
            ← Назад към материалите
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-bg">
      <TopBar title="Резюме" />

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/dashboard/materials')}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark transition-colors"
        >
          ← Назад към материалите
        </button>

        {/* Header */}
        <div className="rounded-2xl bg-white border border-border p-6 md:p-8 mb-6 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">{summary.author}</p>
          <h1 className="text-2xl md:text-4xl font-bold text-[#1B2845] mb-3 leading-tight">
            „{summary.title}“
          </h1>
          <p className="text-sm text-text-muted">{summary.period}</p>
        </div>

        {/* Context */}
        <Section title="Контекст">
          <h3 className="text-sm font-semibold text-[#335C81] mb-2">За автора</h3>
          <p className="text-text leading-relaxed mb-5">{summary.authorBio}</p>

          <h3 className="text-sm font-semibold text-[#335C81] mb-2">Първа публикация</h3>
          <p className="text-text leading-relaxed mb-5">{summary.firstPublished}</p>

          <h3 className="text-sm font-semibold text-[#335C81] mb-2">Защо е важно</h3>
          <p className="text-text leading-relaxed">{summary.background}</p>

          {summary.funFact && (
            <div className="mt-6 rounded-xl bg-primary-light border border-primary/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Любопитно</p>
              <p className="text-sm text-[#1B2845] leading-relaxed">{summary.funFact}</p>
            </div>
          )}
        </Section>

        {/* Detailed reading */}
        <Section title="Подробен прочит">
          <div className="space-y-5">
            {summary.stanzas.map((stanza, idx) => (
              <div key={idx} className="border-l-4 border-primary/40 pl-4 py-1">
                <h3 className="text-sm font-semibold text-[#1E4D7B] mb-1.5">{stanza.heading}</h3>
                <p className="text-text leading-relaxed">{stanza.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Speaker */}
        <Section title="Лирически говорител">
          <p className="text-text leading-relaxed">{summary.speaker}</p>
        </Section>

        {/* Themes */}
        <Section title="Теми и мотиви">
          <ul className="space-y-2.5">
            {summary.themes.map((theme, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-text leading-relaxed">{theme}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Composition */}
        <Section title="Композиция и стил">
          <p className="text-text leading-relaxed mb-4">{summary.composition}</p>
          <h3 className="text-sm font-semibold text-[#335C81] mb-2">Език</h3>
          <p className="text-text leading-relaxed">{summary.styleAndLanguage}</p>
        </Section>

        {/* Symbols */}
        <Section title="Символи и образи">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-light">
                  <th className="text-left px-3 py-2.5 font-semibold text-[#1E4D7B] rounded-l-lg">Образ</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[#1E4D7B] rounded-r-lg">Значение</th>
                </tr>
              </thead>
              <tbody>
                {summary.symbols.map((s, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 font-semibold text-[#1B2845] align-top">{s.symbol}</td>
                    <td className="px-3 py-3 text-text">{s.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Quotes */}
        <Section title="Ключови цитати">
          <div className="space-y-4">
            {summary.quotes.map((q, idx) => (
              <div key={idx} className="rounded-xl bg-[#F0F6FC] border-l-4 border-primary p-4">
                <p className="italic text-[#1B2845] leading-relaxed mb-2 whitespace-pre-line">„{q.text}“</p>
                <p className="text-sm text-text-muted leading-relaxed">{q.analysis}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Connections */}
        <Section title="Връзки с други текстове">
          <ul className="space-y-2.5">
            {summary.connections.map((c, idx) => (
              <li key={idx} className="flex items-start gap-3 text-text leading-relaxed">
                <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Example topic */}
        <Section title="Примерна изпитна тема">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary-light border border-primary/30 p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Тема</p>
            <p className="text-base font-semibold text-[#1B2845] leading-snug">{summary.exampleTopic.topic}</p>
          </div>
          <h3 className="text-sm font-semibold text-[#335C81] mb-2">Скица на отговора</h3>
          <ol className="space-y-2.5 list-none">
            {summary.exampleTopic.outline.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-text leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/dashboard/literature-exercise/${summary.workId}`}
            className="flex-1 text-center rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-5 transition-colors"
          >
            Към упражнението
          </Link>
          <button
            type="button"
            onClick={() => router.push('/dashboard/materials')}
            className="flex-1 rounded-xl border border-border bg-white text-text font-semibold py-3.5 px-5 hover:bg-primary-light/50 transition-colors"
          >
            Назад към материалите
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-border p-6 md:p-7 mb-5 shadow-sm">
      <h2 className="text-lg md:text-xl font-bold text-[#1E4D7B] mb-4 pb-3 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  )
}
