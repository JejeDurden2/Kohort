import { faker } from '@faker-js/faker'
import { Bill, BillStatus, Currency } from '@prisma/client'

import {
  BILL_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'

export const createBill = () => {
  const idsService = new IdsService()

  const defaultValues: Bill = {
    id: idsService.createId(BILL_DATABASE_PREFIX),
    billId: idsService.createBillId(
      0,
      idsService.createId(ORGANIZATION_DATABASE_PREFIX),
      false
    ),
    stripeId: faker.string.uuid(),
    dueDate: faker.date.future(),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    livemode: true,
    status: BillStatus.PAID,
    amount: faker.number.int({ min: 1, max: 1000000 }),
    amountPayout: faker.number.int({ min: 1, max: 1000000 }),
    currency: Currency.EUR,
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
  }
  return defaultValues
}
