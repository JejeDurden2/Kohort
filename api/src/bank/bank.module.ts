import { HttpModule } from '@nestjs/axios'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersModule } from '../orders/orders.module'
import { PaymentIntentsModule } from '../payment-intents/payment-intents.module'
import { extendedPrismaClient } from '../prisma.extension'
import { BankService } from './bank.service'

@Module({
  imports: [
    ConfigModule,
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    HttpModule,
    forwardRef(() => PaymentIntentsModule),
    OrdersModule,
  ],
  providers: [BankService, DefaultScopedLoggerService],
  exports: [BankService],
})
export class BankModule {}
