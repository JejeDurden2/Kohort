import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization, PaymentGroup } from '@prisma/client'

import { createOrganization } from '../../test/factories/organization.factory'
import { createPaymentGroup } from '../../test/factories/payment-group.factory'
import { CodesService } from '../codes/codes.service'
import { OrdersService } from '../orders/orders.service'
import { PaymentGroupsController } from './payment-groups.controller'
import { PaymentGroupsService } from './payment-groups.service'

describe('PaymentGroupsController', () => {
  let controller: PaymentGroupsController
  let service: PaymentGroupsService
  let paymentGroup: PaymentGroup
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentGroupsController],
      providers: [
        {
          provide: PaymentGroupsService,
          useValue: createMock<PaymentGroupsService>(),
        },
        {
          provide: OrdersService,
          useValue: createMock<OrdersService>(),
        },
        {
          provide: CodesService,
          useValue: createMock<CodesService>(),
        },
      ],
    }).compile()

    controller = module.get<PaymentGroupsController>(PaymentGroupsController)
    service = module.get<PaymentGroupsService>(PaymentGroupsService)
    paymentGroup = createPaymentGroup()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a paymentGroup', async () => {
      const result = paymentGroup
      jest.spyOn(service, 'create').mockImplementation(async () => result)

      expect(
        await controller.create(organization, false, {
          customerId: paymentGroup.customerId,
          paymentIntentId: 'pi_123',
        })
      ).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should find all paymentGroups by organization and livemode', async () => {
      const result = { data: [paymentGroup], count: 1 }
      jest
        .spyOn(service, 'findAllByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(await controller.findAll(organization, false, {})).toBe(result)
    })
  })

  describe('findOne', () => {
    it('should find a paymentGroup by id', async () => {
      const result = paymentGroup
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(
        await controller.findOne(paymentGroup.id, organization, false, {})
      ).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a paymentGroup', async () => {
      const result = paymentGroup
      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(
        await controller.update(paymentGroup.id, organization, false, {
          metadata: { foo: 'bar' },
        })
      ).toBe(result)
    })
  })

  describe('cancel', () => {
    it('should cancel a paymentGroup', async () => {
      const result = paymentGroup
      jest.spyOn(service, 'cancel').mockImplementation(async () => result)

      expect(
        await controller.cancel(paymentGroup.id, organization, false)
      ).toBe(result)
    })
  })
})
