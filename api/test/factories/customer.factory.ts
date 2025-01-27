import { faker } from '@faker-js/faker'
import { Customer, Locale } from '@prisma/client'

import {
  CUSTOMER_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateCustomerDto } from '../../src/customers/dto/create-customer.dto'

export const createCustomer = (params?: CreateCustomerDto) => {
  const idsService = new IdsService()

  const defaultValues: Customer = {
    id: idsService.createId(CUSTOMER_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    emailAddress: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number(),
    isBlocked: false,
    metadata: null,
    clientReferenceId: faker.string.uuid(),
    livemode: true,
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    blockedAt: null,
    blockedBy: null,
    locale: Locale.fr_FR,
    deletedAt: null,
  }
  return { ...defaultValues, ...params }
}
