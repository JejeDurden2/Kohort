import { faker } from '@faker-js/faker/locale/af_ZA'
import {
  DiscountLevel,
  DiscountType,
  PaymentGroupSettings,
} from '@prisma/client'

import {
  DISCOUNT_LEVEL_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  PAYMENT_GROUP_SETTINGS_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP } from '../../src/common/constants/payment-group.constants'
import { IdsService } from '../../src/common/ids/ids.service'

export const createPaymentGroupSettings = () => {
  const idsService = new IdsService()
  const paymentGroupSettings: PaymentGroupSettings = {
    id: idsService.createId(PAYMENT_GROUP_SETTINGS_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    paymentGroupId: null,
    livemode: faker.datatype.boolean(),
    whatsappCommunication: faker.datatype.boolean(),
    discountType: DiscountType.PERCENTAGE,
    maxParticipants: faker.number.int({
      min: 1,
      max: MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP,
    }),
    minutesDuration: faker.number.int({ min: 1, max: 10080 }),
    minPurchaseValue: faker.number.int({ min: 30, max: 1000 }),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: faker.string.uuid(),
    updatedBy: faker.string.uuid(),
  }
  return paymentGroupSettings
}
export const createDiscountLevelsForPaymentGroupSettings = (
  paymentGroupSettingsId: string,
  count: number
): DiscountLevel[] => {
  return Array.from({ length: count }).map(() =>
    createDiscountLevel(paymentGroupSettingsId)
  )
}
export const createDiscountLevel = (paymentGroupSettingsId: string) => {
  const idsService = new IdsService()
  const discountLevel = {
    id: idsService.createId(DISCOUNT_LEVEL_DATABASE_PREFIX),
    paymentGroupSettingsId: paymentGroupSettingsId,
    level: faker.number.int({ min: 1, max: 5 }),
    value: faker.number.int({ min: 1, max: 100 }),
    participantsToUnlock: faker.number.int({ min: 2, max: 100 }),
    createdAt: new Date(),
  }
  return discountLevel
}
