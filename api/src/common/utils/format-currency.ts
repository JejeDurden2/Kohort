import { Currency, Locale } from '@prisma/client'

import { replaceUnderscoreWithHyphen } from './replace-undescore-with-hyphen'

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: Currency
) {
  return new Intl.NumberFormat(replaceUnderscoreWithHyphen(locale), {
    style: 'currency',
    currency: currency,
  }).format(amount / 100)
}

export function formatCurrencyForEmails(
  amount: number,
  locale: Locale,
  currency: Currency
) {
  const formatter = new Intl.NumberFormat(replaceUnderscoreWithHyphen(locale), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount / 100)

  const withoutGroupingSeparator = formatter.replace(/\s/g, '')

  return withoutGroupingSeparator
}
