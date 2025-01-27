import { OrganizationMembershipRole } from '@clerk/clerk-sdk-node'
import { Inject, Injectable } from '@nestjs/common'
import { CustomPrismaService } from 'nestjs-prisma'

import { extendedPrismaClient } from '../../prisma.extension'
import { CreateOrganizationMembershipDto } from './dto/create-organization-membership.dto'

@Injectable()
export class OrganizationMembershipsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>
  ) {}

  async create(
    createOrganizationMembershipDto: CreateOrganizationMembershipDto
  ) {
    return await this.prisma.client.organizationMembership.create({
      data: {
        organization: {
          connect: {
            id: createOrganizationMembershipDto.organizationId,
          },
        },
        user: {
          connect: {
            id: createOrganizationMembershipDto.userId,
          },
        },
        role: createOrganizationMembershipDto.role,
      },
    })
  }

  async update(
    organizationId: string,
    userId: string,
    role: OrganizationMembershipRole
  ) {
    return await this.prisma.client.organizationMembership.update({
      data: { role },
      where: { organizationId_userId: { organizationId, userId } },
    })
  }

  async delete(organizationId: string, userId: string) {
    return await this.prisma.client.organizationMembership.delete({
      where: { organizationId_userId: { organizationId, userId } },
    })
  }

  async findAdminMembersByOrganizationId(organizationId: string) {
    return await this.prisma.client.organizationMembership.findMany({
      where: {
        organizationId,
        role: 'admin',
      },
      select: {
        user: {
          select: {
            primaryEmailAddress: true,
            locale: true,
          },
        },
      },
    })
  }
}
