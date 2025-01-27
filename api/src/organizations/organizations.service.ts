import { createClerkClient } from '@clerk/clerk-sdk-node'
import { InjectQueue } from '@nestjs/bull'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiKeyType, Organization, Prisma } from '@prisma/client'
import { Queue } from 'bull'
import { CustomPrismaService } from 'nestjs-prisma'
import { Svix } from 'svix'

import { ApiKeysService } from '../api-keys/api-keys.service'
import { BrandSettingsService } from '../brand-settings/brand-settings.service'
import { CreateBrandSettings } from '../brand-settings/dto/create-brand-settings.dto'
import {
  ADDRESS_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { ORGANIZATION_RELATIONS } from '../common/constants/database-relation-fields.constants'
import {
  SYSTEM,
  WEBHOOKS_RATE_LIMIT,
} from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatSearch } from '../common/endpoint-features/search'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { extendedPrismaClient } from '../prisma.extension'
import { StripeService } from '../stripe/stripe.service'
import { UsersService } from '../users/users.service'
import { CreateOrganizationDto } from './dto/create-organization.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ApiKeysService))
    private readonly apiKeysService: ApiKeysService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly paymentGroupSettingsService: PaymentGroupSettingsService,
    private readonly brandSettingsService: BrandSettingsService,
    @InjectQueue(QueueName.SETUP_ORGANIZATION)
    private organizationSetupQueue: Queue,
    private configService: ConfigService,
    private readonly loggerService: DefaultScopedLoggerService
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const id = this.idsService.createId(ORGANIZATION_DATABASE_PREFIX)
    const organization = await this.prisma.client.organization.create({
      data: {
        id,
        ...createOrganizationDto,
      },
    })

    await this.enqueueSetupOrganization(organization)

    return organization
  }

  async enqueueSetupOrganization(organization: Organization) {
    await this.organizationSetupQueue.add(
      QueueName.SETUP_ORGANIZATION,
      organization
    )
  }

  async afterCreateSetup(organization: Organization) {
    await this.createApiKeys(organization)
    await this.createPaymentGroupSettings(organization, organization.createdBy)
    await this.createSvixApplication(organization)
    await this.createBrandSettings(organization, organization.createdBy)

    return organization
  }

  async createStripeAccount(organization: Organization) {
    const user = await this.usersService.findByClerkId(organization.createdBy)
    if (!user) {
      throw new NotFoundException(
        `User with clerkId ${organization.createdBy} not found.`
      )
    }

    try {
      const customer = await this.stripeService.createCustomer(
        organization,
        user
      )
      await this.prisma.client.organization.update({
        data: { stripeCustomerId: customer.id },
        where: { id: organization.id },
      })
    } catch (error) {
      this.loggerService.error(
        `createCustomer with Stripe failed for organization ${organization.id}.`,
        error.stack,
        {
          service: OrganizationsService.name,
          function: this.createStripeAccount.name,
          objectId: organization.id,
        }
      )
    }

    try {
      const clerk = createClerkClient({
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      })
      const existingMedata = (
        await clerk.organizations.getOrganization({
          organizationId: organization.clerkId,
        })
      ).publicMetadata
      await clerk.organizations.updateOrganization(organization.clerkId, {
        publicMetadata: {
          ...existingMedata,
          kohortId: organization.id,
        },
      })
    } catch (error) {
      this.loggerService.error(
        `updateOrganization with Clerk SDK failed for organization ${organization.id}.`,
        error.stack,
        {
          service: OrganizationsService.name,
          function: this.createStripeAccount.name,
          objectId: organization.id,
        }
      )
    }
  }

  async createApiKeys(organization: Organization) {
    // Test mode PK and SK
    let livemode = false
    await this.apiKeysService.create(organization.id, livemode, {
      name: 'Publishable Key',
      type: ApiKeyType.PUBLIC,
    })
    await this.apiKeysService.create(organization.id, livemode, {
      name: 'Secret Key',
      type: ApiKeyType.SECRET,
    })

    // Live mode PK. Live mode SK is only created through the api
    livemode = true
    await this.apiKeysService.create(organization.id, livemode, {
      name: 'Publishable Key',
      type: ApiKeyType.PUBLIC,
    })
  }

  async createPaymentGroupSettings(organization: Organization, userId: string) {
    // Test mode
    let livemode = false
    await this.paymentGroupSettingsService.create(
      organization.id,
      livemode,
      userId
    )

    // Live mode
    livemode = true
    await this.paymentGroupSettingsService.create(
      organization.id,
      livemode,
      userId
    )
  }

  async createBrandSettings(organization: Organization, userId: string) {
    // Test mode
    let livemode = false
    await this.brandSettingsService.create(organization.id, livemode, userId)

    // Live mode
    livemode = true
    await this.brandSettingsService.create(organization.id, livemode, userId)
  }

  async createSvixApplication(organization: Organization) {
    const svix = new Svix(this.configService.get('SVIX_SECRET_KEY', ''))
    const svixApplication = await svix.application.create({
      name: organization.name,
      rateLimit: WEBHOOKS_RATE_LIMIT,
    })
    await this.prisma.client.organization.updateMany({
      data: {
        svixApplicationId: svixApplication.id,
      },
      where: { id: organization.id, updatedBy: SYSTEM },
    })
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(ORGANIZATION_RELATIONS, query?.expand)
    const organization = await this.prisma.client.organization.findUnique({
      where: { id, deletedAt: null },
      include,
    })
    if (!organization) {
      return this.findByClerkId(id, query)
    }
    return organization
  }

  async findByClerkId(clerkId: string, query?: QueryDto) {
    const include = formatExpand(ORGANIZATION_RELATIONS, query?.expand)
    return await this.prisma.client.organization.findUnique({
      where: { clerkId, deletedAt: null },
      include,
    })
  }

  findAllWithoutBrandSettings() {
    return this.prisma.client.organization.findMany({
      where: {
        deletedAt: null,
        brandSettings: {
          none: {},
        },
      },
    })
  }

  async findAll() {
    return await this.prisma.client.organization.findMany({
      where: { deletedAt: null },
    })
  }

  async findOneWithDeleted(id: string) {
    try {
      return await this.prisma.client.organization.findUnique({
        where: { id, deletedAt: { not: null } },
      })
    } catch (error) {
      if (error)
        return await this.prisma.client.organization.findUnique({
          where: { clerkId: id, deletedAt: { not: null } },
        })
    }
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    updatedBy: string = SYSTEM
  ) {
    let organization: Organization

    try {
      organization = await this.prisma.client.organization.update({
        data: {
          ...updateOrganizationDto,
          updatedBy,
          address: {
            upsert: {
              create: {
                ...updateOrganizationDto.address,
                id: this.idsService.createId(ADDRESS_DATABASE_PREFIX),
              },
              update: {
                ...updateOrganizationDto.address,
              },
            },
          },
        },
        where: { id, deletedAt: null },
      })
    } catch (error) {
      this.loggerService.error('Error updating organization', error.stack, {
        method: this.update.name,
        service: OrganizationsService.name,
        object: id,
      })

      organization = await this.prisma.client.organization.update({
        data: {
          ...updateOrganizationDto,
          updatedBy,
          address: {
            upsert: {
              create: {
                ...updateOrganizationDto.address,
                id: this.idsService.createId(ADDRESS_DATABASE_PREFIX),
              },
              update: {
                ...updateOrganizationDto.address,
              },
            },
          },
        },
        where: { clerkId: id, deletedAt: null },
      })
    }

    const { address, billingEmails } = updateOrganizationDto
    const billingEmail =
      billingEmails && billingEmails.length > 0 ? billingEmails[0] : undefined

    if (address || billingEmail) {
      try {
        await this.stripeService.updateCustomer(
          organization,
          address,
          billingEmail
        )
      } catch (error) {
        this.loggerService.error(
          'Error updating customer in Stripe',
          error.stack,
          {
            method: this.update.name,
            service: OrganizationsService.name,
            object: organization.id,
          }
        )
      }
    }

    return organization
  }

  async remove(id: string, updatedBy: string = SYSTEM) {
    const deleted = await this.findOneWithDeleted(id)
    if (deleted)
      throw new BadRequestException(
        `Organization with id ${id} is already deleted.`
      )

    return await this.update(id, { deletedAt: new Date() }, updatedBy)
  }

  async hardRemove(organization: Organization) {
    try {
      return await this.prisma.client.organization.delete({
        where: { id: organization.id },
      })
    } catch (error) {
      this.loggerService.error(
        `Error deleting organization ${organization.id}.`,
        error.stack,
        {
          service: OrganizationsService.name,
          function: this.hardRemove.name,
          objectId: organization.id,
        }
      )
      throw new Error(`Error deleting organization ${organization.id}.`)
    }
  }

  async getAddresses(organizationId: string) {
    return await this.prisma.client.address.findFirst({
      where: { organization: { id: organizationId } },
    })
  }

  async createBrandSettingsFromData(
    organizationId: string,
    data: CreateBrandSettings,
    userId: string
  ) {
    const existingBrandSettings =
      await this.prisma.client.brandSettings.findFirst({
        where: { organizationId },
      })
    if (!existingBrandSettings) {
      await this.brandSettingsService.createFromData(
        organizationId,
        data,
        userId
      )
    }
  }

  async listOrganizationsWithBrands(query?: QueryDto) {
    const search = formatSearch(
      Prisma.OrganizationScalarFieldEnum,
      query?.search
    )
    const [organizations, count] = await this.prisma.client.$transaction([
      this.prisma.client.organization.findMany({
        where: {
          deletedAt: null,
          ...search,
          brandSettings: {
            some: {}, // Only include organizations that have brand settings
          },
        },
        include: {
          brandSettings: {
            where: {
              livemode: true,
            },
            include: {
              tags: true,
            },
          },
        },
        skip: query?.skip,
        take: query?.take,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.client.organization.count({
        where: {
          deletedAt: null,
          brandSettings: {
            some: {},
          },
        },
      }),
    ])

    return {
      data: organizations,
      count,
    }
  }
}
