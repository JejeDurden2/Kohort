import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Customer, Organization } from '@prisma/client'

import { createCustomer } from '../../test/factories/customer.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { paginated } from '../../test/utils/paginated-format'
import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'

describe('CustomersController', () => {
  let controller: CustomersController
  let service: CustomersService
  let customer: Customer
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: createMock<CustomersService>() },
      ],
    }).compile()

    controller = module.get<CustomersController>(CustomersController)
    service = module.get<CustomersService>(CustomersService)
    customer = createCustomer()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create one customer', async () => {
      const result = customer
      jest.spyOn(service, 'create').mockImplementation(async () => result)

      expect(
        await controller.create(organization, true, {
          emailAddress: customer.emailAddress,
        })
      ).toBe(result)
    })
  })

  describe('findOne', () => {
    it('should return one customer', async () => {
      const result = customer
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(
        await controller.findOne(customer.id, organization, true, {})
      ).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const result = paginated([customer])
      jest
        .spyOn(service, 'findByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(await controller.findAll(organization, true, {})).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an customer', async () => {
      const result = customer
      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(
        await controller.update(customer.id, organization, true, {
          emailAddress: customer.emailAddress,
        })
      ).toBe(result)
    })
  })

  describe('block', () => {
    it('should block an customer', async () => {
      const result = customer
      jest.spyOn(service, 'block').mockImplementation(async () => result)

      expect(await controller.block(customer.id, organization, true)).toBe(
        result
      )
    })
  })

  describe('unblock', () => {
    it('should block an customer', async () => {
      const result = customer
      jest.spyOn(service, 'unblock').mockImplementation(async () => result)

      expect(await controller.unblock(customer.id, organization, true)).toBe(
        result
      )
    })
  })

  describe('remove', () => {
    it('should remove an customer', async () => {
      customer.deletedAt = new Date()
      const result = customer
      jest.spyOn(service, 'remove').mockImplementation(async () => result)

      expect(await controller.remove(customer.id, organization, true)).toBe(
        result
      )
    })
  })
})
