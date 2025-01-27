import { PaymentGroup } from '@prisma/client'

export class PaymentGroupExpiredEvent {
  constructor(paymentGroup: PaymentGroup) {
    this.paymentGroup = paymentGroup
  }

  paymentGroup: PaymentGroup
}
