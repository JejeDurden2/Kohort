import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { EmailConsumer } from './emails.consumer'
import { EmailsController } from './emails.controller'
import { EmailsService } from './emails.service'
import { IsNonDisposableEmailConstraint } from './validators/is-non-diposable-email.decorator'

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: QueueName.EMAIL,
      url: process.env.REDIS_URL,
    }),
    HttpModule,
  ],
  providers: [
    EmailsService,
    IsNonDisposableEmailConstraint,
    DefaultScopedLoggerService,
    EmailConsumer,
  ],
  controllers: [EmailsController],
  exports: [EmailsService, IsNonDisposableEmailConstraint],
})
export class EmailsModule {}
