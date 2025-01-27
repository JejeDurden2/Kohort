export function computeExpiresAt(
  expiresAt: Date | undefined,
  minutesDuration: number | null
) {
  if (expiresAt) {
    return expiresAt
  }
  if (!minutesDuration) {
    return undefined
  }
  const now = new Date()
  return new Date(now.getTime() + minutesDuration * 60000)
}

export function computeMidExpiresAt(
  expiresAt: Date | undefined,
  minutesDuration: number | null
): Date | undefined {
  // Use the existing computeExpiresAt function to get the expiresAt date
  const calculatedExpiresAt = computeExpiresAt(expiresAt, minutesDuration)

  // If expiresAt is undefined or minutesDuration is null, return undefined
  if (!calculatedExpiresAt) {
    return undefined
  }

  const now = new Date()
  const midTime = new Date(
    now.getTime() + (calculatedExpiresAt.getTime() - now.getTime()) / 2
  )

  return midTime
}

export function computeAdjustedDate(
  baseDate: Date | undefined,
  offsetDays: number,
  hours?: number,
  minutes?: number
): Date | undefined {
  if (!baseDate) {
    return undefined
  }
  const adjustedDate = new Date(baseDate)
  adjustedDate.setDate(adjustedDate.getDate() + offsetDays)

  // Set time only if hours and minutes are provided
  if (hours !== undefined && minutes !== undefined) {
    adjustedDate.setHours(hours, minutes, 0, 0)
  }

  return adjustedDate
}
