import {
  OrganizationInvitationStatus,
  OrganizationMembershipRole,
} from '@clerk/clerk-sdk-node'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { OrganizationInvitation } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createOrganizationInvitation } from '../../../test/factories/organization-invitation.factory'
import { IdsService } from '../../common/ids/ids.service'
import { extendedPrismaClient } from '../../prisma.extension'
import { OrganizationInvitationsService } from './organization-invitations.service'

describe('OrganizationInvitationsService', () => {
  let service: OrganizationInvitationsService
  let orgInvitation: OrganizationInvitation
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationInvitationsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
      ],
    }).compile()

    service = module.get<OrganizationInvitationsService>(
      OrganizationInvitationsService
    )
    prisma = module.get('PrismaService')
    orgInvitation = createOrganizationInvitation()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an organizationInvitation', async () => {
      const result = orgInvitation
      prisma.client.organizationInvitation.create.mockResolvedValueOnce(result)

      expect(
        await service.create({
          organizationId: orgInvitation.organizationId,
          emailAddress: orgInvitation.emailAddress,
          role: orgInvitation.role as OrganizationMembershipRole,
          status: orgInvitation.status as OrganizationInvitationStatus,
        })
      ).toBe(result)
    })
  })

  describe('findByOrganizationAndEmail', () => {
    it('should find an organizationInvitation by organization and email', async () => {
      const result = orgInvitation
      prisma.client.organizationInvitation.findFirst.mockResolvedValueOnce(
        result
      )

      expect(
        await service.findByOrganizationAndEmail(
          orgInvitation.organizationId,
          orgInvitation.emailAddress
        )
      ).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an organizationInvitation', async () => {
      const result = orgInvitation
      prisma.client.organizationInvitation.update.mockResolvedValueOnce(result)

      expect(
        await service.update(
          orgInvitation.id,
          orgInvitation.status as OrganizationInvitationStatus
        )
      ).toBe(result)
    })
  })
})
