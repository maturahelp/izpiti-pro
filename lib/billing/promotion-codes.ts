import Stripe from 'stripe'
import { MATURA_FINAL_DISCOUNT_CODE } from '@/lib/campaigns/matura-final-survey'

const SUPPORTED_PROMO_CODES = new Set([MATURA_FINAL_DISCOUNT_CODE])
const DIRECT_PROMOTION_CODE_IDS: Partial<Record<string, string>> = {
  [MATURA_FINAL_DISCOUNT_CODE]: 'promo_1TWBTIAKDTIvoVbGGmqKVx9G',
}
export const PROMO_CODE_UNAVAILABLE_ERROR = 'PROMO_CODE_UNAVAILABLE'

function isMissingStripeResource(error: unknown) {
  return (
    error instanceof Stripe.errors.StripeError &&
    error.type === 'StripeInvalidRequestError' &&
    error.code === 'resource_missing'
  )
}

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

  // Stripe checkout accepts either a coupon id or a promotion code id.
  // We resolve coupon ids first because this campaign may be configured
  // as a coupon or a promotion code in the live Stripe dashboard.
  try {
    const coupon = await stripe.coupons.retrieve(normalizedPromoCode)
    if (!('deleted' in coupon) && coupon.valid) {
      return [{ coupon: coupon.id }]
    }
  } catch (error) {
    if (!isMissingStripeResource(error)) {
      throw error
    }
  }

  const promotionCodes = await stripe.promotionCodes.list({
    code: normalizedPromoCode,
    active: true,
    limit: 1,
  })

  const promotionCodeId = promotionCodes.data[0]?.id ?? null
  if (promotionCodeId) {
    return [{ promotion_code: promotionCodeId }]
  }

  const directPromotionCodeId = DIRECT_PROMOTION_CODE_IDS[normalizedPromoCode]
  if (directPromotionCodeId) {
    return [{ promotion_code: directPromotionCodeId }]
  }

  throw new Error(PROMO_CODE_UNAVAILABLE_ERROR)
}
