import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Bill, Organization } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createBill } from '../../test/factories/bill.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { paginated } from '../../test/utils/paginated-format'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { extendedPrismaClient } from '../prisma.extension'
import { StripeService } from '../stripe/stripe.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { BillsService } from './bills.service'

describe('BillingService', () => {
  let service: BillsService
  let bill: Bill
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let organization: Organization
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: StripeService,
          useValue: createMock<StripeService>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: PaymentIntentsService,
          useValue: createMock<PaymentIntentsService>(),
        },
        {
          provide: TransactionalEmailsService,
          useValue: createMock<TransactionalEmailsService>(),
        },
      ],
    }).compile()

    service = module.get<BillsService>(BillsService)
    prisma = module.get('PrismaService')
    bill = createBill()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of bills', async () => {
      const result = paginated([bill])
      prisma.client.$transaction.mockResolvedValueOnce([
        result.data,
        result.count,
      ])

      expect(
        await service.findByOrganizationIdAndLivemode(organization.id, true)
      ).toMatchObject(result)
    })
  })

  describe('findNumberOfBillsByOrganizationIdAndLivemode', () => {
    it('should return the number of bills', async () => {
      const result = 1
      prisma.client.bill.count.mockResolvedValueOnce(result)

      expect(
        await service.findNumberOfBillsByOrganizationIdAndLivemode(
          organization.id,
          true
        )
      ).toBe(result)
    })
  })
  describe('findOne', () => {
    it('should return a bill', async () => {
      const result = bill
      prisma.client.bill.findUnique.mockResolvedValueOnce(bill)

      expect(
        await service.findOne(bill.id, organization.id, true)
      ).toMatchObject(result)
    })
  })
  describe('findByOrganizationIdAndLivemode', () => {
    it('should return an array of bills', async () => {
      const result = paginated([bill])
      prisma.client.$transaction.mockResolvedValueOnce([
        result.data,
        result.count,
      ])

      expect(
        await service.findByOrganizationIdAndLivemode(organization.id, true)
      ).toMatchObject(result)
    })
    it('should return an array of bills with test mode', async () => {
      const result = paginated([bill])
      prisma.client.$transaction.mockResolvedValueOnce([
        result.data,
        result.count,
      ])

      expect(
        await service.findByOrganizationIdAndLivemode(organization.id, false)
      ).toMatchObject(result)
    })
  })
  describe('findNumberOfBillsByOrganizationIdAndLivemode', () => {
    it('should return the number of bills', async () => {
      const result = 1
      prisma.client.bill.count.mockResolvedValueOnce(result)

      expect(
        await service.findNumberOfBillsByOrganizationIdAndLivemode(
          organization.id,
          true
        )
      ).toBe(result)
    })
  })
})
