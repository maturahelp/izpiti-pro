import Link from 'next/link'
import type { ReactNode } from 'react'

export interface RegistrationConsentValues {
  acceptedTermsPrivacy: boolean
  confirmedAge14: boolean
  marketingEmails: boolean
}

interface LegalCheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}

interface RegistrationConsentFieldsProps {
  values: RegistrationConsentValues
  onChange: (key: keyof RegistrationConsentValues, checked: boolean) => void
  idPrefix?: string
}

export function LegalCheckbox({ id, checked, onChange, children }: LegalCheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-text-muted">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[#CBD5E1] text-primary focus:ring-primary/30"
      />
      <span>{children}</span>
    </label>
  )
}

export function RegistrationConsentFields({ values, onChange, idPrefix = 'registration' }: RegistrationConsentFieldsProps) {
  return (
    <div className="space-y-2.5">
      <LegalCheckbox
        id={`${idPrefix}-accepted-terms-privacy`}
        checked={values.acceptedTermsPrivacy}
        onChange={(checked) => onChange('acceptedTermsPrivacy', checked)}
      >
        Приемам{' '}
        <Link href="/terms" className="font-semibold text-primary hover:underline">
          Общите условия
        </Link>{' '}
        и{' '}
        <Link href="/privacy" className="font-semibold text-primary hover:underline">
          Политиката за поверителност
        </Link>
      </LegalCheckbox>

      <LegalCheckbox
        id={`${idPrefix}-confirmed-age-14`}
        checked={values.confirmedAge14}
        onChange={(checked) => onChange('confirmedAge14', checked)}
      >
        Декларирам, че съм навършил/а 14 години
      </LegalCheckbox>

      <LegalCheckbox
        id={`${idPrefix}-marketing-emails`}
        checked={values.marketingEmails}
        onChange={(checked) => onChange('marketingEmails', checked)}
      >
        Съгласен съм да получавам маркетинг имейли
      </LegalCheckbox>
    </div>
  )
}
