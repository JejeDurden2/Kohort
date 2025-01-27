import { ClockIcon } from '@heroicons/react/24/outline'

import { PaymentGroupJoinedType } from '@alltypes/PaymentGroup'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'
import { getPaymentGroupSettings } from '@utils/settings'
import { encodeStringOrNumber } from '@utils/validate-encode'

import useApi from '@api/useApi'

import Countdown from '@ui/Elements/Countdown'
import Delay from '@ui/Elements/Delay'
import Loading from '@ui/Elements/Loading'
import Price from '@ui/Elements/Price'
import CashbackIcon from '@ui/icons/cashback-icon'
import UserGroupIcon from '@ui/icons/user-group'

export default function SettingsSection({
  mode,
  organizationId,
  amountTotalWithCents,
  paymentGroup,
  highlightColor,
}: {
  mode: boolean
  organizationId: string
  amountTotalWithCents: number
  paymentGroup: PaymentGroupJoinedType
  highlightColor: string
}) {
  const { data, isLoading } = useApi(
    '/i/organization/' +
      encodeStringOrNumber(organizationId) +
      '?expand[]=payment_group_settings.discount_levels'
  )

  if (isLoading) {
    return <Loading />
  }

  const payment_group_settings = getPaymentGroupSettings(mode, data)
  const maximumDiscountValue =
    payment_group_settings.discount_levels[
      payment_group_settings.discount_levels.length - 1
    ].value
  const lightenColor = lightenHexColor(highlightColor || '', 85)
  const settings = paymentGroup.id
    ? [
        {
          title: 'checkout.payment_group.joined.unlocked_cashback',
          icon: (
            <CashbackIcon
              className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
              fill={'#' + highlightColor}
            />
          ),
          content: (
            <Price
              price={
                paymentGroup.discount_type == 'AMOUNT'
                  ? paymentGroup.current_discount_level.value
                  : ((amountTotalWithCents / 100) *
                      paymentGroup.current_discount_level.value) /
                    100
              }
            />
          ),
        },
        {
          title: 'checkout.payment_group.joined.participants',
          icon: (
            <UserGroupIcon
              className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
              fill={'#' + highlightColor}
            />
          ),
          content: paymentGroup.payment_intents.length,
        },
      ]
    : [
        {
          title: 'checkout.payment_group.new.cashback.title',
          icon: (
            <CashbackIcon
              className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
              fill={'#' + highlightColor}
            />
          ),
          content: (
            <Price
              price={
                payment_group_settings.discount_type == 'AMOUNT'
                  ? maximumDiscountValue
                  : ((amountTotalWithCents / 100) * maximumDiscountValue) / 100
              }
            />
          ),
        },
        {
          title: 'checkout.payment_group.new.deadline.title',
          icon: (
            <ClockIcon
              className="h-6 w-6 -translate-y-1/4 translate-x-1/4"
              style={{ color: '#' + highlightColor }}
            />
          ),
          content: <Delay min={payment_group_settings.minutes_duration} />,
        },
      ]

  return (
    <>
      {paymentGroup.id && (
        <Countdown
          expiresAt={new Date(paymentGroup.expires_at)}
          isSmallVersion={true}
        />
      )}
      <div className="mb-8 flex items-center justify-center p-1.5">
        <div className="flex gap-3 pr-10">
          <div
            className="h-9 w-9 rounded-full bg-primary bg-opacity-10 p-1.5"
            style={{
              backgroundColor: '#' + lightenColor,
            }}
          >
            {settings[0].icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-grey">
              {T(settings[0].title)}
            </p>
            <p className="text-lg font-medium">{settings[0].content}</p>
          </div>
        </div>
        <div className="h-6 w-0.5 bg-grey-light"></div>
        <div className="flex gap-3 pl-10">
          <div
            className="h-9 w-9 rounded-full bg-primary bg-opacity-10 p-1.5"
            style={{
              backgroundColor: '#' + lightenColor,
            }}
          >
            {settings[1].icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-grey">
              {T(settings[1].title)}
            </p>
            <p className="text-lg font-medium">{settings[1].content}</p>
          </div>
        </div>
      </div>
    </>
  )
}
