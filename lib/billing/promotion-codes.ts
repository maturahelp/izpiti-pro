import Stripe from 'stripe'
import { MATURA_FINAL_DISCOUNT_CODE } from '@/lib/campaigns/matura-final-survey'

const SUPPORTED_PROMO_CODES = new Set([MATURA_FINAL_DISCOUNT_CODE])
export const PROMO_CODE_UNAVAILABLE_ERROR = 'PROMO_CODE_UNAVAILABLE'

export function normalizePromoCode(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase()
  return normalized ? normalized : null
}

export async function resolveCheckoutDiscounts(
  stripe: Stripe,
  promoCode: string | null | undefined
) {
  const normalizedPromoCode = normalizePromoCode(promoCode)
  if (!normalizedPromoCode || !SUPPORTED_PROMO_CODES.has(normalizedPromoCode)) {
    return undefined
  }

  const promotionCodes = await stripe.promotionCodes.list({
    code: normalizedPromoCode,
    active: true,
    limit: 1,
  })

  const promotionCodeId = promotionCodes.data[0]?.id ?? null
  if (!promotionCodeId) {
    throw new Error(PROMO_CODE_UNAVAILABLE_ERROR)
  }

  return [{ promotion_code: promotionCodeId }]
}
