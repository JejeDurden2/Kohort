import { DiscountType, Order } from '@prisma/client'

import { Sanitized } from '../../common/types/sanitized.type'
import { omitFields } from '../../common/utils/sanitize'

export class OrderCashbackAvailableEvent {
  constructor(order: Order, discountType: DiscountType, discountValue: number) {
    this.order = omitFields(order)
    this.discountType = discountType
    this.discountValue = discountValue
  }

  order: Sanitized<Order>
  discountValue: number
  discountType: DiscountType
}
