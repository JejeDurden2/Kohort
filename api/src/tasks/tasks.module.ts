import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { BillsModule } from '../bills/bills.module'
import { CheckoutSessionsModule } from '../checkout-sessions/checkout-sessions.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersModule } from '../orders/orders.module'
import { OrganizationsModule } from '../organizations/organizations.module'
import { PaymentGroupsModule } from '../payment-groups/payment-groups.module'
import { PaymentIntentsModule } from '../payment-intents/payment-intents.module'
import { extendedPrismaClient } from '../prisma.extension'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    HttpModule,
    ConfigModule,
    CheckoutSessionsModule,
    PaymentGroupsModule,
    OrganizationsModule,
    BillsModule,
    OrdersModule,
    PaymentIntentsModule,
  ],
  providers: [TasksService, DefaultScopedLoggerService],
})
export class TasksModule {}
