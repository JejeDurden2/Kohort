// @READ : https://github.com/vercel/next.js/blob/canary/examples/app-dir-i18n-routing/get-dictionary.ts
import 'server-only'

import type { Locale } from './i18n-config'

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries: any = {
  fr: () => import('./fr.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale as keyof any]()
