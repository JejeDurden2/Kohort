import { Currency, DiscountType, Locale } from '@prisma/client'

import { formatCurrency } from './format-currency'

export function formatDiscount(
  discountValue: number,
  discountType: DiscountType = 'PERCENTAGE',
  locale: Locale,
  currency: Currency
) {
  if (discountType === DiscountType.PERCENTAGE) {
    return `${discountValue}%`
  } else {
    return formatCurrency(discountValue * 100, locale, currency)
  }
}
