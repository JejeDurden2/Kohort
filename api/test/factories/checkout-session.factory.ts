import { faker } from '@faker-js/faker'
import {
  CheckoutSession,
  CheckoutSessionStatus,
  Currency,
  Locale,
} from '@prisma/client'

import { CreateCheckoutSessionDto } from '../../src/checkout-sessions/dto/create-checkout-session.dto'
import {
  CHECKOUT_SESSION_DATABASE_PREFIX,
  CUSTOMER_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { createLineItem } from './line-items.factory'

export const createCheckoutSession = (params?: CreateCheckoutSessionDto) => {
  const idsService = new IdsService()

  const defaultValues: CheckoutSession = {
    id: idsService.createId(CHECKOUT_SESSION_DATABASE_PREFIX),
    shareId: idsService.createCheckoutId(false),
    livemode: false,
    url: faker.internet.url(),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    customerId: idsService.createId(CUSTOMER_DATABASE_PREFIX),
    successUrl: faker.internet.url(),
    cancelUrl: faker.internet.url(),
    amountTotal: faker.number.int({ min: 1, max: 1000000 }),
    status: CheckoutSessionStatus.OPEN,
    customerEmail: null,
    customerFirstName: null,
    customerLastName: null,
    customerPhoneNumber: null,
    paymentGroupShareId: null,
    clientReferenceId: faker.string.uuid(),
    paymentClientReferenceId: faker.string.uuid(),
    expiresAt: faker.date.future(),
    completedAt: null,
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    locale: Locale.fr_FR,
    currency: Currency.EUR,
    metadata: null,
  }
  const lineItem = createLineItem()
  lineItem.checkoutSessionId = defaultValues.id

  return { ...defaultValues, ...params }
}
