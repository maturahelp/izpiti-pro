import type { PlanKey } from '@/lib/billing/plans'
import type { EmailAutomationTemplateKey } from '@/lib/email-automation/jobs'
import { NVO7_BEL_EXAM_DATE_LABEL, NVO7_MAT_EXAM_DATE_LABEL } from '@/lib/campaigns/nvo7-exam-dates'

type EmailTemplateRenderContext = {
  templateKey: EmailAutomationTemplateKey
  recipientEmail: string
  recipientName?: string | null
  planKey?: PlanKey | null
  planName?: string | null
  accessEndsAt?: string | null
}

type RenderedEmailTemplate = {
  subject: string
  html: string
  text: string
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.maturahelp.com'
const SUPPORT_EMAIL = 'support@maturahelp.com'
const PRICING_HREF = 'https://www.maturahelp.com/#pricing'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatDateBg(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Sofia',
  }).format(date)
}

function greeting(name: string | null | undefined) {
  const trimmed = name?.trim()
  return trimmed ? `Здравей, ${trimmed}` : 'Здравей'
}

function renderLayout(input: {
  eyebrow?: string
  title: string
  intro: string
  bullets?: string[]
  ctaLabel?: string
  ctaHref?: string
  outro?: string
}) {
  const bulletsHtml = (input.bullets ?? [])
    .map((item) => `<li style="margin:0 0 10px 0;">${escapeHtml(item)}</li>`)
    .join('')

  const ctaHtml =
    input.ctaLabel && input.ctaHref
      ? `<p style="margin:28px 0 0 0;"><a href="${escapeHtml(
          input.ctaHref
        )}" style="display:inline-block;background:#fbbf24;color:#172554;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px;">${escapeHtml(
          input.ctaLabel
        )}</a></p>`
      : ''

  const html = `
    <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,sans-serif;color:#334155;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
        ${
          input.eyebrow
            ? `<div style="display:inline-block;background:#fbbf24;color:#172554;font-weight:700;border-radius:999px;padding:8px 16px;margin-bottom:18px;">${escapeHtml(
                input.eyebrow
              )}</div>`
            : ''
        }
        <h1 style="margin:0 0 16px 0;font-size:30px;line-height:1.15;color:#1e3a8a;">${escapeHtml(
          input.title
        )}</h1>
        <p style="margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#475569;">${escapeHtml(
          input.intro
        )}</p>
        ${
          bulletsHtml
            ? `<ul style="margin:0;padding-left:22px;font-size:16px;line-height:1.65;color:#475569;">${bulletsHtml}</ul>`
            : ''
        }
        ${ctaHtml}
        ${
          input.outro
            ? `<p style="margin:28px 0 0 0;font-size:15px;line-height:1.65;color:#64748b;">${escapeHtml(
                input.outro
              )}</p>`
            : ''
        }
      </div>
    </div>
  `.trim()

  const text = [
    input.eyebrow,
    input.title,
    '',
    input.intro,
    ...(input.bullets ?? []).map((item) => `- ${item}`),
    '',
    input.ctaLabel && input.ctaHref ? `${input.ctaLabel}: ${input.ctaHref}` : '',
    '',
    input.outro ?? '',
  ]
    .filter(Boolean)
    .join('\n')

  return { html, text }
}

export function renderEmailAutomationTemplate(
  context: EmailTemplateRenderContext
): RenderedEmailTemplate {
  const recipientGreeting = greeting(context.recipientName)
  const dashboardHref = new URL('/dashboard/materials', BASE_URL).toString()
  const supportHref = `mailto:${SUPPORT_EMAIL}`
  const accessEndsAt = formatDateBg(context.accessEndsAt)

  switch (context.templateKey) {
    case 'purchase_welcome': {
      const intro = accessEndsAt
        ? `${recipientGreeting}, достъпът ти до MaturaHelp вече е активен. Планът ти${context.planName ? ` (${context.planName})` : ''} е включен до ${accessEndsAt}.`
        : `${recipientGreeting}, достъпът ти до MaturaHelp вече е активен${context.planName ? ` по плана ${context.planName}` : ''}.`

      const content = renderLayout({
        eyebrow: 'Достъпът ти е активен',
        title: 'Влез и започни още сега',
        intro,
        bullets: [
          'Отвори материалите и мини през най-важното за изпита.',
          'Решавай практически тестове и ДЗИ-та от минали години.',
          'Ползвай AI помощника, когато се чудиш откъде да започнеш.',
          'Прегледай секциите за есе и интерпретативно съчинение.',
        ],
        ctaLabel: 'Влез в платформата',
        ctaHref: dashboardHref,
        outro: 'Ако имаш въпрос или нещо те затруднява, просто отговори на този имейл.',
      })

      return {
        subject: 'Достъпът ти до MaturaHelp е активен',
        ...content,
      }
    }

    case 'purchase_feedback': {
      const content = renderLayout({
        eyebrow: 'Бърз follow-up',
        title: 'Как върви подготовката ти дотук?',
        intro: `${recipientGreeting}, искаме да те питаме какви са първите ти впечатления от MaturaHelp. Ако нещо те затруднява или искаш конкретна насока, просто ни отговори с едно-две изречения.`,
        bullets: [
          'Кое ти е най-полезно дотук?',
          'Къде усещаш, че още имаш нужда от помощ?',
          'Има ли нещо, което не намираш достатъчно ясно?',
        ],
        ctaLabel: 'Пиши ни',
        ctaHref: supportHref,
        outro: 'Четем всички отговори и ги използваме, за да подобряваме платформата в реално време.',
      })

      return {
        subject: 'Как ти се струва MaturaHelp дотук?',
        ...content,
      }
    }

    case 'grade12_no_purchase_nudge': {
      const content = renderLayout({
        eyebrow: '12. клас',
        title: 'Регистрира се, но още не си активирал достъп',
        intro: `${recipientGreeting}, видяхме, че вече си в MaturaHelp, но още нямаш активен план. Ако искаш да започнеш по-структурирано, вътре те чакат най-важните неща за ДЗИ по БЕЛ.`,
        bullets: [
          'Обобщения на произведенията и ключовите теми.',
          'Практически тестове и ДЗИ-та с разбор.',
          'Секции за есе и интерпретативно съчинение.',
          'AI помощник за бързи въпроси и обяснения.',
        ],
        ctaLabel: 'Виж плановете',
        ctaHref: PRICING_HREF,
        outro: 'Ако се чудиш кой план е най-подходящ за теб, просто отговори на този имейл.',
      })

      return {
        subject: 'Още не си активирал достъп до MaturaHelp',
        ...content,
      }
    }

    case 'nvo7_urgency_nudge': {
      const nvo7PricingHref = `https://www.maturahelp.com/api/checkout/redirect?plan=nvo-sprint&promoCode=NVO15`
      const discountCode = 'NVO15'
      const content = renderLayout({
        eyebrow: 'НВО — 7. клас',
        title: 'НВО е след дни. Ето 15% отстъпка за теб.',
        intro: `${recipientGreeting}, регистрира се в MaturaHelp, но все още нямаш активен план. НВО по БЕЛ е на ${NVO7_BEL_EXAM_DATE_LABEL}, по математика — на ${NVO7_MAT_EXAM_DATE_LABEL}. Имаш още няколко дни — и специален код само за теб.`,
        bullets: [
          'Резюмета и анализи на всички произведения за НВО.',
          'Видео уроци по всички теми.',
          'Тестове и примерни НВО-та от минали години.',
          'AI помощник за бързи въпроси и обяснения.',
          `Използвай код ${discountCode} при плащане — 15% отстъпка.`,
        ],
        ctaLabel: `Вземи достъп с код ${discountCode} →`,
        ctaHref: nvo7PricingHref,
        outro: `Кодът ${discountCode} е валиден само за следващите няколко дни. Ако имаш въпрос, просто отговори на този имейл.`,
      })

      return {
        subject: `Специален код за теб: ${discountCode} — 15% отстъпка за НВО`,
        ...content,
      }
    }
  }
}
