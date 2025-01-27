import { useEffect, useState } from 'react'

import T from '@locales/locale'

import { getTimeRemaining } from '@utils/time'

export default function Countdown({
  expiresAt,
  isSmallVersion = false,
}: {
  expiresAt: Date
  isSmallVersion?: boolean
}) {
  const { hours, minutes, seconds } = getTimeRemaining(expiresAt)

  const [remainingHours, setRemainingHours] = useState(hours)
  const [remainingMinutes, setRemainingMinutes] = useState(minutes)
  const [remainingSeconds, setRemainingSeconds] = useState(seconds)

  useEffect(() => {
    const { total } = getTimeRemaining(expiresAt)
    if (total <= 0) return

    const timer = setTimeout(() => {
      const { hours, minutes, seconds } = getTimeRemaining(expiresAt)
      setRemainingHours(hours)
      setRemainingMinutes(minutes)
      setRemainingSeconds(seconds)
    }, 1000)

    return () => clearTimeout(timer)
  }, [remainingHours, remainingMinutes, remainingSeconds])

  return (
    <div className="text-center text-grey">
      <h3 className={isSmallVersion ? 'text-sm' : ''}>
        {T('checkout.payment_group.new.deadline.title')}
      </h3>
      <div
        className={
          'flex items-center justify-center py-2 font-medium ' +
          (isSmallVersion
            ? 'mb-4 gap-1.5 border-b border-grey-medium pb-4 text-3xl'
            : 'gap-3 text-5xl')
        }
      >
        <div>
          <div className="text-black">{remainingHours}</div>
          <div className={isSmallVersion ? 'text-xs' : 'text-sm'}>
            {T('common.time.hours')}
          </div>
        </div>
        <div className="mb-4 font-normal text-opacity-50">:</div>
        <div>
          <div className="text-black">{remainingMinutes}</div>
          <div className={isSmallVersion ? 'text-xs' : 'text-sm'}>
            {T('common.time.minutes')}
          </div>
        </div>
        <div className="mb-4 font-normal text-opacity-50">:</div>
        <div>
          <div className="text-black">{remainingSeconds}</div>
          <div className={isSmallVersion ? 'text-xs' : 'text-sm'}>
            {T('common.time.seconds')}
          </div>
        </div>
      </div>
    </div>
  )
}
