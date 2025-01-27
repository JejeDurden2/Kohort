import { UserGroupIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline'

import { PaymentGroupDiscountLevels } from '@alltypes/PaymentGroup'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'

import Price from '@ui/Elements/Price'
import CashbackIcon from '@ui/icons/cashback-icon'

export default function GroupDiscountLevelsSection({
  amountTotalWithCents,
  discountType,
  discountLevels,
  numberOfParticipants,
  highlightColor,
}: {
  amountTotalWithCents: number
  discountType: 'AMOUNT' | 'PERCENTAGE'
  discountLevels: PaymentGroupDiscountLevels
  numberOfParticipants: number
  highlightColor: string
}) {
  const isCurrentLevel = (level: number) => {
    let currentLevelUnlocked = null

    for (let i = 0; i < discountLevels.length; i++) {
      if (numberOfParticipants >= discountLevels[i].participants_to_unlock) {
        currentLevelUnlocked = i
      }
    }

    return level == currentLevelUnlocked
  }

  const getParticipants = (level: number) => {
    return discountLevels[level].participants_to_unlock - 1
  }

  const getCashbackValue = (level: number) => {
    if (discountType == 'AMOUNT') {
      return discountLevels[level].value
    }

    return ((amountTotalWithCents / 100) * discountLevels[level].value) / 100
  }

  const lightenColor = lightenHexColor(highlightColor, 85)
  return (
    <div className="mx-auto max-w-sm px-6">
      <h3 className="font-medium uppercase">
        {T('checkout.success_page.group_discount_levels.title')}
      </h3>
      <p className="text-sm">
        {T('checkout.success_page.group_discount_levels.description')}
      </p>
      <div className="my-2.5 rounded-md border border-grey-light bg-grey-lighter bg-opacity-40 p-4">
        <ul className="space-y-2 font-medium text-grey">
          <li className="flex items-center justify-center gap-2">
            <div
              className={
                'flex min-w-16 items-center justify-center gap-1.5 rounded-md px-2 py-1 font-normal ' +
                (isCurrentLevel(0)
                  ? 'bg-black text-white'
                  : 'bg-grey-light bg-opacity-60 ')
              }
            >
              {isCurrentLevel(0) && (
                <span className="text-xs uppercase">
                  {T('checkout.success_page.group_discount_levels.currently')}
                </span>
              )}
              <UserIcon className="h-5 w-5" />
              <span>{getParticipants(0)}</span>
            </div>
            <div className="text-sm">=</div>
            <div
              className="rounded-full bg-primary bg-opacity-10 p-0.5"
              style={{
                backgroundColor: '#' + lightenColor,
              }}
            >
              <CashbackIcon
                className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
                fill={
                  highlightColor?.length > 0 ? '#' + highlightColor : '#C62344'
                }
              />
            </div>
            <div className="min-w-20 text-lg text-black">
              <Price price={getCashbackValue(0)} />
            </div>
          </li>
          <li className="flex items-center justify-center gap-2">
            <div
              className={
                'flex min-w-16 items-center justify-center gap-1.5 rounded-md px-2 py-1 font-normal ' +
                (isCurrentLevel(1)
                  ? 'bg-black text-white'
                  : 'bg-grey-light bg-opacity-60')
              }
            >
              {isCurrentLevel(1) && (
                <span className="text-xs uppercase">
                  {T('checkout.success_page.group_discount_levels.currently')}
                </span>
              )}
              <UsersIcon className="h-5 w-5" />
              <span>{getParticipants(1)}</span>
            </div>
            <div className="text-sm">=</div>
            <div
              className="rounded-full bg-primary bg-opacity-10 p-0.5"
              style={{
                backgroundColor: '#' + lightenColor,
              }}
            >
              <CashbackIcon
                className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
                fill={
                  highlightColor?.length > 0 ? '#' + highlightColor : '#C62344'
                }
              />
            </div>
            <div className="min-w-20 text-lg text-black">
              <Price price={getCashbackValue(1)} />
            </div>
          </li>
          <li className="flex items-center justify-center gap-2">
            <div
              className={
                'flex min-w-16 items-center justify-center gap-1.5 rounded-md px-2 py-1 font-normal ' +
                (isCurrentLevel(2)
                  ? 'bg-black text-white'
                  : 'bg-grey-light bg-opacity-60')
              }
            >
              {isCurrentLevel(2) && (
                <span className="text-xs uppercase">
                  {T('checkout.success_page.group_discount_levels.currently')}
                </span>
              )}
              <UserGroupIcon className="h-5 w-5" />
              <span>{getParticipants(2) + '+'}</span>
            </div>
            <div className="text-sm">=</div>
            <div
              className="rounded-full bg-primary bg-opacity-10 p-0.5"
              style={{
                backgroundColor: '#' + lightenColor,
              }}
            >
              <CashbackIcon
                className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
                fill={
                  highlightColor?.length > 0 ? '#' + highlightColor : '#C62344'
                }
              />
            </div>
            <div className="min-w-20 text-lg text-black">
              <Price price={getCashbackValue(2)} />
            </div>
          </li>
        </ul>
      </div>
      <div className="text-xs text-grey">
        <p>{T('checkout.success_page.group_discount_levels.info1')}</p>
        <p>{T('checkout.success_page.group_discount_levels.info2')}</p>
      </div>
    </div>
  )
}
