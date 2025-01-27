import { Module } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { HubspotModule } from '../hubspot/hubspot.module'
import { extendedPrismaClient } from '../prisma.extension'
import { UsersService } from './users.service'

@Module({
  imports: [
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    HubspotModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
