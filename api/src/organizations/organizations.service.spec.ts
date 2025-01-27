import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiKey, Organization, User } from '@prisma/client'
import { Queue } from 'bull'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createApiKey } from '../../test/factories/api-key.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { createUser } from '../../test/factories/user.factory'
import { ApiKeysService } from '../api-keys/api-keys.service'
import { BrandSettingsService } from '../brand-settings/brand-settings.service'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { extendedPrismaClient } from '../prisma.extension'
import { StripeService } from '../stripe/stripe.service'
import { UsersService } from '../users/users.service'
import { OrganizationsService } from './organizations.service'

describe('OrganizationsService', () => {
  let service: OrganizationsService
  let apiKeysService: ApiKeysService
  let org: Organization
  let user: User
  let apiKey: ApiKey
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
        { provide: ApiKeysService, useValue: createMock<ApiKeysService>() },
        { provide: StripeService, useValue: createMock<StripeService>() },
        {
          provide: PaymentGroupSettingsService,
          useValue: createMock<PaymentGroupSettingsService>(),
        },
        {
          provide: BrandSettingsService,
          useValue: createMock<BrandSettingsService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: getQueueToken(QueueName.SETUP_ORGANIZATION),
          useValue: createMock<Queue>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
      ],
    }).compile()

    service = module.get<OrganizationsService>(OrganizationsService)
    apiKeysService = module.get<ApiKeysService>(ApiKeysService)
    prisma = module.get('PrismaService')
    org = createOrganization()
    user = createUser()
    apiKey = createApiKey()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an organization', async () => {
      const result = org
      prisma.client.organization.create.mockResolvedValueOnce(result)

      expect(
        await service.create({
          name: org.name,
          clerkId: org.clerkId,
          createdBy: user.id,
        })
      ).toBe(result)
    })
  })

  describe('createApiKeys', () => {
    it('should create 3 apiKeys', async () => {
      const spy = jest
        .spyOn(apiKeysService, 'create')
        .mockImplementation(async () => apiKey)

      await service.createApiKeys(org)

      expect(spy).toHaveBeenCalledTimes(3)
    })
  })

  describe('findOne', () => {
    it('should return one organization', async () => {
      const result = org
      prisma.client.organization.findUnique.mockResolvedValueOnce(result)

      expect(await service.findOne(org.id)).toBe(result)
    })
  })

  describe('findByClerkId', () => {
    it('should return one organization', async () => {
      const result = org
      prisma.client.organization.findUnique.mockResolvedValueOnce(result)

      expect(await service.findOne(org.clerkId)).toBe(result)
    })
  })

  describe('findOneWithDeleted', () => {
    it('should return one organization', async () => {
      org.deletedAt = new Date()
      const result = org
      prisma.client.organization.findUnique.mockResolvedValueOnce(result)

      expect(await service.findOne(org.id)).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should return an array of organizations', async () => {
      const result = [org]
      prisma.client.organization.findMany.mockResolvedValueOnce(result)

      expect(await service.findAll()).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an organization', async () => {
      const result = org
      prisma.client.organization.update.mockResolvedValueOnce(result)

      expect(await service.update(org.id, { name: org.name })).toBe(result)
    })
  })

  describe('remove', () => {
    it('should soft remove an organization', async () => {
      org.deletedAt = new Date()
      const result = org

      jest
        .spyOn(service, 'findOneWithDeleted')
        .mockImplementation(async () => null)

      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(await service.remove(org.id)).toBe(result)
    })

    it('should throw an error if already deleted', async () => {
      org.deletedAt = new Date()
      const result = org
      jest
        .spyOn(service, 'findOneWithDeleted')
        .mockImplementation(async () => result)

      await expect(service.remove(org.id)).rejects.toThrowError(
        BadRequestException
      )
    })
  })

  describe('hardRemove', () => {
    it('should hard remove an organization', async () => {
      const result = org
      prisma.client.organization.delete.mockResolvedValueOnce(result)

      expect(await service.hardRemove(org)).toBe(result)
    })
  })
})
