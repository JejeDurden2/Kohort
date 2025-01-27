import { BullModule } from '@nestjs/bull'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { AmbassadorModule } from '../ambassador/ambassador.module'
import { CheckoutSessionsModule } from '../checkout-sessions/checkout-sessions.module'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsModule } from '../common/ids/ids.module'
import { CustomersModule } from '../customers/customers.module'
import { EmailsModule } from '../email/emails.module'
import { FraudModule } from '../fraud/fraud.module'
import {
  DefaultScopedLoggerService,
  RequestScopedLoggerService,
} from '../logger/logger.service'
import { OrganizationsModule } from '../organizations/organizations.module'
import { PaymentGroupSettingsModule } from '../payment-group-settings/payment-group-settings.module'
import { PaymentGroupsModule } from '../payment-groups/payment-groups.module'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackModule } from '../slack/slack.module'
import { TransactionalEmailsModule } from '../transactional-emails/transactional-emails.module'
import { WebhooksModule } from '../webhooks/webhooks.module'
import { WhatsappModule } from '../whatsapp/whatsapp.module'
import { InternalOrdersController } from './internal-orders.controller'
import { OrderListener } from './listeners/order.listener'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  imports: [
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    forwardRef(() => PaymentGroupsModule),
    forwardRef(() => PaymentGroupSettingsModule),
    forwardRef(() => OrganizationsModule),
    CustomersModule,
    forwardRef(() => CheckoutSessionsModule),
    EmailsModule,
    WhatsappModule,
    ConfigModule,
    CustomersModule,
    BullModule.registerQueue({
      name: QueueName.WITHDRAW_CASHBACK,
      url: process.env.REDIS_URL,
    }),
    WebhooksModule,
    forwardRef(() => FraudModule),
    TransactionalEmailsModule,
    AmbassadorModule,
    SlackModule,
  ],
  controllers: [OrdersController, InternalOrdersController],
  providers: [
    OrdersService,
    DefaultScopedLoggerService,
    RequestScopedLoggerService,
    OrderListener,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
