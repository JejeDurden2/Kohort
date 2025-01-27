import {
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  UserJSON,
} from '@clerk/clerk-sdk-node'
import { faker } from '@faker-js/faker'
import { createMock } from '@golevelup/ts-jest'
import { NotFoundException, RawBodyRequest } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import {
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  User,
} from '@prisma/client'

import { createOrganizationInvitation } from '../../../test/factories/organization-invitation.factory'
import { createOrganizationMembership } from '../../../test/factories/organization-membership.factory'
import { createOrganization } from '../../../test/factories/organization.factory'
import { createUser } from '../../../test/factories/user.factory'
import { RequestScopedLoggerService } from '../../logger/logger.service'
import { OrganizationInvitationsService } from '../../organizations/organization-invitations/organization-invitations.service'
import { OrganizationMembershipsService } from '../../organizations/organization-memberships/organization-memberships.service'
import { OrganizationsService } from '../../organizations/organizations.service'
import { StripeService } from '../../stripe/stripe.service'
import { UsersService } from '../../users/users.service'
import { WebhooksService } from '../webhooks.service'
import { ClerkWebhooksController } from './clerk-webhooks.controller'

describe('ClerkWebhooksController', () => {
  let controller: ClerkWebhooksController
  let usersService: UsersService
  let organizationsService: OrganizationsService
  let organizationInvitationsService: OrganizationInvitationsService
  let organizationMembershipsService: OrganizationMembershipsService
  let service: WebhooksService
  let user: User
  let organization: Organization
  let organizationInvitation: OrganizationInvitation
  let organizationMembership: OrganizationMembership
  // I used any instead of mocking all 87 parameters of RawBodyRequest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRequest: any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkWebhooksController],
      providers: [
        { provide: WebhooksService, useValue: createMock<WebhooksService>() },
        { provide: UsersService, useValue: createMock<UsersService>() },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>(),
        },
        {
          provide: OrganizationInvitationsService,
          useValue: createMock<OrganizationInvitationsService>(),
        },
        {
          provide: OrganizationMembershipsService,
          useValue: createMock<OrganizationMembershipsService>(),
        },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: StripeService, useValue: createMock<StripeService>() },
        {
          provide: RequestScopedLoggerService,
          useValue: createMock<RequestScopedLoggerService>(),
        },
      ],
    }).compile()

    controller = module.get<ClerkWebhooksController>(ClerkWebhooksController)
    service = module.get<WebhooksService>(WebhooksService)
    usersService = module.get<UsersService>(UsersService)
    organizationsService =
      module.get<OrganizationsService>(OrganizationsService)
    organizationInvitationsService = module.get<OrganizationInvitationsService>(
      OrganizationInvitationsService
    )
    organizationMembershipsService = module.get<OrganizationMembershipsService>(
      OrganizationMembershipsService
    )
    user = createUser()
    organization = createOrganization()
    organizationInvitation = createOrganizationInvitation()
    organizationMembership = createOrganizationMembership()
    mockRequest = createMock<RawBodyRequest<Request>>()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('clerkCreateUser', () => {
    it('should create a user', async () => {
      const body = {
        email_addresses: [{ email_address: user.primaryEmailAddress }],
        id: user.clerkId,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_numbers: [{ phone_number: user.primaryPhoneNumber }],
        image_url: user.imageUrl,
      } as UserJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest.spyOn(usersService, 'create').mockImplementation(async () => user)

      expect(await controller.clerkCreateUser(mockRequest)).toBe(user)
    })
  })

  describe('clerkUpdateUser', () => {
    it('should update a user', async () => {
      const body = {
        email_addresses: [{ email_address: user.primaryEmailAddress }],
        id: user.clerkId,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_numbers: [{ phone_number: user.primaryPhoneNumber }],
        image_url: user.imageUrl,
      } as UserJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => user)
      jest.spyOn(usersService, 'update').mockImplementation(async () => user)

      expect(await controller.clerkUpdateUser(mockRequest)).toBe(user)
    })

    it('should throw an error if user is not found', async () => {
      const body = {
        email_addresses: [{ email_address: user.primaryEmailAddress }],
        id: user.clerkId,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_numbers: [{ phone_number: user.primaryPhoneNumber }],
        image_url: user.imageUrl,
      } as UserJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateUser(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkDeleteUser', () => {
    it('should delete a user', async () => {
      const body = {
        id: user.clerkId,
      } as UserJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => user)
      jest.spyOn(usersService, 'remove').mockImplementation(async () => user)

      expect(await controller.clerkDeleteUser(mockRequest)).toBe(user)
    })

    it('should throw an error if user is not found', async () => {
      const body = {
        id: user.clerkId,
      } as UserJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateUser(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkCreateOrganization', () => {
    it('should create an organization', async () => {
      const body = {
        id: organization.clerkId,
        name: organization.name,
        created_by: organization.createdBy,
        slug: organization.slug,
        image_url: organization.imageUrl,
      } as OrganizationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'create')
        .mockImplementation(async () => organization)

      expect(await controller.clerkCreateOrganization(mockRequest)).toBe(
        organization
      )
    })
  })

  describe('clerkUpdateOrganization', () => {
    it('should update an organization', async () => {
      const body = {
        id: organization.clerkId,
        name: organization.name,
        created_by: organization.createdBy,
        slug: organization.slug,
        image_url: organization.imageUrl,
      } as OrganizationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(organizationsService, 'update')
        .mockImplementation(async () => organization)

      expect(await controller.clerkUpdateOrganization(mockRequest)).toBe(
        organization
      )
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        id: organization.clerkId,
        name: organization.name,
        created_by: organization.createdBy,
        slug: organization.slug,
        image_url: organization.imageUrl,
      } as OrganizationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateOrganization(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkDeleteOrganization', () => {
    it('should delete an organization', async () => {
      const body = {
        id: user.clerkId,
      } as OrganizationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(organizationsService, 'remove')
        .mockImplementation(async () => organization)

      expect(await controller.clerkDeleteOrganization(mockRequest)).toBe(
        organization
      )
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        id: organization.clerkId,
        name: organization.name,
        created_by: organization.createdBy,
        slug: organization.slug,
        image_url: organization.imageUrl,
      } as OrganizationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkDeleteOrganization(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkSessionCreated', () => {
    it('should update a user', async () => {
      const body = {
        last_active_at: faker.number.int(),
        user_id: user.id,
      } as SessionJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => user)
      jest.spyOn(usersService, 'update').mockImplementation(async () => user)

      expect(await controller.clerkSessionCreated(mockRequest)).toBe(user)
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        last_active_at: faker.number.int(),
        user_id: user.id,
      } as SessionJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkSessionCreated(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkCreateInvitation', () => {
    it('should create an invitation', async () => {
      const body = {
        organization_id: organization.id,
        email_address: user.primaryEmailAddress,
        role: 'admin',
        status: 'pending',
      } as OrganizationInvitationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(organizationInvitationsService, 'create')
        .mockImplementation(async () => organizationInvitation)

      expect(await controller.clerkCreateInvitation(mockRequest)).toBe(
        organizationInvitation
      )
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        organization_id: organization.id,
        email_address: user.primaryEmailAddress,
        role: 'admin',
        status: 'pending',
      } as OrganizationInvitationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)
      jest
        .spyOn(organizationInvitationsService, 'create')
        .mockImplementation(async () => organizationInvitation)

      await expect(
        controller.clerkCreateInvitation(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkUpdateInvitation', () => {
    it('should update an invitation', async () => {
      const body = {
        organization_id: organization.id,
        email_address: user.primaryEmailAddress,
        role: 'admin',
        status: 'pending',
      } as OrganizationInvitationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(organizationInvitationsService, 'findByOrganizationAndEmail')
        .mockImplementation(async () => organizationInvitation)
      jest
        .spyOn(organizationInvitationsService, 'update')
        .mockImplementation(async () => organizationInvitation)

      expect(await controller.clerkUpdateInvitation(mockRequest)).toBe(
        organizationInvitation
      )
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        organization_id: organization.id,
        email_address: user.primaryEmailAddress,
        role: 'admin',
        status: 'pending',
      } as OrganizationInvitationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateInvitation(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if organization invitation is not found', async () => {
      const body = {
        organization_id: organization.id,
        email_address: user.primaryEmailAddress,
        role: 'admin',
        status: 'pending',
      } as OrganizationInvitationJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(organizationInvitationsService, 'findByOrganizationAndEmail')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateInvitation(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkCreateOrganizationMembership', () => {
    it('should create a membership', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => user)
      jest
        .spyOn(organizationMembershipsService, 'create')
        .mockImplementation(async () => organizationMembership)

      expect(
        await controller.clerkCreateOrganizationMembership(mockRequest)
      ).toBe(organizationMembership)
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkCreateOrganizationMembership(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if user is not found', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkCreateOrganizationMembership(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkUpdateOrganizationMembership', () => {
    it('should update a membership', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'basic_member',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => user)
      jest
        .spyOn(organizationMembershipsService, 'update')
        .mockImplementation(async () => organizationMembership)

      expect(
        await controller.clerkUpdateOrganizationMembership(mockRequest)
      ).toBe(organizationMembership)
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateOrganizationMembership(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if user is not found', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkUpdateOrganizationMembership(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })

  describe('clerkDeleteOrganizationMembership', () => {
    it('should delete a membership', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => user)
      jest
        .spyOn(organizationMembershipsService, 'delete')
        .mockImplementation(async () => organizationMembership)

      expect(
        await controller.clerkDeleteOrganizationMembership(mockRequest)
      ).toBe(organizationMembership)
    })

    it('should throw an error if organization is not found', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkDeleteOrganizationMembership(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if user is not found', async () => {
      const body = {
        organization: { id: organization.id },
        public_user_data: { user_id: user.id },
        role: 'admin',
      } as OrganizationMembershipJSON

      jest.spyOn(service, 'verifyClerkRequest').mockImplementation(() => body)
      jest
        .spyOn(organizationsService, 'findByClerkId')
        .mockImplementation(async () => organization)
      jest
        .spyOn(usersService, 'findByClerkId')
        .mockImplementation(async () => null)

      await expect(
        controller.clerkDeleteOrganizationMembership(mockRequest)
      ).rejects.toThrowError(NotFoundException)
    })
  })
})
