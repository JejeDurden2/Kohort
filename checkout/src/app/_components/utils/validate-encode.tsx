export function encodeStringOrNumber(
  value: string | number | undefined | null
): string {
  if (value == null || value === undefined) {
    return ''
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return encodeURIComponent(value.toString())
  }
  throw new Error('Value must be a string or number')
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}
