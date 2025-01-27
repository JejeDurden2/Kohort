import { Prisma } from '@prisma/client'

type PaymentGroupType = Prisma.PaymentGroupGetPayload<{
  include: {
    paymentGroupSettings: {
      include: {
        discountLevels: true
      }
    }
  }
}>

type PaymentIntentType = Prisma.PaymentIntentGetPayload<{
  include: {
    customer: true
    organization: {
      include: {
        brandSettings: true
      }
    }
  }
}>

type OrderType = Prisma.OrderGetPayload<{
  include: {
    customer: true
    organization: {
      include: {
        brandSettings: true
      }
    }
  }
}>

export class DeprecatedPaymentGroupNewMemberJoinedEvent {
  paymentGroup: PaymentGroupType
  paymentIntent: PaymentIntentType

  constructor(
    paymentGroup: PaymentGroupType,
    paymentIntent: PaymentIntentType
  ) {
    this.paymentGroup = paymentGroup
    this.paymentIntent = paymentIntent
  }
}

export class PaymentGroupNewMemberJoinedEvent {
  paymentGroup: PaymentGroupType
  order: OrderType

  constructor(paymentGroup: PaymentGroupType, order: OrderType) {
    this.paymentGroup = paymentGroup
    this.order = order
  }
}
