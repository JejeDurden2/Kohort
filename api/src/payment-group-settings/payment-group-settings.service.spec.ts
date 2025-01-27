import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentGroupSettings, Prisma } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import {
  createDiscountLevel,
  createPaymentGroupSettings,
} from '../../test/factories/payment-group-settings.factory'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { PaymentGroupSettingsService } from './payment-group-settings.service'

describe('PaymentGroupSettingsService', () => {
  let service: PaymentGroupSettingsService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let paymentGroupSettings: PaymentGroupSettings

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentGroupSettingsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
      ],
    }).compile()

    service = module.get<PaymentGroupSettingsService>(
      PaymentGroupSettingsService
    )
    prisma = module.get('PrismaService')
    paymentGroupSettings = createPaymentGroupSettings()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a payment group setting', async () => {
      const result = paymentGroupSettings
      prisma.client.paymentGroupSettings.create.mockResolvedValue(result)

      expect(await service.create('orgId', true, 'userId')).toBe(result)
    })
  })

  describe('duplicateToPaymentGroup', () => {
    it('should duplicate a payment group setting and link it to a payment group', async () => {
      const result =
        paymentGroupSettings as Prisma.PaymentGroupSettingsGetPayload<{
          include: {
            discountLevels: true
          }
        }>
      result.discountLevels = []
      jest.spyOn(service, 'findOne').mockImplementation(async () => result)
      prisma.client.paymentGroupSettings.create.mockResolvedValue(result)

      expect(
        await service.duplicateToPaymentGroup('id', 'paymentGroupId', true)
      ).toBe(result)
    })
  })

  describe('findOne', () => {
    it('should return a payment group setting', async () => {
      const result = paymentGroupSettings
      prisma.client.paymentGroupSettings.findUnique.mockResolvedValue(result)

      expect(await service.findOne('id', true)).toBe(result)
    })
  })

  describe('findOneByOrganizationIdAndLivemode', () => {
    it('should return a payment group setting', async () => {
      const result = paymentGroupSettings
      prisma.client.paymentGroupSettings.findFirst.mockResolvedValue(result)

      expect(
        await service.findOneByOrganizationIdAndLivemode('orgId', true)
      ).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a payment group setting', async () => {
      const result = paymentGroupSettings
      paymentGroupSettings.organizationId = 'orgId'
      prisma.client.paymentGroupSettings.update.mockResolvedValue(result)

      expect(
        await service.update(
          paymentGroupSettings.id,
          paymentGroupSettings.livemode,
          { maxParticipants: 10 },
          paymentGroupSettings.createdBy
        )
      ).toBe(result)
    })
  })

  describe('validateDiscountLevels', () => {
    it('should validate discount levels', () => {
      const discountLevel1 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel1.level = 1
      discountLevel1.participantsToUnlock = 2
      discountLevel1.value = 5

      const discountLevel2 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel2.level = 2
      discountLevel2.participantsToUnlock = 5
      discountLevel2.value = 10

      expect(
        service.validateDiscountLevels([discountLevel1, discountLevel2])
      ).toBeUndefined()
    })

    it('should throw an error if discount level 1 does not exist', () => {
      const discountLevel1 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel1.level = 3
      discountLevel1.participantsToUnlock = 2
      discountLevel1.value = 5

      const discountLevel2 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel2.level = 4
      discountLevel2.participantsToUnlock = 5
      discountLevel2.value = 10

      expect(() =>
        service.validateDiscountLevels([discountLevel1, discountLevel2])
      ).toThrowError()
    })

    it('should throw an error if discount level 1 does not have 2 participants', () => {
      const discountLevel1 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel1.level = 1
      discountLevel1.participantsToUnlock = 3
      discountLevel1.value = 5

      const discountLevel2 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel2.level = 2
      discountLevel2.participantsToUnlock = 5
      discountLevel2.value = 10

      expect(() =>
        service.validateDiscountLevels([discountLevel1, discountLevel2])
      ).toThrowError()
    })

    it('should throw an error if discount levels are not in ascending order', () => {
      const discountLevel1 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel1.level = 1
      discountLevel1.participantsToUnlock = 2
      discountLevel1.value = 5

      const discountLevel2 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel2.level = 3
      discountLevel2.participantsToUnlock = 5
      discountLevel2.value = 10

      expect(() =>
        service.validateDiscountLevels([discountLevel1, discountLevel2])
      ).toThrowError()
    })

    it('should throw an error if discount levels are not in ascending value', () => {
      const discountLevel1 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel1.level = 1
      discountLevel1.participantsToUnlock = 2
      discountLevel1.value = 11

      const discountLevel2 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel2.level = 3
      discountLevel2.participantsToUnlock = 5
      discountLevel2.value = 10

      expect(() =>
        service.validateDiscountLevels([discountLevel1, discountLevel2])
      ).toThrowError()
    })

    it('should throw an error if discount levels are not in ascending participantsToUnlock', () => {
      const discountLevel1 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel1.level = 1
      discountLevel1.participantsToUnlock = 7
      discountLevel1.value = 11

      const discountLevel2 = createDiscountLevel('pgset_039cb61d595088')
      discountLevel2.level = 3
      discountLevel2.participantsToUnlock = 5
      discountLevel2.value = 10

      expect(() =>
        service.validateDiscountLevels([discountLevel1, discountLevel2])
      ).toThrowError()
    })
  })
})
