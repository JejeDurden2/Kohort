import { createMock } from '@golevelup/ts-jest'
import { Client } from '@hubspot/api-client'
import { getQueueToken } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bull'

import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { HubspotService } from './hubspot.service'

describe('HubspotService', () => {
  let service: HubspotService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HubspotService,
        {
          provide: 'Client',
          useValue: {},
        },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: Client, useValue: createMock<Client>() },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: getQueueToken(QueueName.HUBSPOT),
          useValue: createMock<Queue>(),
        },
      ],
    }).compile()

    service = module.get<HubspotService>(HubspotService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
