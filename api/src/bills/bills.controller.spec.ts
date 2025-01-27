import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Bill, Organization } from '@prisma/client'

import { createBill } from '../../test/factories/bill.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { paginated } from '../../test/utils/paginated-format'
import { BillsController } from './bills.controller'
import { BillsService } from './bills.service'

describe('BillingController', () => {
  let controller: BillsController
  let service: BillsService
  let bill: Bill
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillsController],
      providers: [
        { provide: BillsService, useValue: createMock<BillsService>() },
      ],
    }).compile()

    controller = module.get<BillsController>(BillsController)
    service = module.get<BillsService>(BillsService)
    bill = createBill()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of bills', async () => {
      const result = paginated([bill])
      jest
        .spyOn(service, 'findByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(await controller.findAll(organization, true, {})).toBe(result)
    })
  })
})
