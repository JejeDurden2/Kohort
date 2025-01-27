import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Activity, DefaultGenerics, StreamClient } from 'getstream'
import { mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { ApiKeysService } from '../api-keys/api-keys.service'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { CustomersService } from '../customers/customers.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { extendedPrismaClient } from '../prisma.extension'
import { UsersService } from '../users/users.service'
import { GetStreamService } from './getstream.service'

describe('GetstreamService', () => {
  let service: GetStreamService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStreamService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: CustomersService,
          useValue: createMock<CustomersService>(),
        },
        { provide: UsersService, useValue: createMock<UsersService>() },
        { provide: StreamClient, useValue: createMock<StreamClient>() },
        { provide: ApiKeysService, useValue: createMock<ApiKeysService>() },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
      ],
    }).compile()

    service = module.get<GetStreamService>(GetStreamService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendActivity', () => {
    it('should send an activity', async () => {
      const result = {
        actor: SYSTEM,
        verb: 'testVerb',
        object: 'testObject',
        time: new Date().toISOString(),
      }
      jest.spyOn(service, 'getActor').mockResolvedValueOnce(SYSTEM)
      jest.spyOn(service, 'getVerb').mockReturnValue('testVerb')
      jest.spyOn(service, 'getObject').mockResolvedValueOnce(undefined)
      jest
        .spyOn(service, 'sendActivityToOrganizationFeed')
        .mockResolvedValueOnce({} as Activity<DefaultGenerics>)
      jest
        .spyOn(service, 'sendActivityToModelFeed')
        .mockResolvedValueOnce(result as Activity<DefaultGenerics>)

      expect(await service.sendActivity('test', 'test', 'test', {}, {})).toBe(
        result
      )
    })
  })
})
