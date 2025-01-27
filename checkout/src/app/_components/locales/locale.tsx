import { getCookie } from 'cookies-next'

import { en_US } from './en_US'
import { fr_FR } from './fr_FR'

export default function T(path: string | undefined) {
  if (!path) {
    return ''
  }

  const cookieLocale = getCookie('NEXT_LOCALE')
  const userLocale = cookieLocale && cookieLocale == 'en_US' ? en_US : fr_FR

  const translation: string | null = path
    .split('.')
    .reduce((o, i) => (o ? o[i] : null), userLocale)

  return translation ?? path
}
