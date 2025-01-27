import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersModule } from '../orders/orders.module'
import { PaymentGroupsModule } from '../payment-groups/payment-groups.module'
import { SlackModule } from '../slack/slack.module'
import { FraudService } from './fraud.service'

@Module({
  imports: [
    ConfigModule,
    SlackModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => PaymentGroupsModule),
  ],
  providers: [FraudService, DefaultScopedLoggerService],
  exports: [FraudService],
})
export class FraudModule {}
