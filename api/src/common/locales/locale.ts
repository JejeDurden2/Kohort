import { enUS } from './emails/en-US'
import { frFR } from './emails/fr-FR'

export function translation(
  locale: string,
  node: string,
  subNode?: string
): Record<string, object> {
  try {
    let data
    if (locale === 'fr_FR') {
      data = frFR.common[node]
    } else {
      data = enUS.common[node]
    }

    if (subNode && data) {
      return data[subNode]
    }

    return data
  } catch (error) {
    console.error(`Error loading static data for locale ${locale}:`, error)
    return frFR.common[node]
  }
}
