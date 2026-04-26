import type { Metadata } from 'next'
import { LegalBulletList, LegalPageShell, LegalSection } from '@/components/marketing/LegalPageShell'
import { LEGAL_SUPPORT_EMAIL } from '@/lib/legal-consent'

export const metadata: Metadata = {
  title: 'Общи условия',
  description: 'Общи условия за използване на платформата MaturaHelp.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Общи условия">
      <LegalSection title="1. Обхват">
        <p>
          Тези условия уреждат използването на MaturaHelp - онлайн платформа за подготовка за НВО и ДЗИ с тестове,
          материали, уроци, прогрес и помощни функции.
        </p>
      </LegalSection>

      <LegalSection title="2. Регистрация и акаунт">
        <LegalBulletList
          items={[
            'Регистрацията е разрешена само за лица, навършили 14 години.',
            'Потребителят носи отговорност за вярността на данните, които предоставя.',
            'Потребителят трябва да пази достъпа до акаунта си и да не го предоставя на други лица.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Абонамент и автоматично подновяване">
        <p>
          Премиум плановете са абонаментни продукти и могат да се подновяват автоматично според избрания период. Преди
          плащане се показват сумата, периодът и датата на следващото плащане.
        </p>
      </LegalSection>

      <LegalSection title="4. Прекратяване">
        <p>
          Потребителят може да прекрати подновяването по всяко време от профила си. Достъпът до платените функции остава
          активен до края на текущия платен период.
        </p>
      </LegalSection>

      <LegalSection title="5. Незабавен дигитален достъп и право на отказ">
        <p>
          При заявяване на незабавен достъп до дигиталната услуга потребителят потвърждава, че разбира, че това може да
          повлияе на правото му на отказ съгласно приложимите правила за цифрово съдържание и услуги.
        </p>
      </LegalSection>

      <LegalSection title="6. Допустимо използване">
        <LegalBulletList
          items={[
            'Платформата се използва само за лична учебна подготовка.',
            'Не е позволено заобикаляне на ограничения, злоупотреба с акаунти или автоматизирано извличане на съдържание.',
            'MaturaHelp може да ограничи достъп при злоупотреба, измама или нарушение на тези условия.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Контакт">
        <p>
          За въпроси относно акаунт, плащане, абонамент или отказ ни пиши на{' '}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="font-semibold text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
