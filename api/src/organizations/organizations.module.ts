import { BullModule } from '@nestjs/bull'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { ApiKeysModule } from '../api-keys/api-keys.module'
import { BankModule } from '../bank/bank.module'
import { BrandSettingsService } from '../brand-settings/brand-settings.service'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsModule } from '../common/ids/ids.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { extendedPrismaClient } from '../prisma.extension'
import { StripeModule } from '../stripe/stripe.module'
import { UsersModule } from '../users/users.module'
import { InternalOrganizationsController } from './internal-organization.controller'
import { OrganizationsSetupConsumer } from './organizations.consumer'
import { OrganizationsController } from './organizations.controller'
import { OrganizationsService } from './organizations.service'

@Module({
  imports: [
    IdsModule,
    ConfigModule,
    forwardRef(() => ApiKeysModule),
    forwardRef(() => StripeModule),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    BullModule.registerQueue({
      name: QueueName.SETUP_ORGANIZATION,
      url: process.env.REDIS_URL,
    }),
    UsersModule,
    BankModule,
  ],
  controllers: [OrganizationsController, InternalOrganizationsController],
  providers: [
    OrganizationsService,
    PaymentGroupSettingsService,
    BrandSettingsService,
    OrganizationsSetupConsumer,
    DefaultScopedLoggerService,
  ],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
