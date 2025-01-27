import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { EmailsModule } from '../email/emails.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { extendedPrismaClient } from '../prisma.extension'
import { TransactionalEmailsController } from './transactional-emails.controller'
import { TransactionalEmailsService } from './transactional-emails.service'

@Module({
  imports: [
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    EmailsModule,
    ConfigModule,
  ],
  controllers: [TransactionalEmailsController],
  providers: [TransactionalEmailsService, DefaultScopedLoggerService],
  exports: [TransactionalEmailsService],
})
export class TransactionalEmailsModule {}
