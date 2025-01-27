import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { StreamClient } from 'getstream'
import { CustomPrismaModule } from 'nestjs-prisma'

import { ApiKeysModule } from '../api-keys/api-keys.module'
import { QueueName } from '../common/enums/queue-names.enum'
import { CustomersModule } from '../customers/customers.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsModule } from '../organizations/organizations.module'
import { extendedPrismaClient } from '../prisma.extension'
import { UsersModule } from '../users/users.module'
import { GetStreamConsumer } from './getstream.consumer'
import { GetStreamController } from './getstream.controller'
import { GetStreamService } from './getstream.service'

@Module({
  imports: [
    ConfigModule,
    ApiKeysModule,
    UsersModule,
    CustomersModule,
    OrganizationsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    BullModule.registerQueue({
      name: QueueName.GETSTREAM,
      url: process.env.REDIS_URL,
    }),
  ],
  controllers: [GetStreamController],
  providers: [
    GetStreamService,
    GetStreamConsumer,
    StreamClient,
    DefaultScopedLoggerService,
  ],
  exports: [GetStreamService],
})
export class GetStreamModule {}
