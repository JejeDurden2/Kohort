import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PaymentGroup, PaymentIntentStatus, Prisma } from '@prisma/client'

import { KohortPayEvent } from '../../common/enums/kohortpay-events.enum'
import { DefaultScopedLoggerService } from '../../logger/logger.service'
import { OrdersService } from '../../orders/orders.service'
import { OrganizationsService } from '../../organizations/organizations.service'
import { PaymentGroupSettingsService } from '../../payment-group-settings/payment-group-settings.service'
import { PaymentIntentsService } from '../../payment-intents/payment-intents.service'
import { SlackService } from '../../slack/slack.service'
import { WebhooksService } from '../../webhooks/webhooks.service'
import { PaymentGroupCreatedEvent } from '../events/payment-group-created.event'
import { PaymentGroupExpiredEvent } from '../events/payment-group-expired.event'
import {
  DeprecatedPaymentGroupNewMemberJoinedEvent,
  PaymentGroupNewMemberJoinedEvent,
} from '../events/payment-group-joined.event'
import { PaymentGroupSucceededEvent } from '../events/payment-group-succeeded.event'
import { PaymentGroupsService } from '../payment-groups.service'

@Injectable()
export class PaymentGroupListener {
  constructor(
    private webhooksService: WebhooksService,
    private loggerService: DefaultScopedLoggerService,
    private organizationsService: OrganizationsService,
    private paymentGroupService: PaymentGroupsService,
    private paymentGroupSettingsService: PaymentGroupSettingsService,
    private paymentIntentsService: PaymentIntentsService,
    private slackService: SlackService,
    private ordersService: OrdersService
  ) {}

  async enqueueWebhooks(event: KohortPayEvent, paymentGroup: PaymentGroup) {
    const organization = await this.organizationsService.findOne(
      paymentGroup.organizationId
    )
    if (!organization || !organization.svixApplicationId) {
      this.loggerService.error(
        `Organization ${paymentGroup.organizationId} does not exist or does not have a Svix application ID.`,
        undefined,
        {
          service: PaymentGroupListener.name,
          function: this.enqueueWebhooks.name,
          object: organization?.id,
          event,
        }
      )
      throw new Error(
        `Organization ${paymentGroup.organizationId} does not exist or does not have a Svix application ID.`
      )
    }
    try {
      await this.webhooksService.enqueue(
        organization.svixApplicationId,
        paymentGroup,
        event
      )
      this.loggerService.log(
        `Event ${event} for ${organization.id} sent to queue.`,
        {
          service: PaymentGroupListener.name,
          function: this.enqueueWebhooks.name,
          object: {
            applicationId: organization.svixApplicationId,
            paymentGroupId: paymentGroup.id,
          },
          event,
        }
      )
    } catch (error) {
      this.loggerService.error(
        'Error during enqueuing of webhook',
        error.stack,
        {
          service: PaymentGroupListener.name,
          function: this.enqueueWebhooks.name,
          object: {
            applicationId: organization.svixApplicationId,
            paymentIntentId: paymentGroup.id,
          },
          event,
        }
      )
    }
  }

  @OnEvent(KohortPayEvent.PAYMENT_GROUP_CREATED, { async: true })
  async handlePaymentGroupCreatedEvent(event: PaymentGroupCreatedEvent) {
    await this.enqueueWebhooks(
      KohortPayEvent.PAYMENT_GROUP_CREATED,
      event.paymentGroup
    )

    const paymentGroupSettings =
      (await this.paymentGroupSettingsService.findOneByOrganizationIdAndLivemode(
        event.paymentGroup.organizationId,
        event.paymentGroup.livemode,
        { expand: ['discountLevels'] }
      )) as Prisma.PaymentGroupSettingsGetPayload<{
        include: {
          discountLevels: true
        }
      }>

    if (!paymentGroupSettings) {
      throw new BadRequestException(
        `Payment group settings not found for organization ${event.paymentGroup.organizationId}.`
      )
    }

    await this.paymentGroupSettingsService.duplicateToPaymentGroup(
      paymentGroupSettings.id,
      event.paymentGroup.id,
      event.paymentGroup.livemode
    )

    if (event.orderId) {
      await this.ordersService.sendConfirmationEmail(
        event.orderId,
        event.paymentGroup.organizationId,
        event.paymentGroup.livemode
      )
    } else if (event.paymentIntentId) {
      await this.paymentIntentsService.deprecatedSendConfirmationEmail(
        event.paymentIntentId,
        event.paymentGroup.organizationId,
        event.paymentGroup.livemode
      )
    }
  }

  @OnEvent(KohortPayEvent.DEPRECATED_PAYMENT_GROUP_NEW_MEMBER_JOINED, {
    async: true,
  })
  async deprecatedHandlePaymentGroupNewMemberJoinedEvent(
    event: DeprecatedPaymentGroupNewMemberJoinedEvent
  ) {
    await this.enqueueWebhooks(
      KohortPayEvent.DEPRECATED_PAYMENT_GROUP_NEW_MEMBER_JOINED,
      event.paymentGroup
    )

    if (event.paymentIntent.livemode) {
      const text = `:partying_face: [${event.paymentIntent.organization.name}] Someone joined Payment group \`${event.paymentGroup.id}\` ! :tada:`
      await this.slackService.enqueue({
        text,
        webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
      })
    }

    await this.paymentIntentsService.deprecatedSendApplicationFeeAmount(
      event.paymentIntent,
      true
    )

    await this.paymentGroupService.deprecatedSendEmailsOnDiscountLevelUnlocked(
      event.paymentGroup,
      event.paymentIntent
    )

    await this.paymentIntentsService.deprecatedSendConfirmationEmail(
      event.paymentIntent.id,
      event.paymentIntent.organizationId,
      event.paymentIntent.livemode
    )
  }

  @OnEvent(KohortPayEvent.PAYMENT_GROUP_NEW_MEMBER_JOINED, { async: true })
  async handlePaymentGroupNewMemberJoinedEvent(
    event: PaymentGroupNewMemberJoinedEvent
  ) {
    await this.enqueueWebhooks(
      KohortPayEvent.PAYMENT_GROUP_NEW_MEMBER_JOINED,
      event.paymentGroup
    )

    if (event.order.livemode) {
      const text = `:partying_face: [${event.order.organization.name}] Someone joined Payment group \`${event.paymentGroup.id}\` ! :tada:`
      await this.slackService.enqueue({
        text,
        webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
      })
    }

    await this.ordersService.saveApplicationFeeAmount(event.order)
    await this.paymentGroupService.sendEmailsOnDiscountLevelUnlocked(
      event.paymentGroup,
      event.order
    )
    await this.ordersService.sendConfirmationEmail(
      event.order.id,
      event.order.organizationId,
      event.order.livemode
    )
  }

  @OnEvent(KohortPayEvent.PAYMENT_GROUP_SUCCEEDED, { async: true })
  async handlePaymentGroupSucceededEvent(event: PaymentGroupSucceededEvent) {
    const paymentGroup = (await this.paymentGroupService.findOne(
      event.paymentGroup.id,
      { expand: ['paymentIntents', 'paymentGroupSettings.discountLevels'] }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentIntents: true
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
      }
    }>

    if (!paymentGroup) {
      throw new NotFoundException(
        `Payment group ${event.paymentGroup.id} not found.`
      )
    }

    if (!paymentGroup.paymentGroupSettings) {
      throw new BadRequestException(
        `Payment group ${event.paymentGroup.id} has no settings.`
      )
    }

    const currentDiscountLevel =
      this.paymentGroupService.getCurrentDiscountLevel(
        paymentGroup.paymentIntents.length,
        paymentGroup.paymentGroupSettings.discountLevels
      )

    await this.enqueueWebhooks(KohortPayEvent.PAYMENT_GROUP_SUCCEEDED, {
      ...currentDiscountLevel,
      ...paymentGroup,
    })
  }

  @OnEvent(KohortPayEvent.PAYMENT_GROUP_EXPIRED, { async: true })
  async handlePaymentGroupExpiredEvent(event: PaymentGroupExpiredEvent) {
    await this.enqueueWebhooks(
      KohortPayEvent.PAYMENT_GROUP_EXPIRED,
      event.paymentGroup
    )

    const paymentGroup = (await this.paymentGroupService.findOne(
      event.paymentGroup.id,
      { expand: ['paymentIntents', 'orders'] }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentIntents: true
        orders: true
      }
    }>

    if (!paymentGroup) {
      throw new NotFoundException(
        `Payment group ${event.paymentGroup.id} not found.`
      )
    }
    if (paymentGroup.paymentIntents.length > 0) {
      const paymentIntent = (await this.paymentIntentsService.findOne(
        paymentGroup.paymentIntents[0].id,
        {
          expand: [
            'customer',
            'organization',
            'checkoutSession.lineItems',
            'paymentGroup',
          ],
        }
      )) as Prisma.PaymentIntentGetPayload<{
        include: {
          customer: true
          organization: true
          checkoutSession: {
            include: {
              lineItems: true
            }
          }
          paymentGroup: true
        }
      }>

      if (paymentIntent) {
        if (!(paymentIntent.status === PaymentIntentStatus.SUCCEEDED)) {
          throw new BadRequestException(
            `Payment intent ${paymentIntent.id} cannot be updated because it is not in the correct state.`
          )
        }

        await this.paymentIntentsService.updateAmountCaptured(
          paymentIntent.id,
          paymentIntent.amount
        )

        if (!paymentIntent.customer) {
          throw new BadRequestException(
            `Payment intent ${paymentIntent.id} has no customer.`
          )
        }

        await this.paymentIntentsService.deprecatedNoCashbackSentEmail(
          paymentIntent.id
        )
      }
    } else {
      const order = (await this.ordersService.findOne(
        paymentGroup.orders[0].id,
        {
          expand: ['customer', 'organization', 'paymentGroup'],
        }
      )) as Prisma.OrderGetPayload<{
        include: {
          customer: true
          organization: true
          paymentGroup: true
        }
      }>

      if (order) {
        await this.ordersService.noCashbackSentEmail(order.id, [])
      } else {
        throw new NotFoundException(
          `Payment group ${event.paymentGroup.id} has no payment intent or order.`
        )
      }
    }

    this.loggerService.log(`Payment group ${event.paymentGroup.id} expired.`, {
      service: PaymentGroupsService.name,
      function: this.handlePaymentGroupExpiredEvent.name,
      objectId: event.paymentGroup.id,
    })
  }
}
