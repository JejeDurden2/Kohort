import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { WhatsappConsumer } from './whatsapp.consumer'
import { WhatsappService } from './whatsapp.service'

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: QueueName.WHATSAPP,
      url: process.env.REDIS_URL,
    }),
    HttpModule,
  ],
  providers: [WhatsappService, DefaultScopedLoggerService, WhatsappConsumer],
  exports: [WhatsappService],
})
export class WhatsappModule {}
