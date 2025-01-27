import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { AmbassadorModule } from '../ambassador/ambassador.module'
import { IdsModule } from '../common/ids/ids.module'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { PaymentGroupsModule } from '../payment-groups/payment-groups.module'
import { extendedPrismaClient } from '../prisma.extension'
import { CodesController } from './codes.controller'
import { CodesService } from './codes.service'

@Module({
  controllers: [CodesController],
  providers: [CodesService],
})
@Module({
  imports: [
    IdsModule,
    ConfigModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    PaymentGroupsModule,
    AmbassadorModule,
  ],
  controllers: [CodesController],
  providers: [CodesService, DefaultScopedLoggerService],
  exports: [CodesService],
})
export class CodesModule {}
