import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Customer, PaymentGroup, Prisma, RiskLevel } from '@prisma/client'

import { createCustomer } from '../../test/factories/customer.factory'
import { createOrder } from '../../test/factories/order.factory'
import { createPaymentGroup } from '../../test/factories/payment-group.factory'
import { createPaymentIntent } from '../../test/factories/payment-intent.factory'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersService } from '../orders/orders.service'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { SlackService } from '../slack/slack.service'
import { FraudService } from './fraud.service'

describe('FraudService', () => {
  let service: FraudService
  let paymentGroupsService: PaymentGroupsService
  let order: Prisma.OrderGetPayload<{
    include: {
      paymentGroup: true
      customer: true
      organization: true
    }
  }>
  let customer: Customer
  let paymentGroup: PaymentGroup

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudService,
        {
          provide: OrdersService,
          useValue: createMock<OrdersService>(),
        },
        {
          provide: SlackService,
          useValue: createMock<SlackService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: PaymentGroupsService,
          useValue: createMock<PaymentGroupsService>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
      ],
    }).compile()

    service = module.get<FraudService>(FraudService)
    paymentGroupsService =
      module.get<PaymentGroupsService>(PaymentGroupsService)
    order = createOrder() as Prisma.OrderGetPayload<{
      include: {
        paymentGroup: true
        customer: true
        organization: true
      }
    }>
    customer = createCustomer()
    paymentGroup = createPaymentGroup()
    order.paymentGroup = paymentGroup
    order.customer = customer
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('evaluateKohortPayRiskLevel', () => {
    it('should return LOW for a payment without group', async () => {
      order.paymentGroup = null
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.LOW
      )
    })

    it('should return LOW for a payment without customer', async () => {
      order.customer = null
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.LOW
      )
    })

    it('should return HIGHEST for a payment with similar name in group', async () => {
      const paymentIntentsWithCustomer = [
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            customer: true
          }
        }>,
      ]
      jest
        .spyOn(paymentGroupsService, 'getCustomers')
        .mockResolvedValue(paymentIntentsWithCustomer)
      jest.spyOn(service, 'hasSimilarNameInGroup').mockResolvedValue(true)
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.HIGHEST
      )
    })

    it('should return HIGH for a payment with similar phone number in group', async () => {
      const paymentIntentsWithCustomer = [
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            customer: true
          }
        }>,
      ]
      jest
        .spyOn(paymentGroupsService, 'getCustomers')
        .mockResolvedValue(paymentIntentsWithCustomer)
      jest.spyOn(service, 'hasSimilarNameInGroup').mockResolvedValue(false)
      jest
        .spyOn(service, 'hasSimilarPhoneNumberInGroup')
        .mockResolvedValue(true)
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.HIGH
      )
    })

    it('should return HIGH for a payment with similar email in group', async () => {
      const paymentIntentsWithCustomer = [
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            customer: true
          }
        }>,
      ]
      jest
        .spyOn(paymentGroupsService, 'getCustomers')
        .mockResolvedValue(paymentIntentsWithCustomer)
      jest.spyOn(service, 'hasSimilarNameInGroup').mockResolvedValue(false)
      jest
        .spyOn(service, 'hasSimilarPhoneNumberInGroup')
        .mockResolvedValue(false)
      jest.spyOn(service, 'hasSimilarEmailInGroup').mockResolvedValue(true)
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.HIGH
      )
    })

    it('should return MEDIUM for a payment with similar domain in group', async () => {
      const paymentIntentsWithCustomer = [
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            customer: true
          }
        }>,
      ]
      jest
        .spyOn(paymentGroupsService, 'getCustomers')
        .mockResolvedValue(paymentIntentsWithCustomer)
      jest.spyOn(service, 'hasSimilarNameInGroup').mockResolvedValue(false)
      jest
        .spyOn(service, 'hasSimilarPhoneNumberInGroup')
        .mockResolvedValue(false)
      jest.spyOn(service, 'hasSimilarEmailInGroup').mockResolvedValue(false)
      jest.spyOn(service, 'hasSameDomainNameInGroup').mockResolvedValue(true)
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.MEDIUM
      )
    })

    it('should return LOW for a payment without risks', async () => {
      const paymentIntentsWithCustomer = [
        createPaymentIntent() as Prisma.PaymentIntentGetPayload<{
          include: {
            customer: true
          }
        }>,
      ]
      jest
        .spyOn(paymentGroupsService, 'getCustomers')
        .mockResolvedValue(paymentIntentsWithCustomer)
      jest.spyOn(service, 'hasSimilarNameInGroup').mockResolvedValue(false)
      jest
        .spyOn(service, 'hasSimilarPhoneNumberInGroup')
        .mockResolvedValue(false)
      jest.spyOn(service, 'hasSimilarEmailInGroup').mockResolvedValue(false)
      jest.spyOn(service, 'hasSameDomainNameInGroup').mockResolvedValue(false)
      expect(await service.evaluateKohortPayRiskLevel(order)).toBe(
        RiskLevel.LOW
      )
    })
  })
})
