import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { QueueName } from '../common/enums/queue-names.enum'
import { SendSlackDto } from './dto/send-slack.dto'
import { SlackService } from './slack.service'

@Processor(QueueName.SLACK)
export class SlackConsumer {
  constructor(private readonly slackService: SlackService) {}

  @Process(QueueName.SLACK)
  async sendSlack(slackJob: Job<SendSlackDto>) {
    await this.slackService.send(slackJob.data)
  }
}
