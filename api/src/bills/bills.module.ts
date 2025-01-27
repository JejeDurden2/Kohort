import { Module, forwardRef } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsModule } from '../organizations/organizations.module'
import { PaymentIntentsModule } from '../payment-intents/payment-intents.module'
import { extendedPrismaClient } from '../prisma.extension'
import { StripeModule } from '../stripe/stripe.module'
import { TransactionalEmailsModule } from '../transactional-emails/transactional-emails.module'
import { BillsController } from './bills.controller'
import { BillsService } from './bills.service'

@Module({
  imports: [
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    forwardRef(() => StripeModule),
    forwardRef(() => OrganizationsModule),
    forwardRef(() => PaymentIntentsModule),
    TransactionalEmailsModule,
  ],
  controllers: [BillsController],
  providers: [BillsService, DefaultScopedLoggerService],
  exports: [BillsService],
})
export class BillsModule {}
