import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Organization } from '@prisma/client'
import {
  DefaultGenerics,
  NewActivity,
  StreamClient,
  StreamUser,
  UR,
  connect,
} from 'getstream'
import { IncomingHttpHeaders } from 'http'
import * as humps from 'humps'
import { CustomPrismaService } from 'nestjs-prisma'

import { ApiKeysService } from '../api-keys/api-keys.service'
import {
  API_KEY_DATABASE_PREFIX,
  CUSTOMER_DATABASE_PREFIX,
  LIVEMODE_DATABASE_PREFIX,
  TESTMODE_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { CustomersService } from '../customers/customers.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { extendedPrismaClient } from '../prisma.extension'
import { UsersService } from '../users/users.service'

export type ApiLogsObject = {
  responseBody: Record<string, string>
  requestBody: Record<string, string>
  url: string
  headers: IncomingHttpHeaders
  ip: string | undefined
  statusCode: number
  timestamp: string
}

@Injectable()
export class GetStreamService {
  constructor(
    private readonly configService: ConfigService,
    private client: StreamClient,
    private readonly apikeysService: ApiKeysService,
    private readonly customersService: CustomersService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly loggerService: DefaultScopedLoggerService,
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>
  ) {
    if (process.env.NODE_ENV !== 'test') {
      // This should probably be injected instead of calling getClient() here
      this.configService = new ConfigService()
      this.client = this.getClient()
    }
  }

  getClient() {
    return connect(
      this.configService.get('STREAM_API_KEY', ''),
      this.configService.get('STREAM_API_SECRET', '')
    )
  }

  async sendActivity(
    model: string,
    operation: string,
    time: string,
    result: UR,
    args: UR
  ) {
    if (
      model === 'ApiKey' &&
      operation === 'update' &&
      typeof args.data === 'object' &&
      args.data &&
      Object.keys(args.data).includes('lastUsedAt')
    ) {
      return 'ApiKey used, not sending activity'
    }
    const actor = await this.getActor(args.data as UR)
    const verb = this.getVerb(operation, args.data as UR)
    const object = await this.getObject(
      model,
      operation,
      result as UR,
      args.data as UR
    )

    const activity = {
      actor,
      verb,
      object,
      time,
    }

    try {
      if (model === 'Organization') {
        return await this.sendActivityToOrganizationFeed(
          activity,
          model,
          result
        )
      }
      await this.sendActivityToOrganizationFeed(activity, model, result)
      return await this.sendActivityToModelFeed(model, activity, result)
    } catch (error) {
      this.loggerService.error(
        'Error during sending of activity.',
        error.stack,
        {
          service: GetStreamService.name,
          function: this.sendActivity.name,
          object: {
            model,
            operation,
            time,
            result,
            args,
          },
        }
      )
    }
  }

  async getActor(args: UR) {
    const actorId = (args.createdBy as string) ?? (args.updatedBy as string)
    let actor: StreamUser<DefaultGenerics> | null = null
    if (actor && actorId.includes(API_KEY_DATABASE_PREFIX)) {
      const apiKey = await this.apikeysService.findOne(actorId)
      if (apiKey) {
        actor = await this.client.user(apiKey.id).getOrCreate({
          name: apiKey.name,
          collection: 'ApiKey',
        })
      }
    } else if (actor && actorId.includes(CUSTOMER_DATABASE_PREFIX)) {
      const customer = await this.customersService.findOne(actorId)
      if (customer) {
        actor = await this.client.user(customer.id).getOrCreate({
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.emailAddress,
          collection: 'Customer',
        })
      }
    } else if (actor && actorId.includes(USER_DATABASE_PREFIX)) {
      const user = await this.usersService.findOne(actorId)
      if (user) {
        actor = await this.client.user(user.id).getOrCreate({
          name: `${user.firstName} ${user.lastName}`,
          email: user.primaryEmailAddress,
          imageUrl: user.imageUrl,
          collection: 'User',
        })
      }
    }
    if (actor && Object.keys(actor).length !== 0) {
      return actor
    }
    return SYSTEM
  }

  async getObject(model: string, operation: string, result: UR, args: UR) {
    if (operation === 'create') {
      return await this.client.collections.add(
        model,
        'id' in result ? (result.id as string) : '',
        result
      )
    } else if (operation === 'update') {
      try {
        return await this.client.collections.update(
          model,
          'id' in result ? (result.id as string) : '',
          'data' in args ? (args.data as UR) : {}
        )
      } catch (error) {
        if (error)
          this.client.collections.add(
            model,
            'id' in result ? (result.id as string) : '',
            result
          )
      }
    } else if (operation === 'delete') {
      return await this.client.collections.delete(
        model,
        'id' in result ? (result.id as string) : ''
      )
    }
  }

  getVerb(operation: string, args: UR) {
    const data: UR = 'data' in args ? (args.data as UR) : {}
    if (operation === 'update') {
      if ('expiresAt' in data && data.expiresAt) {
        return 'expire'
      } else if ('deletedAt' in data && data.deletedAt) {
        return 'delete'
      } else if ('canceledAt' in data && data.canceledAt) {
        return 'cancel'
      }
      return 'update'
    }
    return operation
  }

  async sendActivityToOrganizationFeed(
    activity: NewActivity<DefaultGenerics>,
    model: string,
    result: UR
  ) {
    const organizationId =
      model === 'Organization'
        ? (result.id as string)
        : (result.organizationId as string)
    if (!organizationId) {
      return null
    }
    const livemode = result.livemode as boolean
    const organization = await this.organizationsService.findOne(organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }
    let id = organization.clerkId
    id = `${id}_${
      livemode ? LIVEMODE_DATABASE_PREFIX : TESTMODE_DATABASE_PREFIX
    }`
    try {
      return await this.client.feed('Organization', id).addActivity(activity)
    } catch (error) {
      this.loggerService.error(
        'Error during sending of activity',
        error.stack,
        {
          service: GetStreamService.name,
          function: this.sendActivityToOrganizationFeed.name,
          object: {
            activity,
            model,
            result,
          },
        }
      )
    }
  }

  async sendActivityToModelFeed(
    model: string,
    activity: NewActivity<DefaultGenerics>,
    result: UR
  ) {
    return await this.client
      .feed(model, result.id as string)
      .addActivity(activity)
  }

  async sendApiLogs(
    organization: Organization,
    livemode: boolean,
    verb: string,
    object: ApiLogsObject
  ) {
    // Here actor is ApiLogs:org_id_mode, verb is the HTTP method and object contains all the remaining data (request, response, url etc.)
    const id = `${organization.clerkId}_${
      livemode ? LIVEMODE_DATABASE_PREFIX : TESTMODE_DATABASE_PREFIX
    }`
    let actor: StreamUser<DefaultGenerics> | 'unknown' = 'unknown'
    if (object.headers.referer) {
      try {
        actor = await this.client
          .user(object.headers.referer.toString())
          .getOrCreate({
            name: object.headers.referer,
            collection: 'Referer',
          })
      } catch (error) {
        actor = 'unknown'
        this.loggerService.error(
          'Error during getting or creating Referer',
          error.stack,
          {
            service: GetStreamService.name,
            function: this.sendApiLogs.name,
            object: {
              organizationId: organization.id,
              livemode,
              verb,
              object,
            },
          }
        )
      }
    }
    const activity = {
      actor,
      verb,
      object,
    }

    try {
      return await this.client.feed('ApiLogs', id).addActivity(activity)
    } catch (error) {
      this.loggerService.error('Error during sending of ApiLogs', error.stack, {
        service: GetStreamService.name,
        function: this.sendApiLogs.name,
        object: {
          organizationId: organization.id,
          livemode,
          verb,
          object,
        },
      })
    }
  }

  async getActivitiesFromFeed(
    feedName: string,
    feedId: string,
    query: QueryDto,
    organization: Organization,
    livemode: boolean
  ) {
    await this.validateFeedBelongsToOrganization(
      feedName,
      feedId,
      organization,
      livemode
    )
    const feed = this.client.feed(humps.pascalize(feedName), feedId)
    try {
      return await feed.get({
        limit: query.take,
        offset: query.skip ?? 0,
        enrich: true,
      })
    } catch (error) {
      this.loggerService.error(
        'Error during getting of activities',
        error.stack,
        {
          service: GetStreamService.name,
          function: this.getActivitiesFromFeed.name,
          object: {
            feedName,
            feedId,
            query,
            organization: organization.id,
            livemode,
          },
        }
      )
    }
  }

  async validateFeedBelongsToOrganization(
    feedName: string,
    feedId: string,
    organization: Organization,
    livemode: boolean
  ) {
    if (feedName === 'api-logs') {
      feedName = humps.pascalize(feedName)
      const rebuildFeedId = `${organization.clerkId}_${
        livemode ? LIVEMODE_DATABASE_PREFIX : TESTMODE_DATABASE_PREFIX
      }`
      if (feedId !== rebuildFeedId) {
        throw new NotFoundException(
          `Feed not found for organization ${organization.id}`
        )
      }
    } else {
      const camelizedFeedName = humps.camelize(feedName)
      if (
        camelizedFeedName === 'organization' &&
        feedId !== organization.clerkId
      ) {
        throw new NotFoundException(
          `Feed not found for organization ${organization.id}`
        )
      }

      const modelMappings = {
        apiKey: this.prisma.client.apiKey,
        brandSettings: this.prisma.client.brandSettings,
        checkoutSession: this.prisma.client.checkoutSession,
        customer: this.prisma.client.customer,
        organization: this.prisma.client.organization,
        order: this.prisma.client.order,
        paymentGroup: this.prisma.client.paymentGroup,
        paymentGroupSettings: this.prisma.client.paymentGroupSettings,
        paymentIntent: this.prisma.client.paymentIntent,
        user: this.prisma.client.user,
        webhook: this.prisma.client.webhook,
      }
      const model = modelMappings[camelizedFeedName]
      if (!model) {
        throw new BadRequestException(
          `Feed with name "${feedName}" does not exist`
        )
      }
      const result = await model.findUnique({
        where: {
          id: feedId,
          organizationId: organization.id,
          livemode,
        },
      })
      if (!result) {
        throw new NotFoundException(
          `Feed not found for organization ${organization.id}`
        )
      }
    }
  }
}
