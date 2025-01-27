export default function darkenColor(hex: string, percentage: number) {
  hex = hex.replace('#', '')
  // Convert the hex color to RGB values
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.max(0, r - percentage)
  g = Math.max(0, g - percentage)
  b = Math.max(0, b - percentage)

  const newColor =
    ('0' + r.toString(16)).slice(-2) +
    ('0' + g.toString(16)).slice(-2) +
    ('0' + b.toString(16)).slice(-2)

  return newColor
}
