import { colord } from 'colord'

export function getBrightness(hexColor: string): number {
  return colord(hexColor).brightness()
}

export function isDarkColor(
  hexColor: string,
  threshold: number = 0.5
): boolean {
  const brightness = getBrightness(hexColor)
  return brightness < threshold
}
