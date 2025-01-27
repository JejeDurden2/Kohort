import { OrganizationInvitationStatus } from '@clerk/clerk-sdk-node'
import { Inject, Injectable } from '@nestjs/common'
import { CustomPrismaService } from 'nestjs-prisma'

import { ORGANIZATION_INVITATION_DATABASE_PREFIX } from '../../common/constants/database-prefixes.constants'
import { IdsService } from '../../common/ids/ids.service'
import { extendedPrismaClient } from '../../prisma.extension'
import { CreateOrganizationInvitationDto } from './dto/create-organization-invitation.dto'

@Injectable()
export class OrganizationInvitationsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService
  ) {}
  async create(
    createOrganizationInvitationDto: CreateOrganizationInvitationDto
  ) {
    const id = this.idsService.createId(ORGANIZATION_INVITATION_DATABASE_PREFIX)
    return await this.prisma.client.organizationInvitation.create({
      data: {
        id,
        organization: {
          connect: { id: createOrganizationInvitationDto.organizationId },
        },
        emailAddress: createOrganizationInvitationDto.emailAddress,
        role: createOrganizationInvitationDto.role,
        status: createOrganizationInvitationDto.status,
      },
    })
  }

  async findByOrganizationAndEmail(
    organizationId: string,
    emailAddress: string
  ) {
    return await this.prisma.client.organizationInvitation.findFirst({
      where: { organizationId, emailAddress },
    })
  }

  async update(id: string, status: OrganizationInvitationStatus) {
    return await this.prisma.client.organizationInvitation.update({
      data: { status },
      where: { id },
    })
  }
}
