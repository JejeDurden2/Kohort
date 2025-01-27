import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { DefaultScopedLoggerService } from '../logger/logger.service'
import { EmailsService } from './emails.service'

describe('EmailsService', () => {
  let service: EmailsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EmailsService,
          useValue: {
            send: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
      ],
    }).compile()

    service = module.get<EmailsService>(EmailsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
