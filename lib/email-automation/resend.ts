type SendResendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL ?? process.env.RESEND_FROM_EMAIL

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY')
  }

  if (!from) {
    throw new Error('Missing RESEND_FROM_EMAIL')
  }

  return { apiKey, from, replyTo }
}

export async function sendResendEmail(input: SendResendEmailInput) {
  const { apiKey, from, replyTo } = getResendConfig()

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: replyTo ? [replyTo] : undefined,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  })

  const raw = await response.text()
  let parsed: unknown = null

  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = raw
  }

  if (!response.ok) {
    throw new Error(
      `Resend send failed (${response.status}): ${
        typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
      }`
    )
  }

  const id =
    typeof parsed === 'object' &&
    parsed &&
    'id' in parsed &&
    typeof (parsed as { id?: unknown }).id === 'string'
      ? (parsed as { id: string }).id
      : null

  return { id }
}
