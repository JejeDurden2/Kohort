import { faker } from '@faker-js/faker'
import { LineItem, LineItemType } from '@prisma/client'

import { CreateLineItemDto } from '../../src/checkout-sessions/dto/create-line-item.dto'
import { LINE_ITEM_DATABASE_PREFIX } from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'

export const createLineItem = (params?: CreateLineItemDto) => {
  const idsService = new IdsService()

  const defaultValues: LineItem = {
    id: idsService.createId(LINE_ITEM_DATABASE_PREFIX),
    name: faker.commerce.productName(),
    price: faker.number.int({ min: 1, max: 1000000 }),
    quantity: faker.number.int({ min: 1, max: 10 }),
    amountTotal: faker.number.int({ min: 1, max: 1000000 }),
    description: faker.commerce.productDescription(),
    imageUrl: faker.image.avatar(),
    type: LineItemType.PRODUCT,
    checkoutSessionId: idsService.createCheckoutId(false),
    createdAt: faker.date.past(),
    updatedAt: new Date(),
  }

  return { ...defaultValues, ...params }
}
