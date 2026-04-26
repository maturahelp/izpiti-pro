import type { Metadata } from 'next'
import { LegalBulletList, LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'
import { LEGAL_SUPPORT_EMAIL } from '@/lib/legal-consent'

export const metadata: Metadata = {
  title: 'Политика за поверителност',
  description: 'Политика за поверителност на MaturaHelp — как събираме, използваме и защитаваме личните ви данни.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Политика за поверителност">
      <LegalSection title="1. Какви данни събираме">
        <p>При използване на MaturaHelp можем да събираме:</p>
        <p className="font-semibold text-text">Данни при регистрация:</p>
        <LegalBulletList items={['име и фамилия', 'имейл', 'година на раждане', 'клас', 'училище']} />
        <p className="font-semibold text-text">Данни при използване:</p>
        <LegalBulletList items={['резултати от тестове', 'прогрес', 'история на гледане', 'активност в платформата']} />
        <p className="font-semibold text-text">Технически данни:</p>
        <LegalBulletList items={['IP адрес', 'устройство', 'браузър', 'cookies']} />
      </LegalSection>

      <LegalSection title="2. Защо събираме тези данни">
        <LegalBulletList
          items={[
            'създаване и поддръжка на профил',
            'предоставяне на услугата',
            'персонализиране на обучението',
            'анализ и подобрение на платформата',
            'защита от злоупотреби',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Правно основание">
        <LegalBulletList
          items={[
            'изпълнение на договор (ползване на платформата)',
            'съгласие (маркетинг, бисквитки)',
            'легитимен интерес (сигурност, анализ)',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Срок на съхранение">
        <LegalBulletList
          items={[
            'акаунт: докато е активен + до 1 година',
            'прогрес и резултати: до 1 година',
            'support комуникация: до 3 години',
            'счетоводни данни: според закона',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. На кого споделяме данни">
        <p>Данните могат да се обработват от:</p>
        <LegalBulletList
          items={[
            'Stripe - плащания',
            'Supabase - база данни',
            'Meta Platforms - маркетинг',
            'TikTok - маркетинг',
            'имейл доставчик (Resend / Sendgrid / др.)',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Права на потребителя">
        <p>Всеки потребител има право на:</p>
        <LegalBulletList items={['достъп до данните', 'корекция', 'изтриване', 'ограничаване', 'възражение', 'преносимост']} />
        <p>
          Заявки:{' '}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="font-semibold text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="7. Непълнолетни">
        <p>Платформата е предназначена за лица над 14 години. Регистрация под тази възраст не е позволена.</p>
      </LegalSection>

      <LegalSection title="8. Сигурност">
        <LegalBulletList
          items={[
            'защита на достъпа',
            'криптиране',
            '2FA за администратори',
            'логове за действия',
          ]}
        />
      </LegalSection>
    </LegalPageShell>
  )
}
