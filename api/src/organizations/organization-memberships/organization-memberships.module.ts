import { Module, forwardRef } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { extendedPrismaClient } from '../../prisma.extension'
import { OrganizationsModule } from '../organizations.module'
import { OrganizationMembershipsService } from './organization-memberships.service'

@Module({
  imports: [
    forwardRef(() => OrganizationsModule),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
  ],
  providers: [OrganizationMembershipsService],
  exports: [OrganizationMembershipsService],
})
export class OrganizationMembershipsModule {}
