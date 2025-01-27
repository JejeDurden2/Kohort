import { Locale } from '@prisma/client'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { enUS, fr } from 'date-fns/locale'

import { replaceUnderscoreWithHyphen } from './replace-undescore-with-hyphen'

export function formatDateTo2Digits(date: Date, locale: Locale) {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
  }
  return new Intl.DateTimeFormat(
    replaceUnderscoreWithHyphen(locale),
    options
  ).format(date)
}

export function formatDateTime(date: Date, locale: Locale) {
  const timeZone = 'Europe/Paris'

  const dateInFrenchTime = formatInTimeZone(
    date,
    timeZone,
    "yyyy-MM-dd'T'HH:mm:ssXXX"
  )

  // Format the date to the desired format
  const formattedDateTime = format(
    new Date(dateInFrenchTime),
    "dd MMMM, HH'h'mm",
    { locale: locale == Locale.fr_FR ? fr : enUS }
  )
  return formattedDateTime
}
