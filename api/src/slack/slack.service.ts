import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IncomingWebhook } from '@slack/webhook'
import { Queue } from 'bull'

import { NODE_ENV_PROD } from '../common/constants/miscellaneous.constants'
import { QueueName } from '../common/enums/queue-names.enum'
import { SendSlackDto } from './dto/send-slack.dto'

@Injectable()
export class SlackService {
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(QueueName.SLACK) private slackQueue: Queue
  ) {}

  async enqueue(sendSlackDto: SendSlackDto) {
    await this.slackQueue.add(QueueName.SLACK, sendSlackDto)
  }

  async send(sendSlackDto: SendSlackDto) {
    if (this.configService.get('NODE_ENV') !== NODE_ENV_PROD) return
    const url = this.configService.get(sendSlackDto.webhook, '')

    const webhook = new IncomingWebhook(url)

    // Send the notification
    ;(async () => {
      await webhook.send({
        text: sendSlackDto.text,
      })
    })()
  }
}
