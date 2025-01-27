import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import {
  Customer,
  DiscountLevel,
  Organization,
  PaymentGroup,
  PaymentGroupSettings,
  PaymentGroupStatus,
  PaymentIntent,
  Prisma,
} from '@prisma/client'
import { Queue } from 'bull'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createCustomer } from '../../test/factories/customer.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import {
  createDiscountLevel,
  createPaymentGroupSettings,
} from '../../test/factories/payment-group-settings.factory'
import { createPaymentGroup } from '../../test/factories/payment-group.factory'
import { createPaymentIntent } from '../../test/factories/payment-intent.factory'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { CustomersService } from '../customers/customers.service'
import { EmailsService } from '../email/emails.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersService } from '../orders/orders.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackService } from '../slack/slack.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { PaymentGroupsService } from './payment-groups.service'

describe('PaymentGroupsService', () => {
  let service: PaymentGroupsService
  let paymentIntentsService: PaymentIntentsService
  let customersService: CustomersService
  let paymentGroupSettingsService: PaymentGroupSettingsService
  let configService: ConfigService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let paymentGroup: PaymentGroup
  let organizationsService: OrganizationsService
  let paymentIntent: PaymentIntent
  let organization: Organization
  let customer: Customer
  let paymentGroupSettings: PaymentGroupSettings
  let discountLevel: DiscountLevel

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        PaymentGroupsService,
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: PaymentIntentsService,
          useValue: createMock<PaymentIntentsService>(),
        },
        { provide: CustomersService, useValue: createMock<CustomersService>() },
        {
          provide: EmailsService,
          useValue: createMock<EmailsService>(),
        },
        {
          provide: SlackService,
          useValue: createMock<SlackService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: getQueueToken(QueueName.PROCESS_PAYMENT_GROUP),
          useValue: createMock<Queue>(),
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
          provide: WhatsappService,
          useValue: {
            enqueue: jest.fn(),
          },
        },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: EventEmitter2,
          useValue: createMock<EventEmitter2>(),
        },
        {
          provide: TransactionalEmailsService,
          useValue: createMock<TransactionalEmailsService>(),
        },
        {
          provide: OrdersService,
          useValue: createMock<OrdersService>(),
        },
      ],
    }).compile()

    service = module.get<PaymentGroupsService>(PaymentGroupsService)
    paymentIntentsService = module.get<PaymentIntentsService>(
      PaymentIntentsService
    )
    customersService = module.get<CustomersService>(CustomersService)
    paymentGroupSettingsService = module.get<PaymentGroupSettingsService>(
      PaymentGroupSettingsService
    )
    organizationsService =
      module.get<OrganizationsService>(OrganizationsService)
    configService = module.get<ConfigService>(ConfigService)
    prisma = module.get('PrismaService')
    paymentGroup = createPaymentGroup()
    paymentIntent = createPaymentIntent()
    organization = createOrganization()
    customer = createCustomer()
    paymentGroupSettings = createPaymentGroupSettings()
    discountLevel = createDiscountLevel(paymentGroupSettings.id)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getParticipants', () => {
    it('should return PaymentIntent records when PaymentGroup is found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(paymentGroup)
      jest
        .spyOn(paymentIntentsService, 'findAllByPaymentGroup')
        .mockResolvedValue({ data: [paymentIntent], count: 1 })
      const result = await service.deprecatedGetParticipants(paymentGroup.id)
      expect(result).toEqual({ data: [paymentIntent], count: 1 })
    })

    it('should throw BadRequestException when no PaymentGroup is found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null)
      await expect(
        service.deprecatedGetParticipants(paymentGroup.id)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a paymentGroup', async () => {
      const result = paymentGroup
      jest
        .spyOn(organizationsService, 'findOne')
        .mockResolvedValue(organization)
      jest
        .spyOn(
          paymentGroupSettingsService,
          'findOneByOrganizationIdAndLivemode'
        )
        .mockResolvedValue({
          ...paymentGroupSettings,
          discountLevels: [discountLevel],
        } as Prisma.PaymentGroupSettingsGetPayload<{
          include: {
            discountLevels: true
          }
        }>)
      jest
        .spyOn(customersService, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(customer)

      jest.spyOn(configService, 'get').mockReturnValue('localhost')

      prisma.client.paymentGroup.create.mockResolvedValue(result)

      expect(
        await service.create(organization.id, false, {
          customerId: paymentGroup.customerId,
          paymentIntentId: paymentIntent.id,
        })
      ).toEqual(result)
    })
  })

  describe('findAllByOrganizationIdAndLivemode', () => {
    it('should find all paymentGroups by organizationId and livemode', async () => {
      const result = { data: [paymentGroup], count: 1 }
      prisma.client.$transaction.mockResolvedValue([[paymentGroup], 1])

      expect(
        await service.findAllByOrganizationIdAndLivemode(organization.id, false)
      ).toEqual(result)
    })
  })

  describe('findOneByOrganizationAndLivemode', () => {
    it('should find one paymentGroup by organization and livemode', async () => {
      const result = paymentGroup
      prisma.client.paymentGroup.findUnique.mockResolvedValue(paymentGroup)

      expect(
        await service.findOneByOrganizationIdAndLivemode(
          paymentGroup.id,
          organization.id,
          false
        )
      ).toEqual(result)
    })

    it('should find one paymentGroup by organization and livemode with shareId', async () => {
      const result = paymentGroup
      prisma.client.paymentGroup.findUnique.mockResolvedValueOnce(null)
      prisma.client.paymentGroup.findUnique.mockResolvedValueOnce(paymentGroup)

      expect(
        await service.findOneByOrganizationIdAndLivemode(
          paymentGroup.shareId,
          organization.id,
          false
        )
      ).toEqual(result)
    })
  })

  describe('findOne', () => {
    it('should find one paymentGroup', async () => {
      const result = paymentGroup
      prisma.client.paymentGroup.findUnique.mockResolvedValue(paymentGroup)

      expect(await service.findOne(paymentGroup.id)).toEqual(result)
    })

    it('should find one paymentGroup by organization and livemode with shareId', async () => {
      const result = paymentGroup
      prisma.client.paymentGroup.findUnique.mockResolvedValueOnce(null)
      prisma.client.paymentGroup.findUnique.mockResolvedValueOnce(paymentGroup)

      expect(await service.findOne(paymentGroup.shareId)).toEqual(result)
    })
  })

  describe('update', () => {
    it('should update a paymentGroup', async () => {
      const result = paymentGroup
      prisma.client.paymentGroup.update.mockResolvedValue(paymentGroup)

      expect(
        await service.update(paymentGroup.id, organization.id, false, {
          metadata: { foo: 'bar' },
        })
      ).toEqual(result)
    })
  })

  describe('cancel', () => {
    it('should cancel a paymentGroup', async () => {
      const result = paymentGroup
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(paymentGroup)
      prisma.client.paymentGroup.update.mockResolvedValue(paymentGroup)

      expect(
        await service.cancel(paymentGroup.id, organization.id, false)
      ).toEqual(result)
    })
  })

  describe('expire', () => {
    it('should expire a paymentGroup', async () => {
      const result = paymentGroup
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(paymentGroup)
      prisma.client.paymentGroup.update.mockResolvedValue(paymentGroup)

      expect(
        await service.cancel(paymentGroup.id, organization.id, false)
      ).toEqual(result)
    })
  })

  describe('complete', () => {
    it('should complete a paymentGroup', async () => {
      const result = paymentGroup
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(paymentGroup)
      prisma.client.paymentGroup.update.mockResolvedValue(paymentGroup)

      expect(
        await service.cancel(paymentGroup.id, organization.id, false)
      ).toEqual(result)
    })
  })

  describe('process', () => {
    it('should process the process of a paymentGroup', async () => {
      const newPaymentGroupSettings =
        createPaymentGroupSettings() as Prisma.PaymentGroupSettingsGetPayload<{
          include: {
            discountLevels: true
          }
        }>
      newPaymentGroupSettings.discountLevels = []
      jest.spyOn(service, 'findOne').mockResolvedValue(paymentGroup)
      jest
        .spyOn(
          paymentGroupSettingsService,
          'findOneByPaymentGroupIdAndLivemode'
        )
        .mockResolvedValue(newPaymentGroupSettings)

      jest.spyOn(service, 'expire').mockResolvedValue(paymentGroup)

      await expect(service.process(paymentGroup.id)).resolves.not.toThrow()
    })
  })

  describe('join', () => {
    it('should join a paymentGroup', async () => {
      paymentGroup.status = PaymentGroupStatus.OPEN
      const newPaymentIntent =
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            customer: true
            organization: true
          }
        }>
      newPaymentIntent.customer = customer
      newPaymentIntent.organization = organization
      const owner = createCustomer()
      const result = paymentGroup
      jest.spyOn(service, 'findOne').mockResolvedValue(paymentGroup)

      jest
        .spyOn(paymentIntentsService, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(newPaymentIntent)

      jest
        .spyOn(service, 'deprecatedGetParticipants')
        .mockResolvedValue({ data: [newPaymentIntent], count: 1 })

      jest
        .spyOn(customersService, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(owner)

      jest
        .spyOn(paymentIntentsService, 'update')
        .mockResolvedValue(newPaymentIntent)

      jest.spyOn(configService, 'get').mockReturnValue('localhost')

      expect(
        await service.deprecatedJoin(paymentGroup.id, paymentIntent.id)
      ).toEqual(result)
    })

    it('should fail if participant is equal or more than org config', async () => {
      const newPaymentGroup =
        createPaymentGroup() as Prisma.PaymentGroupGetPayload<{
          include: {
            paymentGroupSettings: true
          }
        }>
      paymentGroup.status = PaymentGroupStatus.OPEN
      const newPaymentIntent =
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            organization: true
          }
        }>
      newPaymentGroup.paymentGroupSettings = createPaymentGroupSettings()
      newPaymentGroup.paymentGroupSettings.maxParticipants = 1
      newPaymentIntent.organization = organization

      jest.spyOn(service, 'findOne').mockResolvedValue(paymentGroup)

      jest
        .spyOn(paymentIntentsService, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(newPaymentIntent)

      jest
        .spyOn(service, 'deprecatedGetParticipants')
        .mockResolvedValue({ data: [newPaymentIntent], count: 1 })

      await expect(
        service.deprecatedJoin(paymentGroup.id, newPaymentIntent.id)
      ).rejects.toThrow(BadRequestException)
    })

    it('should fail if paymentGroup is not OPEN', async () => {
      paymentGroup.status = PaymentGroupStatus.EXPIRED

      jest.spyOn(service, 'findOne').mockResolvedValue(paymentGroup)

      jest
        .spyOn(paymentIntentsService, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(paymentIntent)

      await expect(
        service.deprecatedJoin(paymentGroup.id, paymentIntent.id)
      ).rejects.toThrow(BadRequestException)
    })

    it('should fail if paymentIntent not found', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(paymentGroup)

      jest
        .spyOn(paymentIntentsService, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(null)

      await expect(
        service.deprecatedJoin(paymentGroup.id, paymentIntent.id)
      ).rejects.toThrow(NotFoundException)
    })

    it('should fail if paymentGroup not found', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(null)

      await expect(
        service.deprecatedJoin(paymentGroup.id, paymentIntent.id)
      ).rejects.toThrow(NotFoundException)
    })
  })
})
