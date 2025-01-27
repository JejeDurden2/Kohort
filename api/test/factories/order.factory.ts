import { faker } from '@faker-js/faker'
import {
  Currency,
  Locale,
  Order,
  OrderStatus,
  RiskLevel,
} from '@prisma/client'
import { randomBytes } from 'crypto'

import {
  CUSTOMER_DATABASE_PREFIX,
  ORDER_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  PAYMENT_GROUP_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateOrderDto } from '../../src/orders/dto/create-order.dto'

export const createOrder = (params?: CreateOrderDto) => {
  const idsService = new IdsService()

  const defaultValues: Order = {
    id: idsService.createId(ORDER_DATABASE_PREFIX),
    livemode: false,
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    customerId: idsService.createId(CUSTOMER_DATABASE_PREFIX),
    paymentGroupId: idsService.createId(PAYMENT_GROUP_DATABASE_PREFIX),
    amount: faker.number.int({ min: 1, max: 1000000 }),
    amountCashback: faker.number.int({ min: 1, max: 1000000 }),
    status: OrderStatus.CREATED,
    customerEmail: null,
    customerFirstName: null,
    customerLastName: null,
    ambassadorId: null,
    customerPhoneNumber: null,
    paymentGroupShareId: null,
    clientReferenceId: faker.string.uuid(),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    locale: Locale.fr_FR,
    currency: Currency.EUR,
    metadata: null,
    token: randomBytes(32).toString('hex'),
    applicationFeeAmount: faker.number.int({ min: 1, max: 1000000 }),
    riskLevel: RiskLevel.LOW,
  }

  return { ...defaultValues, ...params }
}
