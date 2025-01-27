import { Client } from '@hubspot/api-client'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { HubspotConsumer } from './hubspot.consumer'
import { HubspotService } from './hubspot.service'

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: QueueName.HUBSPOT,
      url: process.env.REDIS_URL,
    }),
  ],
  providers: [
    Client,
    HubspotService,
    DefaultScopedLoggerService,
    HubspotConsumer,
  ],
  exports: [HubspotService],
})
export class HubspotModule {}
