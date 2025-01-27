import { faker } from '@faker-js/faker'
import { OrganizationMembership } from '@prisma/client'

import {
  ORGANIZATION_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateOrganizationMembershipDto } from '../../src/organizations/organization-memberships/dto/create-organization-membership.dto'

export const createOrganizationMembership = (
  params?: CreateOrganizationMembershipDto
) => {
  const idsService = new IdsService()
  const defaultValues: OrganizationMembership = {
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    userId: idsService.createId(USER_DATABASE_PREFIX),
    role: 'admin',
    createdAt: faker.date.past(),
    updatedAt: new Date(),
  }
  return { ...defaultValues, ...params }
}
