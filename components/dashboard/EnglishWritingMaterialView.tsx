import { cn } from '@/lib/utils'
import type {
  EnglishModelAnswer,
  EnglishWritingCallout,
  EnglishWritingMaterial,
  EnglishWritingSection,
} from '@/data/englishWritingMaterials'

const ENGLISH_ACCENT_TEXT = '#991B1B'
const ENGLISH_ACCENT_BORDER = '#F7CBD0'
const ENGLISH_ACCENT_BG = '#FFF5F6'

const calloutStyles: Record<EnglishWritingCallout['tone'], { box: string; title: string }> = {
  info: { box: 'border-primary/20 bg-primary-light', title: 'text-primary-dark' },
  warning: { box: 'border-amber/20 bg-amber-light', title: 'text-amber' },
  success: { box: 'border-success/20 bg-success-light', title: 'text-success' },
}

function CalloutView({ callout }: { callout: EnglishWritingCallout }) {
  const styles = calloutStyles[callout.tone]
  return (
    <div className={cn('mt-4 rounded-xl border p-4', styles.box)}>
      {callout.title && <p className={cn('mb-1 text-xs font-bold uppercase', styles.title)}>{callout.title}</p>}
      <p className="text-sm leading-7 text-text">{callout.text}</p>
    </div>
  )
}

function ModelAnswerView({ answer, sectionKey }: { answer: EnglishModelAnswer; sectionKey: string }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: ENGLISH_ACCENT_BORDER, backgroundColor: ENGLISH_ACCENT_BG }}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="badge" style={{ backgroundColor: '#FBD9DD', color: ENGLISH_ACCENT_TEXT }}>
            {answer.taskLabel}
          </span>
          <span className="badge bg-gray-100 text-text-muted">{answer.wordCount} words</span>
        </div>
        <div className="space-y-1 text-sm leading-6 text-text">
          {answer.prompt.map((line, index) => (
            <p key={`${sectionKey}-prompt-${index}`} className={cn(line.startsWith('•') && 'pl-4')}>
              {line}
            </p>
          ))}
          {answer.signature && <p className="font-semibold">{answer.signature}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 md:p-5">
        {answer.salutation && <p className="mb-4 text-[15px] leading-7 text-text">{answer.salutation}</p>}
        <div className="space-y-4">
          {answer.paragraphs.map((paragraph, index) => (
            <div key={`${sectionKey}-paragraph-${index}`} className="grid gap-2 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-5">
              <p className="text-[15px] leading-7 text-text">{paragraph.text}</p>
              {paragraph.note && (
                <p
                  className="rounded-lg border-l-2 bg-[#FFF8F8] px-3 py-2 text-xs leading-5 text-text-muted md:self-start"
                  style={{ borderColor: ENGLISH_ACCENT_BORDER }}
                >
                  <span className="font-semibold" style={{ color: ENGLISH_ACCENT_TEXT }}>Note: </span>
                  {paragraph.note}
                </p>
              )}
            </div>
          ))}
        </div>
        {answer.closing && (
          <div className="mt-4 space-y-0.5 text-[15px] leading-7 text-text">
            {answer.closing.map((line, index) => (
              <p key={`${sectionKey}-closing-${index}`}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionView({ section, materialId }: { section: EnglishWritingSection; materialId: string }) {
  const sectionKey = `${materialId}-${section.title}`
  return (
    <section className="border-b border-border/70 pb-6 last:border-b-0 last:pb-0">
      <h4 className="mb-3 text-base font-bold text-text">{section.title}</h4>
      {section.lead && <p className="mb-3 text-sm leading-7 text-text-muted">{section.lead}</p>}
      {section.paragraphs && (
        <div className="space-y-3 text-sm leading-7 text-text">
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${sectionKey}-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      )}
      {section.bullets && (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-text">
          {section.bullets.map((item, index) => (
            <li key={`${sectionKey}-bullet-${index}`}>{item}</li>
          ))}
        </ul>
      )}
      {section.numbered && (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-text">
          {section.numbered.map((item, index) => (
            <li key={`${sectionKey}-numbered-${index}`}>{item}</li>
          ))}
        </ol>
      )}
      {section.table && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-[#FFF5F6] text-xs font-bold uppercase" style={{ color: ENGLISH_ACCENT_TEXT }}>
              <tr>
                {section.table.headers.map((header) => (
                  <th key={`${sectionKey}-header-${header}`} className="px-4 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {section.table.rows.map((row, rowIndex) => (
                <tr key={`${sectionKey}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${sectionKey}-cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top leading-6 text-text">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.phraseGroups && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {section.phraseGroups.map((group, groupIndex) => (
            <div
              key={`${sectionKey}-group-${groupIndex}`}
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: ENGLISH_ACCENT_BORDER }}
            >
              <p className="mb-2 text-xs font-bold uppercase" style={{ color: ENGLISH_ACCENT_TEXT }}>
                {group.label}
              </p>
              <ul className="space-y-1.5 text-sm leading-6 text-text">
                {group.phrases.map((phrase, phraseIndex) => (
                  <li key={`${sectionKey}-phrase-${groupIndex}-${phraseIndex}`} className="flex gap-2">
                    <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: '#DC2626' }} />
                    <span>{phrase}</span>
                  </li>
                ))}
              </ul>
              {group.note && <p className="mt-3 text-xs leading-5 text-text-muted">{group.note}</p>}
            </div>
          ))}
        </div>
      )}
      {section.modelAnswer && <ModelAnswerView answer={section.modelAnswer} sectionKey={sectionKey} />}
      {section.callout && <CalloutView callout={section.callout} />}
    </section>
  )
}

export function EnglishWritingMaterialView({ material }: { material: EnglishWritingMaterial }) {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-white p-5 md:p-6">
      {material.sections.map((section) => (
        <SectionView key={`${material.id}-${section.title}`} section={section} materialId={material.id} />
      ))}
    </div>
  )
}
