import { BullModule } from '@nestjs/bull'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomPrismaModule } from 'nestjs-prisma'

import { BillsModule } from '../bills/bills.module'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsModule } from '../common/ids/ids.module'
import {
  DefaultScopedLoggerService,
  RequestScopedLoggerService,
} from '../logger/logger.service'
import { OrganizationInvitationsModule } from '../organizations/organization-invitations/organization-invitations.module'
import { OrganizationMembershipsModule } from '../organizations/organization-memberships/organization-memberships.module'
import { OrganizationsModule } from '../organizations/organizations.module'
import { extendedPrismaClient } from '../prisma.extension'
import { UsersModule } from '../users/users.module'
import { ClerkWebhooksController } from './clerk/clerk-webhooks.controller'
import { WebhookConsumer } from './webhooks.consumer'
import { WebhooksController } from './webhooks.controller'
import { WebhooksService } from './webhooks.service'

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
    BullModule.registerQueue({
      name: QueueName.WEBHOOK,
      url: process.env.REDIS_URL,
    }),
    forwardRef(() => OrganizationsModule),
    OrganizationInvitationsModule,
    OrganizationMembershipsModule,
    UsersModule,
    forwardRef(() => BillsModule),
  ],
  controllers: [ClerkWebhooksController, WebhooksController],
  providers: [
    WebhooksService,
    DefaultScopedLoggerService,
    RequestScopedLoggerService,
    WebhookConsumer,
  ],
  exports: [WebhooksService],
})
export class WebhooksModule {}
