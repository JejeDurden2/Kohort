import { DiscountType, PaymentIntent } from '@prisma/client'

import { Sanitized } from '../../common/types/sanitized.type'
import { omitFields } from '../../common/utils/sanitize'

export class PaymentIntentCashbackAvailableEvent {
  constructor(
    paymentIntent: PaymentIntent,
    discountType: DiscountType,
    discountValue: number
  ) {
    this.paymentIntent = omitFields(paymentIntent)
    this.discountType = discountType
    this.discountValue = discountValue
  }

  paymentIntent: Sanitized<PaymentIntent>
  discountValue: number
  discountType: DiscountType
}
