import { Process, Processor } from '@nestjs/bull'
import { Bill, PaymentGroup, PaymentIntent } from '@prisma/client'
import { Job } from 'bull'

import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { QueueName } from '../common/enums/queue-names.enum'
import { Sanitized } from '../common/types/sanitized.type'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { WebhooksService } from './webhooks.service'

type webhookJobData = {
  event: KohortPayEvent
  applicationId: string
  object: Sanitized<PaymentIntent> | PaymentGroup | Bill
}
@Processor(QueueName.WEBHOOK)
export class WebhookConsumer {
  constructor(
    private readonly webhooksService: WebhooksService,
    private loggerService: DefaultScopedLoggerService
  ) {}

  @Process(QueueName.WEBHOOK)
  async sendWebhook(webhookJob: Job<webhookJobData>) {
    this.loggerService.log(`Sending webhook job ${webhookJob.id}...`, {
      function: this.sendWebhook.name,
      controller: WebhookConsumer.name,
      object: {
        applicationId: webhookJob.data.applicationId,
        objectId: webhookJob.data.object.id,
        event: webhookJob.data.event,
      },
    })
    const send = await this.webhooksService.send(
      webhookJob.data.applicationId,
      webhookJob.data.object,
      webhookJob.data.event
    )
    this.loggerService.log(`Webhook job ${webhookJob.id} sent.`, {
      function: this.sendWebhook.name,
      controller: WebhookConsumer.name,
      object: send,
    })
    return send
  }
}
