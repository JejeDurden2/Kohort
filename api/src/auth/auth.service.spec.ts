import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiKey, Organization } from '@prisma/client'

import { createApiKey } from '../../test/factories/api-key.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { ApiKeysService } from '../api-keys/api-keys.service'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService
  let apiKeysService: ApiKeysService
  let apiKey: ApiKey
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ApiKeysService, useValue: createMock<ApiKeysService>() },
        { provide: UsersService, useValue: createMock<UsersService>() },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    apiKeysService = module.get<ApiKeysService>(ApiKeysService)
    apiKey = createApiKey()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateApiKey', () => {
    it('should validate a correct secret key', async () => {
      jest
        .spyOn(apiKeysService, 'getOrganizationFromKey')
        .mockImplementation(async () => organization)

      jest
        .spyOn(apiKeysService, 'findLiveSecretKeysByOrganizationId')
        .mockImplementation(async () => [apiKey])

      jest
        .spyOn(apiKeysService, 'findByKey')
        .mockImplementation(async () => apiKey)

      jest
        .spyOn(service, 'checkSecretKeys')
        .mockImplementation(async () => apiKey)

      expect(await service.validateApiKey(apiKey.key)).toBe(apiKey)
    })

    it('should validate a correct public key', async () => {
      jest
        .spyOn(apiKeysService, 'getOrganizationFromKey')
        .mockImplementation(async () => organization)

      jest
        .spyOn(apiKeysService, 'findByKey')
        .mockImplementation(async () => apiKey)

      expect(await service.validateApiKey(apiKey.key, true)).toBe(apiKey)
    })

    it('should validate a correct live secret key', async () => {
      jest
        .spyOn(apiKeysService, 'getOrganizationFromKey')
        .mockImplementation(async () => organization)

      jest
        .spyOn(apiKeysService, 'findByKey')
        .mockImplementation(async () => null)

      jest
        .spyOn(apiKeysService, 'findLiveSecretKeysByOrganizationId')
        .mockImplementation(async () => [apiKey])

      jest
        .spyOn(service, 'checkSecretKeys')
        .mockImplementation(async () => apiKey)

      expect(await service.validateApiKey(apiKey.key)).toBe(apiKey)
    })

    it('should not validate a incorrect live secret key', async () => {
      jest
        .spyOn(apiKeysService, 'getOrganizationFromKey')
        .mockImplementation(async () => organization)

      jest
        .spyOn(apiKeysService, 'findByKey')
        .mockImplementation(async () => null)

      jest
        .spyOn(apiKeysService, 'findLiveSecretKeysByOrganizationId')
        .mockImplementation(async () => [apiKey])

      jest
        .spyOn(service, 'checkSecretKeys')
        .mockImplementation(async () => null)

      expect(await service.validateApiKey(apiKey.key)).toBe(null)
    })

    it('should not validate an apikey with an end date in the past', async () => {
      apiKey.endDate = new Date('10/14/2021')
      jest
        .spyOn(apiKeysService, 'getOrganizationFromKey')
        .mockImplementation(async () => organization)

      jest
        .spyOn(apiKeysService, 'findByKey')
        .mockImplementation(async () => apiKey)

      expect(await service.validateApiKey(apiKey.key)).toBe(null)
    })

    it('should not validate if no organization in the secretKey', async () => {
      jest
        .spyOn(apiKeysService, 'getOrganizationFromKey')
        .mockImplementation(async () => null)
      expect(await service.validateApiKey(apiKey.key)).toBe(null)
    })

    it('should not validate if no mode prefix in the secretKey', async () => {
      apiKey.key = 'sk_jlks_jbglkjbslkg'
      expect(await service.validateApiKey(apiKey.key)).toBe(null)
    })

    it('should not validate if no sk or pk in the secretKey', async () => {
      apiKey.key = 'jl_live_glkjbslkg'
      expect(await service.validateApiKey(apiKey.key)).toBe(null)
    })

    it('should not validate if only one part in the key', async () => {
      apiKey.key = 'jlksjbglkjbslkg'
      expect(await service.validateApiKey(apiKey.key)).toBe(null)
    })
  })
})
