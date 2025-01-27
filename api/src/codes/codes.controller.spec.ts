import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { CodesController } from './codes.controller'
import { CodesService } from './codes.service'

describe('CodesController', () => {
  let controller: CodesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodesController],
      providers: [
        {
          provide: CodesService,
          useValue: createMock<CodesService>(),
        },
        {
          provide: PaymentGroupsService,
          useValue: createMock<PaymentGroupsService>(),
        },
      ],
    }).compile()

    controller = module.get<CodesController>(CodesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
