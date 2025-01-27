import T from '@locales/locale'

function formatTime(min: number) {
  const hours = Math.floor(min / 60)
  const minutes = min % 60
  return { minutes, hours }
}

export default function Delay({ min }: { min: number }) {
  const { minutes, hours } = formatTime(min)
  let timeString = ''

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    timeString = `${days}${T('common.time.day')}`
    if (remainingHours > 0) {
      timeString += `${remainingHours}h`
    }
  } else if (hours > 0 && minutes > 0) {
    timeString = `${hours}h${minutes}`
  } else {
    if (hours > 0) {
      timeString += `${hours}${T('common.time.hour')}`
    }
    if (minutes > 0 || (hours === 0 && minutes === 0)) {
      timeString += `${minutes}${T('common.time.minute')}`
    }
  }

  return timeString
}
