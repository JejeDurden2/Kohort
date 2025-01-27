import { faker } from '@faker-js/faker'
import {
  Currency,
  PaymentIntent,
  PaymentIntentStatus,
  RiskLevel,
} from '@prisma/client'
import { randomBytes } from 'crypto'

import {
  AMBASSADOR_DATABASE_PREFIX,
  CHECKOUT_SESSION_DATABASE_PREFIX,
  CUSTOMER_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  PAYMENT_GROUP_DATABASE_PREFIX,
  PAYMENT_INTENT_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreatePaymentIntentDto } from '../../src/payment-intents/dto/create-payment-intent.dto'

export const createPaymentIntent = (params?: CreatePaymentIntentDto) => {
  const idsService = new IdsService()

  const defaultValues: PaymentIntent = {
    id: idsService.createId(PAYMENT_INTENT_DATABASE_PREFIX),
    livemode: false,
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    customerId: idsService.createId(CUSTOMER_DATABASE_PREFIX),
    customerEmail: faker.internet.email(),
    checkoutSessionId: idsService.createId(CHECKOUT_SESSION_DATABASE_PREFIX),
    paymentGroupId: idsService.createId(PAYMENT_GROUP_DATABASE_PREFIX),
    amount: faker.number.int({ min: 1, max: 1000000 }),
    amountCaptured: faker.number.int({ min: 1, max: 1000000 }),
    amountCashback: faker.number.int({ min: 1, max: 1000000 }),
    ambassadorId: idsService.createId(AMBASSADOR_DATABASE_PREFIX),
    status: PaymentIntentStatus.SUCCEEDED,
    applicationFeeAmount: faker.number.int({ min: 1, max: 1000000 }),
    riskLevel: RiskLevel.LOW,
    clientReferenceId: faker.string.uuid(),
    token: randomBytes(32).toString('hex'),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    canceledAt: null,
    currency: Currency.EUR,
    metadata: null,
  }

  return { ...defaultValues, ...params }
}
