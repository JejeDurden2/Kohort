import { faker } from '@faker-js/faker'
import { Organization } from '@prisma/client'

import {
  ADDRESS_DATABASE_PREFIX,
  DATABASE_PREFIX_SEPARATOR,
  ORGANIZATION_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { DEFAULT_KOHORT_ACQUISITION_FEES } from '../../src/common/constants/fees.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateOrganizationDto } from '../../src/organizations/dto/create-organization.dto'

export const createOrganization = (params?: CreateOrganizationDto) => {
  const idsService = new IdsService()
  const defaultValues: Organization = {
    id: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    name: faker.company.name(),
    clerkId: faker.string.uuid(),
    cashbackBankId: faker.string.uuid(),
    stripeCustomerId: faker.string.uuid(),
    ambassadorEnabled: faker.datatype.boolean(),
    slug: faker.company.name(),
    addressId: idsService.createId(ADDRESS_DATABASE_PREFIX),
    websiteUrl: faker.internet.url(),
    fromEmailName: faker.string.uuid(),
    billingEmails: [faker.internet.email()],
    kohortAcquisitionFees: DEFAULT_KOHORT_ACQUISITION_FEES,
    imageUrl: faker.image.avatar(),
    svixApplicationId: faker.string.uuid(),
    createdAt: faker.date.past(),
    createdBy: `${USER_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}${faker.string.uuid()}`,
    deletedAt: null,
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
  }
  return { ...defaultValues, ...params }
}
