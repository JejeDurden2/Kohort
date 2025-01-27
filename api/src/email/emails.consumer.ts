import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { QueueName } from '../common/enums/queue-names.enum'
import { SendEmailDto } from './dto/send-email.dto'
import { EmailsService } from './emails.service'

@Processor(QueueName.EMAIL)
export class EmailConsumer {
  constructor(private readonly emailsService: EmailsService) {}

  @Process(QueueName.EMAIL)
  async sendEmail(emailJob: Job<SendEmailDto>) {
    await this.emailsService.send(emailJob.data)
  }
}
