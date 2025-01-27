import { faker } from '@faker-js/faker'
import { OrganizationInvitation } from '@prisma/client'

import {
  ORGANIZATION_DATABASE_PREFIX,
  ORGANIZATION_INVITATION_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateOrganizationInvitationDto } from '../../src/organizations/organization-invitations/dto/create-organization-invitation.dto'

export const createOrganizationInvitation = (
  params?: CreateOrganizationInvitationDto
) => {
  const idsService = new IdsService()

  const defaultValues: OrganizationInvitation = {
    id: idsService.createId(ORGANIZATION_INVITATION_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    emailAddress: faker.internet.email(),
    role: 'admin',
    status: 'pending',
    createdAt: faker.date.past(),
    updatedAt: new Date(),
  }
  return { ...defaultValues, ...params }
}
