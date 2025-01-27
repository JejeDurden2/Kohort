export function getTimeRemaining(endtime: Date) {
  const total =
    Date.parse(endtime.toString()) - Date.parse(new Date().toUTCString())
  const seconds = Math.floor((total / 1000) % 60)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((total / 1000 / 60) % 60)
    .toString()
    .padStart(2, '0')
  const hours = Math.floor(total / (1000 * 60 * 60))
    .toString()
    .padStart(2, '0')

  if (seconds < '0' && minutes < '0' && hours < '0') {
    return {
      total: 0,
      hours: '00',
      minutes: '00',
      seconds: '00',
    }
  }

  return {
    total,
    hours,
    minutes,
    seconds,
  }
}
