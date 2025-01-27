import { OMITTED_FIELDS } from '../constants/miscellaneous.constants'
import { Sanitized } from '../types/sanitized.type'

// The omitFields function takes an object of type T and an array of keys from OMITTED_FIELDS
// It returns a new object with those keys omitted
export function omitFields<T extends Record<string, unknown>>(
  obj: T
): Sanitized<T> {
  const result = { ...obj }

  ;(OMITTED_FIELDS as ReadonlyArray<string>).forEach((key) => {
    delete result[key as keyof T]
  })
  return result as Sanitized<T>
}

export function sanitizeEmail(email: string): string {
  return email.replace(/\+.+?(?=@)/, '')
}
