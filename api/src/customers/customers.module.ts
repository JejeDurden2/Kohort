import { Module } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'

@Module({
  imports: [
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, DefaultScopedLoggerService],
  exports: [CustomersService],
})
export class CustomersModule {}
