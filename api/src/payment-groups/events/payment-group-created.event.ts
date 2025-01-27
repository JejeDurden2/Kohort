import { PaymentGroup } from '@prisma/client'

export class PaymentGroupCreatedEvent {
  constructor(
    paymentGroup: PaymentGroup,
    paymentIntentId: string | undefined,
    orderId: string | undefined
  ) {
    this.paymentGroup = paymentGroup
    this.paymentIntentId = paymentIntentId
    this.orderId = orderId
  }

  paymentGroup: PaymentGroup
  paymentIntentId: string | undefined
  orderId: string | undefined
}
