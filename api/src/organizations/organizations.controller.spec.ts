import { createMock } from '@golevelup/ts-jest'
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization, User } from '@prisma/client'

import { createOrganization } from '../../test/factories/organization.factory'
import { createUser } from '../../test/factories/user.factory'
import { BankService } from '../bank/bank.service'
import { BrandSettingsService } from '../brand-settings/brand-settings.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { OrganizationsController } from './organizations.controller'
import { OrganizationsService } from './organizations.service'

describe('OrganizationsController', () => {
  let controller: OrganizationsController
  let service: OrganizationsService
  let org: Organization
  let user: User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: PaymentGroupSettingsService,
          useValue: createMock<PaymentGroupSettingsService>(),
        },
        {
          provide: BrandSettingsService,
          useValue: createMock<BrandSettingsService>(),
        },
        {
          provide: BankService,
          useValue: createMock<BankService>(),
        },
      ],
    }).compile()

    controller = module.get<OrganizationsController>(OrganizationsController)
    service = module.get<OrganizationsService>(OrganizationsService)
    org = createOrganization()
    user = createUser()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findOne', () => {
    it('should return one organization', async () => {
      const result = org
      jest.spyOn(service, 'findOne').mockImplementation(async () => result)

      expect(await controller.findOne(org.id, org)).toBe(result)
    })

    it('should throw if does not find any organizations', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(async () => null)
      await expect(controller.findOne(org.id, org)).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('update', () => {
    it('should update an organization', async () => {
      const result = org
      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(
        await controller.update(org.id, org, { name: org.name }, user)
      ).toBe(result)
    })
  })
})
