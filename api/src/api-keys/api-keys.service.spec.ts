import { createMock } from '@golevelup/ts-jest'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiKey, ApiKeyType, Organization } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createApiKey } from '../../test/factories/api-key.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { extendedPrismaClient } from '../prisma.extension'
import { ApiKeysService } from './api-keys.service'

describe('ApiKeysService', () => {
  let service: ApiKeysService
  let organizationsService: OrganizationsService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let apiKey: ApiKey
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
      ],
    }).compile()

    service = module.get<ApiKeysService>(ApiKeysService)
    organizationsService =
      module.get<OrganizationsService>(OrganizationsService)

    prisma = module.get('PrismaService')
    apiKey = createApiKey()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an apiKey', async () => {
      // eslint-disable-next-line
      const { key, ...result } = apiKey
      prisma.client.apiKey.create.mockResolvedValueOnce(apiKey)

      expect(
        await service.create(apiKey.organizationId, apiKey.livemode, {
          name: apiKey.name,
          type: apiKey.type,
        })
      ).toMatchObject(result)
    })
  })

  describe('findOne', () => {
    it('should return one apiKey', async () => {
      const result = apiKey
      prisma.client.apiKey.findUnique.mockResolvedValueOnce(result)

      expect(
        await service.findOneByOrganizationIdAndLivemode(
          apiKey.id,
          apiKey.organizationId,
          false
        )
      ).toBe(result)
    })
  })

  describe('update', () => {
    it('should update one apiKey', async () => {
      apiKey.type = ApiKeyType.SECRET
      apiKey.livemode = true
      const result = apiKey

      prisma.client.apiKey.update.mockResolvedValue(result)

      expect(await service.update(apiKey.id, { name: 'toto' })).toBe(result)
    })
  })

  describe('getLivemodeFromKey', () => {
    it('should return livemode', async () => {
      const result = apiKey.livemode
      expect(service.getLivemodeFromKey(apiKey.key)).toBe(result)
    })

    it('should fail if apiKey has wrong format', async () => {
      await expect(service.getOrganizationFromKey('wrong_key')).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('getOrganizationFromKey', () => {
    it('should return one apiKey', async () => {
      const result = organization

      jest
        .spyOn(organizationsService, 'findOne')
        .mockImplementation(async () => organization)

      expect(await service.getOrganizationFromKey(apiKey.key)).toBe(result)
    })

    it('should fail if apiKey has wrong format', async () => {
      jest
        .spyOn(organizationsService, 'findOne')
        .mockImplementation(async () => organization)

      await expect(service.getOrganizationFromKey('wrong_key')).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('findByKey', () => {
    it('should return one apiKey', async () => {
      const result = apiKey
      prisma.client.apiKey.findFirst.mockResolvedValueOnce(result)

      expect(await service.findByKey(apiKey.id)).toBe(result)
    })
  })

  describe('findByOrganizationId', () => {
    it('should return an array of apiKeys', async () => {
      const result = [apiKey]
      prisma.client.apiKey.findMany.mockResolvedValueOnce(result)

      expect(
        await service.findByOrganizationId(apiKey.organizationId, true)
      ).toBe(result)
    })
  })

  describe('findLiveSecretKeysByOrganizationId', () => {
    it('should return an array of apiKeys', async () => {
      const result = [apiKey]
      prisma.client.apiKey.findMany.mockResolvedValueOnce(result)

      expect(
        await service.findLiveSecretKeysByOrganizationId(apiKey.organizationId)
      ).toBe(result)
    })
  })

  describe('hardRemove', () => {
    it('should hard remove an apiKey', async () => {
      apiKey.type = ApiKeyType.SECRET
      apiKey.livemode = true
      const result = apiKey

      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)
      prisma.client.$transaction.mockResolvedValue(apiKey)

      expect(
        await service.hardRemove(apiKey.id, apiKey.organizationId, false)
      ).toBe(result)
    })

    it('should throw an error if last remaining secret key', async () => {
      apiKey.type = ApiKeyType.SECRET
      apiKey.livemode = true

      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)
      prisma.client.$transaction.mockRejectedValueOnce(
        new BadRequestException()
      )

      await expect(
        service.hardRemove(apiKey.id, apiKey.organizationId, false)
      ).rejects.toThrow(BadRequestException)
    })
  })
})
