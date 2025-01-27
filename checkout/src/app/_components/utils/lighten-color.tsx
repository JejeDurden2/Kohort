export default function lightenHexColor(
  color: string,
  percent: number
): string {
  if (!color) return ''
  if (color.length === 0) return ''
  color = color.replace('#', '')
  // Parse the r, g, b values
  let r = parseInt(color.substring(0, 2), 16)
  let g = parseInt(color.substring(2, 4), 16)
  let b = parseInt(color.substring(4, 6), 16)

  // Increase each value by the percentage
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)))
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)))
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)))

  // Convert back to hex
  const rouge = r.toString(16).padStart(2, '0')
  const green = g.toString(16).padStart(2, '0')
  const blue = b.toString(16).padStart(2, '0')

  return `${rouge}${green}${blue}`
}
