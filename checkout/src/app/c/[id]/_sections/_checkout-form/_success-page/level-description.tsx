import { PaymentGroupDiscountLevels } from '@alltypes/PaymentGroup'

import T from '@locales/locale'

export default function LevelDescriptionSection({
  discountLevels,
  numberOfParticipants,
  shareId,
}: {
  discountLevels: PaymentGroupDiscountLevels
  numberOfParticipants: number
  shareId: string
}) {
  if (numberOfParticipants >= discountLevels[2].participants_to_unlock) {
    return (
      <>
        {T(
          'checkout.success_page.level_description.unlock_last_level_congrats'
        )}{' '}
      </>
    )
  }

  if (numberOfParticipants >= discountLevels[1].participants_to_unlock) {
    return (
      <>
        {T('checkout.success_page.level_description.refer')}
        <span className="font-semibold">
          {' ' +
            (discountLevels[2].participants_to_unlock - numberOfParticipants) +
            ' '}
          {T('checkout.success_page.level_description.friends') + ' '}
        </span>
        {T('checkout.success_page.level_description.share_code')}
        <span className="font-semibold"> {shareId} </span>
        <br />
        {T('checkout.success_page.level_description.to_unlock')}
        <span className="font-semibold">
          {' ' + T('checkout.success_page.level_description.third_level')}
        </span>
        .
      </>
    )
  }

  if (numberOfParticipants >= discountLevels[0].participants_to_unlock) {
    return (
      <>
        {T('checkout.success_page.level_description.refer')}
        <span className="font-semibold">
          {' ' +
            (discountLevels[1].participants_to_unlock - numberOfParticipants) +
            ' '}
          {T('checkout.success_page.level_description.friends') + ' '}
        </span>
        {T('checkout.success_page.level_description.share_code')}
        <span className="font-semibold"> {shareId} </span>
        <br />
        {T('checkout.success_page.level_description.to_unlock')}
        <span className="font-semibold">
          {' ' + T('checkout.success_page.level_description.second_level')}
        </span>
        .
      </>
    )
  }
}
