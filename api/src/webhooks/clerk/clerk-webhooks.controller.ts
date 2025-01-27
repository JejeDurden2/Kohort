import {
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  UserJSON,
  createClerkClient,
} from '@clerk/clerk-sdk-node'
import {
  Controller,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Locale } from '@prisma/client'
import { Request } from 'express'
import { WebhookRequiredHeaders } from 'svix'

import { NODE_ENV_STAGING } from '../../common/constants/miscellaneous.constants'
import { IsWebhook } from '../../common/decorators/is-webhook.decorator'
import { CreateOrganizationDto } from '../../organizations/dto/create-organization.dto'
import { UpdateOrganizationDto } from '../../organizations/dto/update-organization.dto'
import { OrganizationInvitationsService } from '../../organizations/organization-invitations/organization-invitations.service'
import { CreateOrganizationMembershipDto } from '../../organizations/organization-memberships/dto/create-organization-membership.dto'
import { OrganizationMembershipsService } from '../../organizations/organization-memberships/organization-memberships.service'
import { OrganizationsService } from '../../organizations/organizations.service'
import { CreateUserDto } from '../../users/dto/create-user.dto'
import { UpdateUserDto } from '../../users/dto/update-user.dto'
import { UsersService } from '../../users/users.service'
import { WebhooksService } from '../webhooks.service'

@Controller('webhooks/clerk')
export class ClerkWebhooksController {
  constructor(
    private readonly service: WebhooksService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly organizationInvitationsService: OrganizationInvitationsService,
    private readonly organizationMembershipsService: OrganizationMembershipsService,
    private readonly configService: ConfigService
  ) {}

  // #region User
  @Post('create-user')
  @IsWebhook()
  async clerkCreateUser(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_CREATE_USER_API_KEY')
    ) as UserJSON

    const createUserData: CreateUserDto = {
      primaryEmailAddress: data.email_addresses[0].email_address,
      clerkId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      primaryPhoneNumber: data.phone_numbers[0]?.phone_number,
      imageUrl: data.image_url,
      locale: (data.public_metadata?.locale as Locale) ?? Locale.fr_FR,
    }

    return await this.usersService.create(createUserData)
  }

  @Post('update-user')
  @IsWebhook()
  async clerkUpdateUser(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_UPDATE_USER_API_KEY')
    ) as UserJSON

    const user = await this.usersService.findByClerkId(data.id)
    if (!user) throw new NotFoundException('User not found.')

    const updateUserData: UpdateUserDto = {
      primaryEmailAddress: data.email_addresses[0].email_address,
      clerkId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      primaryPhoneNumber: data.phone_numbers[0]?.phone_number,
      imageUrl: data.image_url,
      locale: (data.public_metadata?.locale as Locale) ?? Locale.fr_FR,
    }

    return await this.usersService.update(user.id, updateUserData)
  }

  @Post('delete-user')
  @IsWebhook()
  async clerkDeleteUser(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_DELETE_USER_API_KEY')
    ) as UserJSON

    const user = await this.usersService.findByClerkId(data.id)
    if (!user) throw new NotFoundException('User not found.')

    if (this.configService.get('NODE_ENV') === NODE_ENV_STAGING) {
      return await this.usersService.hardRemove(user.id)
    }

    return await this.usersService.remove(user.id)
  }
  // #endregion

  // #region Organization
  @Post('create-organization')
  @IsWebhook()
  async clerkCreateOrganization(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_CREATE_ORGANIZATION_API_KEY')
    ) as OrganizationJSON

    const createOrganizationData: CreateOrganizationDto = {
      clerkId: data.id,
      name: data.name,
      createdBy: data.created_by,
      slug: data.slug,
      imageUrl: data.image_url,
    }

    return await this.organizationsService.create(createOrganizationData)
  }

  @Post('update-organization')
  @IsWebhook()
  async clerkUpdateOrganization(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_UPDATE_ORGANIZATION_API_KEY')
    ) as OrganizationJSON

    const organization = await this.organizationsService.findByClerkId(data.id)
    if (!organization) throw new NotFoundException('Organization not found.')

    let updateOrganizationData: UpdateOrganizationDto = {
      clerkId: data.id,
      name: data.name,
      createdBy: data.created_by,
      slug: data.slug,
      imageUrl: data.image_url,
    }
    // Only in Onboarding : update websiteUrl if it exists in the public_metadata of the organization in Clerk
    if (data.public_metadata?.website_url) {
      updateOrganizationData = {
        ...updateOrganizationData,
        websiteUrl: data.public_metadata?.website_url as string,
      }
      const clerk = createClerkClient({
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      })
      const metadata = { ...data.public_metadata }
      delete metadata.website_url
      await clerk.organizations.updateOrganization(organization.clerkId, {
        publicMetadata: {
          ...metadata,
        },
      })
    }

    return await this.organizationsService.update(
      organization.id,
      updateOrganizationData
    )
  }

  @Post('delete-organization')
  @IsWebhook()
  async clerkDeleteOrganization(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_DELETE_ORGANIZATION_API_KEY')
    ) as OrganizationJSON

    const organization = await this.organizationsService.findByClerkId(data.id)
    if (!organization) throw new NotFoundException('Organization not found.')

    if (this.configService.get('NODE_ENV') === NODE_ENV_STAGING) {
      return await this.organizationsService.hardRemove(organization)
    }
    return await this.organizationsService.remove(organization.id)
  }

  // #endregion Organization

  @Post('session-created')
  @IsWebhook()
  async clerkSessionCreated(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_SESSION_CREATED_API_KEY')
    ) as SessionJSON

    const user = await this.usersService.findByClerkId(data.user_id)
    if (!user) throw new NotFoundException('User not found.')

    return await this.usersService.update(user.id, {
      lastSignInAt: new Date(data.last_active_at),
    })
  }

  // #region Invitations
  @Post('create-invitation')
  @IsWebhook()
  async clerkCreateInvitation(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_CREATE_INVITATION_API_KEY')
    ) as OrganizationInvitationJSON

    const organization = await this.organizationsService.findByClerkId(
      data.organization_id
    )
    if (!organization) throw new NotFoundException('Organization not found.')

    return await this.organizationInvitationsService.create({
      organizationId: organization.id,
      emailAddress: data.email_address,
      role: data.role,
      status: data.status,
    })
  }

  @Post('update-invitation')
  @IsWebhook()
  async clerkUpdateInvitation(@Req() request: RawBodyRequest<Request>) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get('CLERK_WEBHOOK_UPDATE_INVITATION_API_KEY')
    ) as OrganizationInvitationJSON

    const organization = await this.organizationsService.findByClerkId(
      data.organization_id
    )
    if (!organization) throw new NotFoundException('Organization not found.')

    const organizationInvitation =
      await this.organizationInvitationsService.findByOrganizationAndEmail(
        organization.id,
        data.email_address
      )
    if (!organizationInvitation)
      throw new NotFoundException('Organization Invitation not found.')

    return await this.organizationInvitationsService.update(
      organizationInvitation.id,
      data.status
    )
  }
  // #endregion Invitations

  // #region OrganizationMembership
  @Post('create-organization-membership')
  @IsWebhook()
  async clerkCreateOrganizationMembership(
    @Req() request: RawBodyRequest<Request>
  ) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get(
        'CLERK_WEBHOOK_CREATE_ORGANIZATION_MEMBERSHIP_API_KEY'
      )
    ) as OrganizationMembershipJSON

    const organization = await this.organizationsService.findByClerkId(
      data.organization.id
    )
    if (!organization) throw new NotFoundException('Organization not found.')

    const user = await this.usersService.findByClerkId(
      data.public_user_data.user_id
    )
    if (!user) throw new NotFoundException('User not found.')

    const createOrganizationMembershipData: CreateOrganizationMembershipDto = {
      organizationId: organization.id,
      userId: user.id,
      role: data.role,
    }

    return await this.organizationMembershipsService.create(
      createOrganizationMembershipData
    )
  }

  @Post('update-organization-membership')
  @IsWebhook()
  async clerkUpdateOrganizationMembership(
    @Req() request: RawBodyRequest<Request>
  ) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get(
        'CLERK_WEBHOOK_UPDATE_ORGANIZATION_MEMBERSHIP_API_KEY'
      )
    ) as OrganizationMembershipJSON

    const organization = await this.organizationsService.findByClerkId(
      data.organization.id
    )
    if (!organization) throw new NotFoundException('Organization not found.')

    const user = await this.usersService.findByClerkId(
      data.public_user_data.user_id
    )
    if (!user) throw new NotFoundException('User not found.')

    return await this.organizationMembershipsService.update(
      organization.id,
      user.id,
      data.role
    )
  }

  @Post('delete-organization-membership')
  @IsWebhook()
  async clerkDeleteOrganizationMembership(
    @Req() request: RawBodyRequest<Request>
  ) {
    const data = this.service.verifyClerkRequest(
      request.headers as unknown as WebhookRequiredHeaders,
      request.rawBody?.toString('utf8'),
      this.configService.get(
        'CLERK_WEBHOOK_DELETE_ORGANIZATION_MEMBERSHIP_API_KEY'
      )
    ) as OrganizationMembershipJSON

    const organization = await this.organizationsService.findByClerkId(
      data.organization.id
    )
    if (!organization) throw new NotFoundException('Organization not found.')

    const user = await this.usersService.findByClerkId(
      data.public_user_data.user_id
    )
    if (!user) throw new NotFoundException('User not found.')

    return await this.organizationMembershipsService.delete(
      organization.id,
      user.id
    )
  }
  // #endregion OrganizationMembership
}
