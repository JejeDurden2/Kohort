import { createMock } from '@golevelup/ts-jest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiKey, ApiKeyType, Organization } from '@prisma/client'

import { createApiKey } from '../../test/factories/api-key.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import {
  DefaultScopedLoggerService,
  RequestScopedLoggerService,
} from '../logger/logger.service'
import { ApiKeysController } from './api-keys.controller'
import { ApiKeysService } from './api-keys.service'

describe('ApiKeysController', () => {
  let controller: ApiKeysController
  let service: ApiKeysService
  let apiKey: ApiKey
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [
        { provide: ApiKeysService, useValue: createMock<ApiKeysService>() },
        {
          provide: RequestScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
      ],
    }).compile()

    controller = module.get<ApiKeysController>(ApiKeysController)
    service = module.get<ApiKeysService>(ApiKeysService)
    apiKey = createApiKey()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('remove', () => {
    it('should remove an apiKey', async () => {
      const result = apiKey
      apiKey.organizationId = organization.id
      apiKey.type = ApiKeyType.SECRET
      apiKey.livemode = true
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)
      jest.spyOn(service, 'hardRemove').mockImplementation(async () => result)

      expect(await controller.remove(organization, true, apiKey.id)).toBe(
        result
      )
    })

    it('should throw an error if the livemode is false', async () => {
      await expect(
        controller.remove(organization, false, apiKey.id)
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw an error if the org id of the apiKey is different from organization.id', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)

      await expect(
        controller.remove(organization, true, apiKey.id)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update an apiKey', async () => {
      apiKey.organizationId = organization.id
      const result = apiKey
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)
      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(
        await controller.update(organization, true, apiKey.id, {
          name: 'test',
        })
      ).toBe(result)
    })

    it('should throw an error if the livemode is false', async () => {
      await expect(
        controller.update(organization, false, apiKey.id, {
          name: 'test',
        })
      ).rejects.toThrowError(BadRequestException)
    })

    it('should throw an error if the apiKey is null', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => null)

      await expect(
        controller.update(organization, true, apiKey.id, {
          name: 'test',
        })
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if the livemode is true and the type is secret', async () => {
      apiKey.type = 'SECRET'
      apiKey.livemode = true
      apiKey.organizationId = organization.id
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)

      await expect(
        controller.update(organization, true, apiKey.id, {
          name: 'test',
        })
      ).rejects.toThrowError(BadRequestException)
    })

    it('should throw an error if the org id of the apiKey is different from organization.id', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)

      expect(
        controller.update(organization, true, apiKey.id, {
          name: 'test',
        })
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('findOne', () => {
    it('should return an apiKey', async () => {
      apiKey.organizationId = organization.id
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)

      expect(await controller.findOne(organization, false, apiKey.id)).toBe(
        apiKey
      )
    })

    it('should throw an error if the apiKey is null', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => null)

      await expect(
        controller.findOne(organization, false, apiKey.id)
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if the org id of the apiKey is different from organization.id', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)

      await expect(
        controller.findOne(organization, false, apiKey.id)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('should return an array of apiKeys', async () => {
      const result = [apiKey]
      jest
        .spyOn(service, 'findByOrganizationId')
        .mockImplementation(async () => result)

      expect(await controller.findAll(organization, true)).toBe(result)
    })
  })

  describe('create', () => {
    it('should create an apiKey', async () => {
      const result = apiKey
      jest.spyOn(service, 'create').mockImplementation(async () => result)

      expect(
        await controller.create(organization, true, {
          name: 'test',
          type: ApiKeyType.PUBLIC,
        })
      ).toBe(result)
    })

    it('should throw an error if the livemode is false', async () => {
      await expect(
        controller.create(organization, false, {
          name: 'test',
          type: ApiKeyType.PUBLIC,
        })
      ).rejects.toThrowError(BadRequestException)
    })
  })

  describe('roll', () => {
    it('should roll an apiKey', async () => {
      const newKey = createApiKey()
      apiKey.organizationId = organization.id
      const result = newKey
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)
      jest.spyOn(service, 'roll').mockImplementation(async () => newKey)

      expect(await controller.roll(organization, true, apiKey.id)).toBe(result)
    })

    it('should throw an error if the apiKey is null', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => null)

      await expect(
        controller.roll(organization, true, apiKey.id)
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if the org id of the apiKey is different from organization.id', async () => {
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => apiKey)

      await expect(
        controller.roll(organization, true, apiKey.id)
      ).rejects.toThrowError(NotFoundException)
    })
  })
})
