import { CheckCircleIcon } from '@heroicons/react/24/outline'

import { PaymentGroupJoinedType } from '@alltypes/PaymentGroup'

import T from '@locales/locale'

import { getGroupOwnerFullName } from '@utils/paymentGroup'

import Price from '@ui/Elements/Price'
import SectionHeading from '@ui/Elements/SectionHeading'

export default function HeadingSection({
  paymentGroup,
  amountTotalWithCents,
}: {
  paymentGroup: PaymentGroupJoinedType
  amountTotalWithCents: number
}) {
  if (!paymentGroup.id) {
    return (
      <SectionHeading
        title="checkout.payment_group.new.title"
        description="checkout.payment_group.new.description"
      />
    )
  }

  const cashback =
    paymentGroup.discount_type == 'AMOUNT'
      ? paymentGroup.current_discount_level.value
      : ((amountTotalWithCents / 100) *
          paymentGroup.current_discount_level.value) /
        100

  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green bg-opacity-10 px-2 py-1 text-sm font-semibold uppercase text-green ring-1 ring-inset ring-green ring-opacity-30">
        <CheckCircleIcon className="h-5 w-5" />
        {T('checkout.payment_group.joined.title')}
      </span>
      <SectionHeading
        title={
          T('checkout.payment_group.joined.kohort_of') +
          getGroupOwnerFullName(paymentGroup)
        }
      >
        {T('checkout.payment_group.joined.congrats')}
        <span className="font-semibold">
          <Price price={cashback} />
        </span>
        {T('checkout.payment_group.joined.of_unlocked_cashback')}
      </SectionHeading>
    </div>
  )
}
