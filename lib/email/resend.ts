import { Resend } from 'resend'

let _client: Resend | null = null

function getResendClient(): Resend {
  if (_client) return _client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Missing RESEND_API_KEY env var')
  _client = new Resend(apiKey)
  return _client
}

export async function sendPasswordResetEmail({
  to,
  actionLink,
}: {
  to: string
  actionLink: string
}): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? 'MaturaHelp <support@maturahelp.com>'

  const html = `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:16px;border:1px solid #E2E8F0;padding:40px 36px">
        <tr><td style="padding-bottom:28px;text-align:center">
          <span style="font-size:20px;font-weight:700;color:#0F172A;letter-spacing:-0.02em">MaturaHelp</span>
        </td></tr>
        <tr><td style="font-size:15px;font-weight:600;color:#0F172A;padding-bottom:12px">Здравей,</td></tr>
        <tr><td style="font-size:14px;color:#475569;line-height:1.6;padding-bottom:28px">
          Получихме заявка за смяна на паролата на твоя акаунт в MaturaHelp. Кликни бутона по-долу, за да въведеш нова парола.
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:28px">
          <a href="${actionLink}" style="display:inline-block;background:#1B4FD8;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:-0.01em">Смени парола</a>
        </td></tr>
        <tr><td style="font-size:13px;color:#64748B;line-height:1.6;padding-bottom:8px">
          Ако бутонът не работи, копирай този линк в браузъра си:
        </td></tr>
        <tr><td style="padding-bottom:24px">
          <a href="${actionLink}" style="font-size:12px;color:#1B4FD8;word-break:break-all">${actionLink}</a>
        </td></tr>
        <tr><td style="font-size:13px;color:#94A3B8;padding-bottom:8px">Този линк е валиден 1 час.</td></tr>
        <tr><td style="font-size:13px;color:#94A3B8;padding-bottom:28px">Ако не си заявил/а смяна на парола, можеш спокойно да игнорираш този имейл.</td></tr>
        <tr><td style="font-size:13px;color:#64748B">С уважение,<br>Екипът на MaturaHelp</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = `Здравей,

Получихме заявка за смяна на паролата на твоя акаунт в MaturaHelp.

Кликни линка по-долу, за да въведеш нова парола:
${actionLink}

Този линк е валиден 1 час.

Ако не си заявил/а смяна на парола, можеш спокойно да игнорираш този имейл.

С уважение,
Екипът на MaturaHelp`

  const resend = getResendClient()
  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Смяна на парола за MaturaHelp',
    html,
    text,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
}
