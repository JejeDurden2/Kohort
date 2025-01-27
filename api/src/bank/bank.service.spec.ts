import { createMock } from '@golevelup/ts-jest'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosResponse } from 'axios'
import { of } from 'rxjs'

import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersService } from '../orders/orders.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { BankService } from './bank.service'

describe('BankService', () => {
  let service: BankService
  let configService: ConfigService
  let httpService: HttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: PaymentIntentsService,
          useValue: createMock<PaymentIntentsService>(),
        },
        {
          provide: OrdersService,
          useValue: createMock<OrdersService>(),
        },
        {
          provide: EventEmitter2,
          useValue: createMock<EventEmitter2>(),
        },
      ],
    }).compile()

    service = module.get<BankService>(BankService)
    configService = module.get<ConfigService>(ConfigService)
    httpService = module.get<HttpService>(HttpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('refreshAccessToken', () => {
    it('should retrieve the access token', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: AxiosResponse<any> = {
        data: { access_token: 'access_token' },
        headers: {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: createMock<any>(),
        status: 200,
        statusText: 'OK',
      }

      jest.spyOn(configService, 'get').mockReturnValue('toto')

      jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response))

      expect(await service.refreshAccessToken()).toEqual(
        response.data.access_token
      )
    })
  })
})
