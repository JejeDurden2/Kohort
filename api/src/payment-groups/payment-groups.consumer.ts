import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { QueueName } from '../common/enums/queue-names.enum'
import { PaymentGroupsService } from './payment-groups.service'

@Processor(QueueName.PROCESS_PAYMENT_GROUP)
export class PaymentGroupProcessConsumer {
  constructor(private readonly paymentGroupsService: PaymentGroupsService) {}

  @Process(QueueName.PROCESS_PAYMENT_GROUP)
  async processPaymentGroup(paymentGroupProcessJob: Job<string>) {
    return await this.paymentGroupsService.process(paymentGroupProcessJob.data)
  }
}
