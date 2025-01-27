import { Module, forwardRef } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import {
  DefaultScopedLoggerService,
  RequestScopedLoggerService,
} from '../logger/logger.service'
import { OrganizationsModule } from '../organizations/organizations.module'
import { extendedPrismaClient } from '../prisma.extension'
import { ApiKeysController } from './api-keys.controller'
import { ApiKeysService } from './api-keys.service'

@Module({
  imports: [
    IdsModule,
    forwardRef(() => OrganizationsModule),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
  ],
  controllers: [ApiKeysController],
  providers: [
    ApiKeysService,
    DefaultScopedLoggerService,
    RequestScopedLoggerService,
  ],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
