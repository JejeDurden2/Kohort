import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { RequestScopedLoggerService } from '../logger/logger.service'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

describe('OrdersController', () => {
  let controller: OrdersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: createMock<OrdersService>(),
        },
        {
          provide: RequestScopedLoggerService,
          useValue: createMock<RequestScopedLoggerService>(),
        },
      ],
    }).compile()

    controller = module.get<OrdersController>(OrdersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
