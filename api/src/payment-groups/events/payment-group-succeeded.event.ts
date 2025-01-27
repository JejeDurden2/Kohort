import { PaymentGroup } from '@prisma/client'

export class PaymentGroupSucceededEvent {
  constructor(paymentGroup: PaymentGroup) {
    this.paymentGroup = paymentGroup
  }

  paymentGroup: PaymentGroup
}
