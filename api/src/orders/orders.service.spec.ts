import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bull'
import { mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { AmbassadorService } from '../ambassador/ambassador.service'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { CustomersService } from '../customers/customers.service'
import { EmailsService } from '../email/emails.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackService } from '../slack/slack.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { OrdersService } from './orders.service'

describe('OrdersService', () => {
  let service: OrdersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        OrdersService,
        {
          provide: IdsService,
          useValue: mockDeep<IdsService>(),
        },
        { provide: CustomersService, useValue: createMock<CustomersService>() },
        {
          provide: EmailsService,
          useValue: createMock<EmailsService>(),
        },
        {
          provide: PaymentGroupsService,
          useValue: createMock<PaymentGroupsService>(),
        },
        {
          provide: PaymentGroupSettingsService,
          useValue: createMock<PaymentGroupSettingsService>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: TransactionalEmailsService,
          useValue: createMock<TransactionalEmailsService>(),
        },
        {
          provide: getQueueToken(QueueName.WITHDRAW_CASHBACK),
          useValue: createMock<Queue>(),
        },
        {
          provide: WhatsappService,
          useValue: createMock<WhatsappService>(),
        },
        {
          provide: EventEmitter2,
          useValue: createMock<EventEmitter2>(),
        },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: AmbassadorService,
          useValue: createMock<AmbassadorService>(),
        },
        {
          provide: SlackService,
          useValue: createMock<SlackService>(),
        },
      ],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
