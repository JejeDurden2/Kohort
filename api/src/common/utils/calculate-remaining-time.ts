import { Locale } from '@prisma/client'

import { translation } from '../locales/locale'

export default function calculateRemainingTime(
  expiresAt: Date,
  locale: string = Locale.fr_FR
) {
  const now = new Date()
  const expiresTime = new Date(expiresAt).getTime()
  const nowTime = now.getTime()

  // Calculate the difference in milliseconds
  const timeDiff = expiresTime - nowTime

  // Convert milliseconds into days, hours, and minutes
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  // Build the formatted time string
  let formattedTime = ''
  if (days > 0) {
    formattedTime =
      `${days} ${translation(locale, 'day').toString()}` + (days > 1 ? 's' : '')
  } else if (hours > 0) {
    formattedTime =
      `${hours} ${translation(locale, 'hour').toString()}` +
      (hours > 1 ? 's' : '')
  } else if (hours <= 0 && days <= 0) {
    formattedTime += `${minutes} ${translation(locale, 'minute').toString()}s`
  } else {
    formattedTime = `${hours}h${minutes}`
  }

  return formattedTime
}
