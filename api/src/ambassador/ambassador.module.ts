import { Module } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { EmailsModule } from '../email/emails.module'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackModule } from '../slack/slack.module'
import { TransactionalEmailsModule } from '../transactional-emails/transactional-emails.module'
import { WhatsappModule } from '../whatsapp/whatsapp.module'
import { AmbassadorService } from './ambassador.service'
import { AmbassadorController } from './internal-ambassador.controller'

@Module({
  imports: [
    IdsModule,
    EmailsModule,
    TransactionalEmailsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    SlackModule,
    WhatsappModule,
  ],
  controllers: [AmbassadorController],
  providers: [AmbassadorService],
  exports: [AmbassadorService],
})
export class AmbassadorModule {}
