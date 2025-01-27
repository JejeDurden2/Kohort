import {
  PaymentGroupJoinedType,
  PaymentGroupType,
} from '@alltypes/PaymentGroup'

export function getGroupOwnerFullName(
  paymentGroup: PaymentGroupJoinedType | PaymentGroupType
) {
  if (!paymentGroup || !paymentGroup.customer) return ''

  const groupOwner = paymentGroup.customer
  return groupOwner.first_name + ' ' + groupOwner.last_name[0] + '.'
}
