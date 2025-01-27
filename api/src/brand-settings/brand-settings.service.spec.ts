import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { BrandSettings } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createBrandSettings } from '../../test/factories/brand-settings.factory'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { BrandSettingsService } from './brand-settings.service'

describe('BrandSettingsService', () => {
  let service: BrandSettingsService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let BrandSettings: BrandSettings

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandSettingsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
      ],
    }).compile()

    service = module.get<BrandSettingsService>(BrandSettingsService)
    prisma = module.get('PrismaService')
    BrandSettings = createBrandSettings()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a checkout setting', async () => {
      const result = BrandSettings
      prisma.client.brandSettings.create.mockResolvedValue(result)

      expect(await service.create('orgId', true, 'userId')).toBe(result)
    })
  })

  describe('findOneByOrganizationIdAndLivemode', () => {
    it('should return a payment group setting', async () => {
      const result = BrandSettings
      prisma.client.brandSettings.findFirst.mockResolvedValue(result)

      expect(
        await service.findOneByOrganizationIdAndLivemode('orgId', true)
      ).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a checkout setting', async () => {
      const result = BrandSettings
      prisma.client.brandSettings.update.mockResolvedValue(result)
      expect(
        await service.update(
          'orgId',
          true,
          {
            backgroundUrl: 'https://avatars.githubusercontent.com/u/97165289',
          },
          'userId'
        )
      ).toBe(result)
    })
  })
})
