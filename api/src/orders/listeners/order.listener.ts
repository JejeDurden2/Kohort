import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Order } from '@prisma/client'

import { KohortPayEvent } from '../../common/enums/kohortpay-events.enum'
import { Sanitized } from '../../common/types/sanitized.type'
import { FraudService } from '../../fraud/fraud.service'
import { DefaultScopedLoggerService } from '../../logger/logger.service'
import { OrganizationsService } from '../../organizations/organizations.service'
import { WebhooksService } from '../../webhooks/webhooks.service'
import { OrderCashbackAvailableEvent } from '../events/order-cashback-available.event'
import { OrderCashbackSentEvent } from '../events/order-cashback-sent.event'
import { OrderCreatedEvent } from '../events/order-created.event'
import { OrdersService } from '../orders.service'

@Injectable()
export class OrderListener {
  constructor(
    private webhooksService: WebhooksService,
    private loggerService: DefaultScopedLoggerService,
    private organizationsService: OrganizationsService,
    private ordersService: OrdersService,
    @Inject(forwardRef(() => FraudService))
    private fraudService: FraudService
  ) {}

  async enqueueWebhooks(event: KohortPayEvent, order: Sanitized<Order>) {
    const organization = await this.organizationsService.findOne(
      order.organizationId
    )
    if (!organization || !organization.svixApplicationId) {
      this.loggerService.error(
        `Organization ${order.organizationId} does not exist or does not have a Svix application ID.`,
        undefined,
        {
          service: OrderListener.name,
          function: this.enqueueWebhooks.name,
          object: organization?.id,
          event,
        }
      )
      throw new Error(
        `Organization ${order.organizationId} does not exist or does not have a Svix application ID.`
      )
    }
    try {
      await this.webhooksService.enqueue(
        organization.svixApplicationId,
        order,
        event
      )
      this.loggerService.log(
        `Event ${event} for ${organization.id} sent to queue.`,
        {
          service: OrderListener.name,
          function: this.enqueueWebhooks.name,
          object: {
            applicationId: organization.svixApplicationId,
            orderId: order.id,
          },
          event,
        }
      )
    } catch (error) {
      this.loggerService.error(
        'Error during enqueuing of webhook',
        error.stack,
        {
          service: OrderListener.name,
          function: this.enqueueWebhooks.name,
          object: {
            applicationId: organization.svixApplicationId,
            orderId: order.id,
          },
          event,
        }
      )
    }
  }

  @OnEvent(KohortPayEvent.ORDER_CREATED, { async: true })
  async handleOrderCreatedEvent(event: OrderCreatedEvent) {
    await this.enqueueWebhooks(KohortPayEvent.ORDER_CREATED, event.order)

    await this.fraudService.assess(
      event.order.id,
      event.order.organizationId,
      event.order.livemode
    )
  }

  @OnEvent(KohortPayEvent.ORDER_CASHBACK_SENT, { async: true })
  async handleOrderCashbackSentEvent(event: OrderCashbackSentEvent) {
    await this.enqueueWebhooks(KohortPayEvent.ORDER_CASHBACK_SENT, event.order)

    await this.ordersService.sendCashbackWithdrawalEmail(event.order.id)
  }

  @OnEvent(KohortPayEvent.ORDER_CASHBACK_AVAILABLE, { async: true })
  async handleOrderCashbackAvailableEvent(event: OrderCashbackAvailableEvent) {
    await this.enqueueWebhooks(
      KohortPayEvent.ORDER_CASHBACK_AVAILABLE,
      event.order
    )

    await this.ordersService.sendCashbackReadyEmail(
      event.order.id,
      event.discountType,
      event.discountValue
    )
  }
}
