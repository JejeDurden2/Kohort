import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { AmbassadorService } from '../ambassador/ambassador.service'
import { CodesService } from './codes.service'

describe('CodesService', () => {
  let service: CodesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodesService,
        {
          provide: AmbassadorService,
          useValue: createMock<AmbassadorService>(),
        },
      ],
    }).compile()

    service = module.get<CodesService>(CodesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
