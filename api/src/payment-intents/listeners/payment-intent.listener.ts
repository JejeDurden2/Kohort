import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PaymentIntent } from '@prisma/client'

import { CheckoutSessionsService } from '../../checkout-sessions/checkout-sessions.service'
import { KohortPayEvent } from '../../common/enums/kohortpay-events.enum'
import { Sanitized } from '../../common/types/sanitized.type'
import { DefaultScopedLoggerService } from '../../logger/logger.service'
import { OrganizationsService } from '../../organizations/organizations.service'
import { WebhooksService } from '../../webhooks/webhooks.service'
import { PaymentIntentCashbackAvailableEvent } from '../events/payment-intent-cashback-available.event'
import { PaymentIntentCashbackSentEvent } from '../events/payment-intent-cashback-sent.event'
import { PaymentIntentSucceededEvent } from '../events/payment-intent-succeeded.event'
import { PaymentIntentsService } from '../payment-intents.service'

@Injectable()
export class PaymentIntentListener {
  constructor(
    private webhooksService: WebhooksService,
    private loggerService: DefaultScopedLoggerService,
    private organizationsService: OrganizationsService,
    private paymentIntentsService: PaymentIntentsService,
    private checkoutSessionsService: CheckoutSessionsService
  ) {}

  async enqueueWebhooks(
    event: KohortPayEvent,
    paymentIntent: Sanitized<PaymentIntent>
  ) {
    const organization = await this.organizationsService.findOne(
      paymentIntent.organizationId
    )
    if (!organization || !organization.svixApplicationId) {
      this.loggerService.error(
        `Organization ${paymentIntent.organizationId} does not exist or does not have a Svix application ID.`,
        undefined,
        {
          service: PaymentIntentListener.name,
          function: this.enqueueWebhooks.name,
          object: organization?.id,
          event,
        }
      )
      throw new Error(
        `Organization ${paymentIntent.organizationId} does not exist or does not have a Svix application ID.`
      )
    }
    try {
      await this.webhooksService.enqueue(
        organization.svixApplicationId,
        paymentIntent,
        event
      )
      this.loggerService.log(
        `Event ${event} for ${organization.id} sent to queue.`,
        {
          service: PaymentIntentListener.name,
          function: this.enqueueWebhooks.name,
          object: {
            applicationId: organization.svixApplicationId,
            paymentIntentId: paymentIntent.id,
          },
          event,
        }
      )
    } catch (error) {
      this.loggerService.error(
        'Error during enqueuing of webhook',
        error.stack,
        {
          service: PaymentIntentListener.name,
          function: this.enqueueWebhooks.name,
          object: {
            applicationId: organization.svixApplicationId,
            paymentIntentId: paymentIntent.id,
          },
          event,
        }
      )
    }
  }

  @OnEvent(KohortPayEvent.PAYMENT_INTENT_SUCCEEDED, { async: true })
  async handlePaymentIntentSucceededEvent(event: PaymentIntentSucceededEvent) {
    await this.enqueueWebhooks(
      KohortPayEvent.PAYMENT_INTENT_SUCCEEDED,
      event.paymentIntent
    )

    await this.checkoutSessionsService.complete(
      event.paymentIntent.checkoutSessionId,
      event.paymentIntent.organizationId,
      event.paymentIntent.livemode
    )

    await this.paymentIntentsService.deprecatedCreateOrJoinGroup(
      event.paymentIntent.id,
      event.paymentIntent.organizationId,
      event.paymentIntent.livemode
    )
  }

  @OnEvent(KohortPayEvent.PAYMENT_INTENT_CASHBACK_SENT, { async: true })
  async handlePaymentIntentCashbackSentEvent(
    event: PaymentIntentCashbackSentEvent
  ) {
    await this.enqueueWebhooks(
      KohortPayEvent.PAYMENT_INTENT_CASHBACK_SENT,
      event.paymentIntent
    )

    await this.paymentIntentsService.deprecatedSendCashbackWithdrawalEmail(
      event.paymentIntent.id
    )
  }

  @OnEvent(KohortPayEvent.PAYMENT_INTENT_CASHBACK_AVAILABLE, { async: true })
  async handlePaymentIntentCashbackAvailableEvent(
    event: PaymentIntentCashbackAvailableEvent
  ) {
    await this.enqueueWebhooks(
      KohortPayEvent.PAYMENT_INTENT_CASHBACK_AVAILABLE,
      event.paymentIntent
    )

    await this.paymentIntentsService.deprecatedSendCashbackReadyEmail(
      event.paymentIntent.id,
      event.discountType,
      event.discountValue
    )
  }
}
