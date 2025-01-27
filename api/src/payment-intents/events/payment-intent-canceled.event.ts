import { PaymentIntent } from '@prisma/client'

import { Sanitized } from '../../common/types/sanitized.type'
import { omitFields } from '../../common/utils/sanitize'

export class PaymentIntentCanceledEvent {
  constructor(paymentIntent: PaymentIntent) {
    this.paymentIntent = omitFields(paymentIntent)
  }

  paymentIntent: Sanitized<PaymentIntent>
}
