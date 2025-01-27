import { BullModule } from '@nestjs/bull'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { BankModule } from '../bank/bank.module'
import { CheckoutSessionsModule } from '../checkout-sessions/checkout-sessions.module'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsModule } from '../common/ids/ids.module'
import { CustomersModule } from '../customers/customers.module'
import { EmailsModule } from '../email/emails.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsModule } from '../organizations/organizations.module'
import { PaymentGroupsModule } from '../payment-groups/payment-groups.module'
import { extendedPrismaClient } from '../prisma.extension'
import { TransactionalEmailsModule } from '../transactional-emails/transactional-emails.module'
import { WebhooksModule } from '../webhooks/webhooks.module'
import { WhatsappModule } from '../whatsapp/whatsapp.module'
import { InternalPaymentIntentsController } from './internal-payment-intents.controller'
import { PaymentIntentListener } from './listeners/payment-intent.listener'
import {
  PaymentIntentSendCashbackConsumer,
  WithdrawCashbackConsumer,
} from './payment-intents.consumer'
import { PaymentIntentsController } from './payment-intents.controller'
import { PaymentIntentsService } from './payment-intents.service'

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
    forwardRef(() => OrganizationsModule),
    CustomersModule,
    forwardRef(() => CheckoutSessionsModule),
    EmailsModule,
    WhatsappModule,
    ConfigModule,
    CustomersModule,
    BullModule.registerQueue({
      name: QueueName.SEND_CASHBACK,
      url: process.env.REDIS_URL,
    }),
    BullModule.registerQueue({
      name: QueueName.WITHDRAW_CASHBACK,
      url: process.env.REDIS_URL,
    }),
    forwardRef(() => WebhooksModule),
    forwardRef(() => BankModule),
    TransactionalEmailsModule,
  ],
  controllers: [PaymentIntentsController, InternalPaymentIntentsController],
  providers: [
    PaymentIntentsService,
    DefaultScopedLoggerService,
    PaymentIntentSendCashbackConsumer,
    WithdrawCashbackConsumer,
    PaymentIntentListener,
    TransactionalEmailsModule,
  ],
  exports: [PaymentIntentsService],
})
export class PaymentIntentsModule {}
