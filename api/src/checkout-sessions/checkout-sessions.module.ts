import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { CodesModule } from '../codes/codes.module'
import { IdsModule } from '../common/ids/ids.module'
import { CustomersService } from '../customers/customers.service'
import {
  DefaultScopedLoggerService,
  RequestScopedLoggerService,
} from '../logger/logger.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentGroupsModule } from '../payment-groups/payment-groups.module'
import { PaymentIntentsModule } from '../payment-intents/payment-intents.module'
import { extendedPrismaClient } from '../prisma.extension'
import { CheckoutSessionsController } from './checkout-sessions.controller'
import { CheckoutSessionsService } from './checkout-sessions.service'
import { InternalCheckoutSessionsController } from './internal-checkout-sessions.controller'

@Module({
  imports: [
    IdsModule,
    ConfigModule,
    forwardRef(() => PaymentIntentsModule),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    forwardRef(() => PaymentGroupsModule),
    CodesModule,
  ],
  controllers: [CheckoutSessionsController, InternalCheckoutSessionsController],
  providers: [
    CheckoutSessionsService,
    RequestScopedLoggerService,
    DefaultScopedLoggerService,
    PaymentGroupSettingsService,
    CustomersService,
  ],
  exports: [CheckoutSessionsService],
})
export class CheckoutSessionsModule {}
