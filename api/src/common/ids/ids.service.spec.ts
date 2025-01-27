import { Test, TestingModule } from '@nestjs/testing'

import { IdsService } from './ids.service'

describe('OrganizationsService', () => {
  let service: IdsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdsService],
    }).compile()

    service = module.get<IdsService>(IdsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should start with org', () => {
    const prefix = 'org'
    const result = service.createId(prefix)
    expect(result).toMatch(/^org_/)
  })
})
