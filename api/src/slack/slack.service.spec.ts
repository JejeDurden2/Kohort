import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { DefaultScopedLoggerService } from '../logger/logger.service'
import { SlackService } from './slack.service'

describe('SlackService', () => {
  let service: SlackService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SlackService,
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

    service = module.get<SlackService>(SlackService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
