import { BullModule } from '@nestjs/bull'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { CodesModule } from '../codes/codes.module'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsModule } from '../common/ids/ids.module'
import { CustomersModule } from '../customers/customers.module'
import { EmailsModule } from '../email/emails.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersModule } from '../orders/orders.module'
import { OrganizationsModule } from '../organizations/organizations.module'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentIntentsModule } from '../payment-intents/payment-intents.module'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackModule } from '../slack/slack.module'
import { TransactionalEmailsModule } from '../transactional-emails/transactional-emails.module'
import { WebhooksModule } from '../webhooks/webhooks.module'
import { WhatsappModule } from '../whatsapp/whatsapp.module'
import { InternalPaymentGroupsController } from './internal-payment-groups.controller'
import { PaymentGroupListener } from './listeners/payment-group.listener'
import { PaymentGroupProcessConsumer } from './payment-groups.consumer'
import { PaymentGroupsController } from './payment-groups.controller'
import { PaymentGroupsService } from './payment-groups.service'

@Module({
  imports: [
    IdsModule,
    ConfigModule,
    forwardRef(() => PaymentIntentsModule),
    EmailsModule,
    CustomersModule,
    WhatsappModule,
    BullModule.registerQueue({
      name: QueueName.PROCESS_PAYMENT_GROUP,
      url: process.env.REDIS_URL,
    }),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    forwardRef(() => OrganizationsModule),
    TransactionalEmailsModule,
    WebhooksModule,
    SlackModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => CodesModule),
  ],
  controllers: [PaymentGroupsController, InternalPaymentGroupsController],
  providers: [
    PaymentGroupsService,
    PaymentGroupProcessConsumer,
    PaymentGroupSettingsService,
    DefaultScopedLoggerService,
    PaymentGroupListener,
  ],
  exports: [PaymentGroupsService],
})
export class PaymentGroupsModule {}
