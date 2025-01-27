import { faker } from '@faker-js/faker'
import {
  PaymentGroupStatus,
  Prisma,
  ReminderEmailSentStatus,
} from '@prisma/client'

import {
  CUSTOMER_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  PAYMENT_INTENT_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreatePaymentGroupDto } from '../../src/payment-groups/dto/create-payment-group.dto'
import { createPaymentIntent } from '../factories/payment-intent.factory'
import { createOrder } from './order.factory'
import {
  createDiscountLevel,
  createPaymentGroupSettings,
} from './payment-group-settings.factory'

export const createPaymentGroup = (params?: CreatePaymentGroupDto) => {
  const idsService = new IdsService()
  const paymentGroupSettings = createPaymentGroupSettings()

  const defaultValues: Prisma.PaymentGroupGetPayload<{
    include: {
      paymentIntents: true
      orders: true
      paymentGroupSettings: {
        include: {
          discountLevels: true
        }
      }
    }
  }> = {
    id: idsService.createId(PAYMENT_INTENT_DATABASE_PREFIX),
    shareId: idsService.createPaymentGroupShareId(false),
    livemode: false,
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    customerId: idsService.createId(CUSTOMER_DATABASE_PREFIX),
    paymentIntents: [createPaymentIntent()],
    orders: [createOrder()],
    paymentGroupSettings: {
      ...paymentGroupSettings,
      discountLevels: [createDiscountLevel(paymentGroupSettings.id)],
    },
    creatorEmail: faker.internet.email(),
    status: PaymentGroupStatus.OPEN,
    metadata: null,
    reminderEmailSent: ReminderEmailSentStatus.NOT_SENT,
    expiresAt: faker.date.future(),
    midExpireAt: faker.date.future(),
    jMinus2ExpireAt: faker.date.future(),
    jPlus3StartAt: faker.date.future(),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    canceledAt: null,
    completedAt: null,
  }

  return { ...defaultValues, ...params }
}
