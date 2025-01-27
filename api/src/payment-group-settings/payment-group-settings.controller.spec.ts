import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentGroupSettings, Prisma, User } from '@prisma/client'

import { createPaymentGroupSettings } from '../../test/factories/payment-group-settings.factory'
import { createUser } from '../../test/factories/user.factory'
import { PaymentGroupSettingsController } from './payment-group-settings.controller'
import { PaymentGroupSettingsService } from './payment-group-settings.service'

describe('PaymentGroupSettingsController', () => {
  let controller: PaymentGroupSettingsController
  let service: PaymentGroupSettingsService
  let paymentGroupSettings: PaymentGroupSettings
  let user: User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentGroupSettingsController],
      providers: [
        {
          provide: PaymentGroupSettingsService,
          useValue: createMock<PaymentGroupSettingsService>(),
        },
      ],
    }).compile()

    controller = module.get<PaymentGroupSettingsController>(
      PaymentGroupSettingsController
    )
    service = module.get<PaymentGroupSettingsService>(
      PaymentGroupSettingsService
    )
    paymentGroupSettings = createPaymentGroupSettings()
    user = createUser()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findOne', () => {
    it('should return a payment group setting', async () => {
      const result = paymentGroupSettings
      jest.spyOn(service, 'findOne').mockImplementation(async () => result)

      expect(await controller.findOne(paymentGroupSettings.id, true, {})).toBe(
        result
      )
    })
  })

  describe('update', () => {
    it('should update a payment group setting', async () => {
      const result =
        paymentGroupSettings as Prisma.PaymentGroupSettingsGetPayload<{
          include: {
            discountLevels: true
          }
        }>
      jest.spyOn(service, 'update').mockResolvedValue(result)

      expect(
        await controller.update(
          paymentGroupSettings.id,
          true,
          {
            maxParticipants: 15,
          },
          user
        )
      ).toBe(result)
    })
  })
})
