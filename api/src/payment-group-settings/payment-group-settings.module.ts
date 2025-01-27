import { Module } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { extendedPrismaClient } from '../prisma.extension'
import { PaymentGroupSettingsController } from './payment-group-settings.controller'
import { PaymentGroupSettingsService } from './payment-group-settings.service'

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
  controllers: [PaymentGroupSettingsController],
  providers: [PaymentGroupSettingsService],
  exports: [PaymentGroupSettingsService],
})
export class PaymentGroupSettingsModule {}
