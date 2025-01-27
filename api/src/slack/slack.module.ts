import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { SlackConsumer } from './slack.consumer'
import { SlackService } from './slack.service'

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: QueueName.SLACK,
      url: process.env.REDIS_URL,
    }),
  ],
  providers: [SlackService, DefaultScopedLoggerService, SlackConsumer],
  exports: [SlackService],
})
export class SlackModule {}
