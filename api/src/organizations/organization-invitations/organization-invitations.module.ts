import { Module, forwardRef } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../../common/ids/ids.module'
import { extendedPrismaClient } from '../../prisma.extension'
import { OrganizationsModule } from '../organizations.module'
import { OrganizationInvitationsService } from './organization-invitations.service'

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
  providers: [OrganizationInvitationsService],
  exports: [OrganizationInvitationsService],
})
export class OrganizationInvitationsModule {}
