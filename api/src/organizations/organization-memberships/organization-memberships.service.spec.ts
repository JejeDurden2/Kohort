import { OrganizationMembershipRole } from '@clerk/clerk-sdk-node'
import { Test, TestingModule } from '@nestjs/testing'
import { OrganizationMembership } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createOrganizationMembership } from '../../../test/factories/organization-membership.factory'
import { extendedPrismaClient } from '../../prisma.extension'
import { OrganizationMembershipsService } from './organization-memberships.service'

describe('OrganizationMembershipsService', () => {
  let service: OrganizationMembershipsService
  let orgMembership: OrganizationMembership
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationMembershipsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
      ],
    }).compile()

    service = module.get<OrganizationMembershipsService>(
      OrganizationMembershipsService
    )
    prisma = module.get('PrismaService')
    orgMembership = createOrganizationMembership()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an organizationMembership', async () => {
      const result = orgMembership
      prisma.client.organizationMembership.create.mockResolvedValueOnce(result)

      expect(
        await service.create({
          organizationId: orgMembership.organizationId,
          userId: orgMembership.userId,
          role: orgMembership.role as OrganizationMembershipRole,
        })
      ).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an organizationMembership', async () => {
      const result = orgMembership
      prisma.client.organizationMembership.update.mockResolvedValueOnce(result)

      expect(
        await service.update(
          orgMembership.organizationId,
          orgMembership.userId,
          orgMembership.role as OrganizationMembershipRole
        )
      ).toBe(result)
    })
  })

  describe('delete', () => {
    it('should delete an organizationMembership', async () => {
      const result = orgMembership
      prisma.client.organizationMembership.delete.mockResolvedValueOnce(result)

      expect(
        await service.delete(orgMembership.organizationId, orgMembership.userId)
      ).toBe(result)
    })
  })
})
