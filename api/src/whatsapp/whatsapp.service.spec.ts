import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { DefaultScopedLoggerService } from '../logger/logger.service'
import { WhatsappService } from './whatsapp.service'

describe('WhatsappService', () => {
  let service: WhatsappService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WhatsappService,
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

    service = module.get<WhatsappService>(WhatsappService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
