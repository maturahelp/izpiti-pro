import { LegalBulletList, LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'

export default function CookiesPage() {
  return (
    <LegalPageShell title="Политика за бисквитки">
      <LegalSection title="1. Какво са бисквитки">
        <p>Бисквитките са малки файлове, които се записват в устройството ти при използване на сайта.</p>
      </LegalSection>

      <LegalSection title="2. Какви бисквитки използваме">
        <p className="font-semibold text-text">Задължителни</p>
        <LegalBulletList items={['логин', 'сигурност', 'сесия']} />
        <p className="font-semibold text-text">Аналитични</p>
        <LegalBulletList items={['използване на сайта', 'поведение']} />
        <p className="font-semibold text-text">Маркетингови</p>
        <LegalBulletList items={['реклами', 'ремаркетинг']} />
        <p>Използваме:</p>
        <LegalBulletList items={['Meta Platforms', 'TikTok']} />
      </LegalSection>

      <LegalSection title="3. Съгласие">
        <LegalBulletList
          items={[
            'аналитични и маркетингови бисквитки се активират само след съгласие',
            'можеш да ги промениш по всяко време',
          ]}
        />
      </LegalSection>
    </LegalPageShell>
  )
}
