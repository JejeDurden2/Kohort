import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { TransactionalEmail } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createTransactionalEmail } from '../../test/factories/transactional-email.factory'
import { IdsService } from '../common/ids/ids.service'
import { EmailsService } from '../email/emails.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { extendedPrismaClient } from '../prisma.extension'
import { TransactionalEmailsService } from './transactional-emails.service'

describe('EmailsService', () => {
  let service: TransactionalEmailsService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let transactionalEmail: TransactionalEmail

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionalEmailsService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: EmailsService,
          useValue: createMock<EmailsService>(),
        },
      ],
    }).compile()

    service = module.get<TransactionalEmailsService>(TransactionalEmailsService)
    transactionalEmail = createTransactionalEmail()
    prisma = module.get('PrismaService')
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a transactional email', async () => {
      const result = transactionalEmail
      transactionalEmail.organizationId = null

      jest.spyOn(service, 'findOne').mockResolvedValue(transactionalEmail)

      prisma.client.transactionalEmail.create.mockResolvedValueOnce(result)

      expect(
        await service.create(
          transactionalEmail.organizationId || 'organizationId',
          true,
          transactionalEmail.id
        )
      ).toBe(result)
    })
  })
})
