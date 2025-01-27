import { Module } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { extendedPrismaClient } from '../prisma.extension'
import { BrandSettingsService } from './brand-settings.service'

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
  providers: [BrandSettingsService],
  exports: [BrandSettingsService],
})
export class BrandSettingsModule {}
