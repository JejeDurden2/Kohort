import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

import { CheckoutSessionType } from '@alltypes/CheckoutSession'

import T from '@locales/locale'

import { getGroupOwnerFullName } from '@utils/paymentGroup'
import getBrandSettings from '@utils/settings'
import { isValidUrl } from '@utils/validate-encode'

import { requestApi } from '@api/server'
import useApi from '@api/useApi'

import Countdown from '@ui/Elements/Countdown'
import ErrorPage from '@ui/Elements/ErrorPage'
import Link from '@ui/Elements/Link'
import Loading from '@ui/Elements/Loading'
import Price from '@ui/Elements/Price'
import SectionHeading from '@ui/Elements/SectionHeading'

import GroupDiscountLevelsSection from './_success-page/group-discount-levels'
import InviteSection from './_success-page/invite'
import LevelDescriptionSection from './_success-page/level-description'

export default function SuccessPageSection({
  checkoutSession,
}: {
  checkoutSession: CheckoutSessionType
}) {
  const [retry, setRetry] = useState(0)
  const [paymentGroupId, setPaymentGroupId] = useState(
    checkoutSession.payment_intent.payment_group_id
  )

  let successUrl = null
  if (checkoutSession.success_url && isValidUrl(checkoutSession.success_url)) {
    const url = new URL(checkoutSession.success_url)
    url.searchParams.set('payment_id', checkoutSession.payment_intent.id)
    successUrl = url.toString()

    setTimeout(() => {
      window.location.href = url.toString()
    }, 3000)
  }

  const {
    data: paymentGroup,
    isLoading,
    error,
  } = useApi(
    paymentGroupId
      ? '/i/payment-groups/' +
          paymentGroupId +
          '?expand[]=payment_group_settings.discount_levels&expand[]=payment_intents.customer&expand[]=customer'
      : null
  )

  useEffect(() => {
    if (paymentGroup?.id) return

    const timer = setTimeout(() => {
      requestApi(
        'get',
        '/i/checkout-sessions/' +
          checkoutSession.share_id +
          '?expand[]=payment_intent'
      )
        .then((res) => {
          if (res.payment_intent.payment_group_id != null) {
            setPaymentGroupId(res.payment_intent.payment_group_id)
          }
        })
        .catch((err) => {
          console.log('error', err)
        })

      setRetry(retry + 1)
    }, 500)

    return () => clearTimeout(timer)
  }, [retry])

  if (isLoading) {
    return <Loading />
  }

  if (!paymentGroup || !paymentGroup.id) {
    return <Loading />
  }

  if (error) {
    return <ErrorPage />
  }

  const highlightColor = getBrandSettings(checkoutSession).color

  const getFirstCashbackValue = () => {
    if (!paymentGroup.id) return 0
    return paymentGroup.payment_group_settings.discount_type == 'PERCENTAGE'
      ? ((checkoutSession.amount_total / 100) *
          paymentGroup.payment_group_settings.discount_levels[0].value) /
          100
      : paymentGroup.payment_group_settings.discount_levels[0].value
  }

  return (
    <section className="rounded-xl bg-white shadow-md">
      <div className="relative rounded-tl-xl rounded-tr-xl ">
        <div className="absolute h-36 w-full rounded-tl-xl rounded-tr-xl border-b-2 border-beige-strong bg-beige bg-kohortpay bg-cover bg-center bg-no-repeat"></div>
        <div className="relative p-7 text-center">
          <CheckCircleIcon className="text-green-600 mx-auto mb-2 h-7 w-7" />
          <h3 className="font-medium uppercase">
            {T('checkout.success_page.title')}
          </h3>
          <p className="text-sm">
            {!successUrl && (
              <span>
                {T('checkout.success_page.description.no_confirmation')}
              </span>
            )}
            {successUrl && (
              <span>
                {T('checkout.success_page.description.confirmation') + ' '}
                <Link href={successUrl}>
                  {T('checkout.success_page.description.new_tab')}
                </Link>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="py-10">
        {paymentGroup.payment_intents.length == 1 && (
          <SectionHeading title="checkout.success_page.group_created.title">
            <span className="font-semibold">
              <Price price={getFirstCashbackValue()} />{' '}
            </span>
            {T('checkout.success_page.group_created.description.cashback')}{' '}
            <span className="font-semibold">
              {T('checkout.success_page.group_created.description.friend')}{' '}
            </span>
            {T('checkout.success_page.group_created.description.reffered')}{' '}
            <br />
            {T(
              'checkout.success_page.group_created.description.with_code'
            )}{' '}
            <span className="font-semibold">{paymentGroup.share_id}</span>
          </SectionHeading>
        )}
        {paymentGroup.payment_intents.length > 1 && (
          <SectionHeading
            title={
              T('checkout.payment_group.joined.kohort_of') +
              getGroupOwnerFullName(paymentGroup)
            }
          >
            <LevelDescriptionSection
              discountLevels={
                paymentGroup.payment_group_settings.discount_levels
              }
              numberOfParticipants={paymentGroup.payment_intents.length}
              shareId={paymentGroup.share_id}
            />
          </SectionHeading>
        )}
        <div className="mx-auto max-w-sm rounded-md border border-grey-lighter bg-white px-11 py-8 shadow-sm">
          <Countdown expiresAt={paymentGroup.expires_at} />
          <InviteSection
            referralCode={paymentGroup.share_id}
            maxCashback={
              paymentGroup.payment_group_settings.discount_levels[2].value +
              (paymentGroup.payment_group_settings.discount_type == 'PERCENTAGE'
                ? ' %'
                : ' €')
            }
            minPurchaseValue={
              paymentGroup.payment_group_settings.min_purchase_value / 100 +
              ' €'
            }
            brandUrl={checkoutSession.organization.website_url || ''}
            highlightColor={highlightColor}
          />
        </div>
        <div
          className="mx-auto my-6 h-0.5 w-3 bg-primary"
          style={
            highlightColor
              ? {
                  backgroundColor: highlightColor && '#' + highlightColor,
                }
              : {}
          }
        ></div>
        <GroupDiscountLevelsSection
          amountTotalWithCents={checkoutSession.amount_total}
          discountType={paymentGroup.payment_group_settings.discount_type}
          discountLevels={paymentGroup.payment_group_settings.discount_levels}
          numberOfParticipants={paymentGroup.payment_intents.length}
          highlightColor={highlightColor}
        />
      </div>
    </section>
  )
}
