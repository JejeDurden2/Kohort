import { Order } from '@prisma/client'

import { Sanitized } from '../../common/types/sanitized.type'
import { omitFields } from '../../common/utils/sanitize'

export class OrderCashbackSentEvent {
  constructor(order: Order) {
    this.order = omitFields(order)
  }

  order: Sanitized<Order>
}
