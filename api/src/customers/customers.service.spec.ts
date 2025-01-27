import { createMock } from '@golevelup/ts-jest'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Customer, Organization } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createCustomer } from '../../test/factories/customer.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { paginated } from '../../test/utils/paginated-format'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CustomersService } from './customers.service'

describe('CustomersService', () => {
  let service: CustomersService
  let customer: Customer
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
      ],
    }).compile()

    service = module.get<CustomersService>(CustomersService)
    prisma = module.get('PrismaService')
    customer = createCustomer()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a customer', async () => {
      const result = customer
      prisma.client.customer.create.mockResolvedValueOnce(result)

      expect(
        await service.create(organization.id, true, {
          emailAddress: customer.emailAddress,
        })
      ).toBe(result)
    })
  })

  describe('findOneByOrganizationAndLivemode', () => {
    it('should return one customer', async () => {
      const result = customer
      prisma.client.customer.findUnique.mockResolvedValueOnce(result)

      expect(
        await service.findOneByOrganizationIdAndLivemode(
          customer.id,
          organization.id,
          true
        )
      ).toBe(result)
    })
  })

  describe('findOneWithDeleted', () => {
    it('should return one customer', async () => {
      customer.deletedAt = new Date()
      const result = customer
      prisma.client.customer.findUnique.mockResolvedValueOnce(result)

      expect(
        await service.findOneByOrganizationIdAndLivemode(
          customer.id,
          organization.id,
          true
        )
      ).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const result = paginated([customer])
      prisma.client.$transaction.mockResolvedValueOnce([
        result.data,
        result.count,
      ])

      expect(
        await service.findByOrganizationIdAndLivemode(organization.id, true)
      ).toMatchObject(result)
    })
  })

  describe('update', () => {
    it('should update a customer', async () => {
      const result = customer
      prisma.client.customer.update.mockResolvedValueOnce(result)

      expect(
        await service.update(customer.id, organization.id, true, {
          emailAddress: customer.emailAddress,
        })
      ).toBe(result)
    })
  })

  describe('block', () => {
    it('should Block customer', async () => {
      const result = customer
      prisma.client.customer.update.mockResolvedValueOnce(result)

      expect(await service.block(customer.id, organization.id, true)).toBe(
        result
      )
    })
  })

  describe('unblock', () => {
    it('should unBlock customer', async () => {
      const result = customer
      prisma.client.customer.update.mockResolvedValueOnce(result)

      expect(await service.unblock(customer.id, organization.id, true)).toBe(
        result
      )
    })
  })

  describe('remove', () => {
    it('should soft remove a customer', async () => {
      customer.deletedAt = new Date()
      const result = customer

      jest
        .spyOn(service, 'findOneWithDeleted')
        .mockImplementation(async () => null)

      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(await service.remove(customer.id, organization.id, true)).toBe(
        result
      )
    })

    it('should throw an error if already deleted', async () => {
      customer.deletedAt = new Date()
      const result = customer
      jest
        .spyOn(service, 'findOneWithDeleted')
        .mockImplementation(async () => result)

      await expect(
        service.remove(customer.id, organization.id, true)
      ).rejects.toThrowError(BadRequestException)
    })
  })
})
