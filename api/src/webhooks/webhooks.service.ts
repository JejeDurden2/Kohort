import { WebhookEvent } from '@clerk/clerk-sdk-node'
import { InjectQueue } from '@nestjs/bull'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Bill,
  Order,
  Organization,
  PaymentGroup,
  PaymentIntent,
  Prisma,
} from '@prisma/client'
import { Queue } from 'bull'
import { CustomPrismaService } from 'nestjs-prisma'
import { Svix, Webhook as SvixWebhook, WebhookRequiredHeaders } from 'svix'

import { WEBHOOK_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { WEBHOOK_RELATIONS } from '../common/constants/database-relation-fields.constants'
import {
  SYSTEM,
  WEBHOOKS_RATE_LIMIT,
} from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { Sanitized } from '../common/types/sanitized.type'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateWebhookDto } from './dto/create-webhook.dto'
import { UpdateWebhookDto } from './dto/update-webhook.dto'

@Injectable()
export class WebhooksService {
  private svix: Svix

  constructor(
    private readonly idsService: IdsService,
    private readonly configService: ConfigService,
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    @InjectQueue(QueueName.WEBHOOK) private webhookQueue: Queue,
    private loggerService: DefaultScopedLoggerService
  ) {
    this.svix = new Svix(this.configService.get('SVIX_SECRET_KEY', ''))
  }

  async create(
    organization: Organization,
    livemode: boolean,
    createWebhookDto: CreateWebhookDto,
    createdBy: string = SYSTEM
  ) {
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a Svix application ID.`
      )
    }
    const svixWebhook = await this.svix.endpoint.create(
      organization.svixApplicationId,
      {
        url: createWebhookDto.url,
        description: createWebhookDto.description,
        filterTypes: createWebhookDto.events,
        rateLimit: WEBHOOKS_RATE_LIMIT,
        channels: [livemode ? 'live' : 'test'],
      }
    )
    const id = this.idsService.createId(WEBHOOK_DATABASE_PREFIX)
    return await this.prisma.client.webhook.create({
      data: {
        ...createWebhookDto,
        id,
        organizationId: organization.id,
        svixEndpointId: svixWebhook.id,
        livemode,
        createdBy,
        updatedBy: createdBy,
      },
    })
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(WEBHOOK_RELATIONS, query?.expand)

    const webhook = await this.prisma.client.webhook.findUnique({
      where: { id, organizationId, livemode },
      include,
    })

    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found.`)
    }

    return webhook
  }

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(WEBHOOK_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(Prisma.WebhookScalarFieldEnum, query?.orderBy)
    const search = formatSearch(Prisma.WebhookScalarFieldEnum, query?.search)

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.webhook.findMany({
        where: { organizationId, livemode, ...search },
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
      }),
      this.prisma.client.webhook.count({
        where: { organizationId, livemode, ...search },
      }),
    ])
    return { data, count }
  }

  async findByEventAndOrganizationIdAndLivemode(
    event: string,
    organizationId: string,
    livemode: boolean
  ) {
    return await this.prisma.client.webhook.findMany({
      where: { organizationId, livemode, events: { has: event } },
    })
  }

  async update(
    id: string,
    organization: Organization,
    livemode: boolean,
    updateWebhookDto: UpdateWebhookDto,
    updatedBy: string = SYSTEM
  ) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }

    await this.svix.endpoint.patch(
      organization.svixApplicationId,
      webhook.svixEndpointId,
      {
        url: updateWebhookDto.url,
        description: updateWebhookDto.description,
        filterTypes: updateWebhookDto.events,
        disabled: !updateWebhookDto.isActive,
      }
    )
    return await this.prisma.client.webhook.update({
      where: {
        id,
        organizationId: organization.id,
        livemode,
      },
      data: {
        ...updateWebhookDto,
        updatedBy,
      },
    })
  }

  async getSecret(id: string, organization: Organization, livemode: boolean) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }

    return await this.svix.endpoint.getSecret(
      organization.svixApplicationId,
      webhook.svixEndpointId
    )
  }

  async findAllMessages(
    id: string,
    organization: Organization,
    livemode: boolean,
    filter?: string
  ) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }

    const res = await this.svix.messageAttempt.listByEndpoint(
      organization.svixApplicationId,
      webhook.svixEndpointId
    )

    if (filter) {
      return res.data.filter((message) => {
        if (filter === 'success') {
          return message.status === 0
        } else if (filter === 'error') {
          return message.status === 2
        }
      })
    }

    return res.data
  }

  async findOneMessage(messageId: string, organization: Organization) {
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }
    return await this.svix.message.get(
      organization.svixApplicationId,
      messageId
    )
  }

  async retry(
    id: string,
    messageId: string,
    organization: Organization,
    livemode: boolean
  ) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }

    try {
      await this.svix.messageAttempt.resend(
        organization.svixApplicationId,
        messageId,
        webhook.svixEndpointId
      )
    } catch (error) {
      this.loggerService.error(
        `Error trying to resend the webhook.`,
        error.stack,
        {
          service: WebhooksService.name,
          function: this.retry.name,
          object: { id, messageId, organizationId: organization.id, livemode },
        }
      )
      throw new BadRequestException(`Error trying to resend the webhook.`)
    }
  }

  async getStats(id: string, organization: Organization, livemode: boolean) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }

    const stats = await this.svix.endpoint.getStats(
      organization.svixApplicationId,
      webhook.svixEndpointId
    )

    return {
      errorRate: (stats.fail / (stats.fail + stats.success)) * 100,
    }
  }

  async rollSecret(id: string, organization: Organization, livemode: boolean) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }
    await this.svix.endpoint.rotateSecret(
      organization.svixApplicationId,
      webhook.svixEndpointId,
      {}
    )
    return await this.svix.endpoint.getSecret(
      organization.svixApplicationId,
      webhook.svixEndpointId
    )
  }

  verifyClerkRequest(
    headers: WebhookRequiredHeaders,
    payload: string | undefined,
    secretKey: string | undefined
  ) {
    if (!secretKey)
      throw new BadRequestException('API key is missing for this webhook.')

    if (!payload)
      throw new BadRequestException('Missing payload or wrong format')

    const wh = new SvixWebhook(secretKey)
    let msg: WebhookEvent

    try {
      msg = wh.verify(payload, headers) as WebhookEvent
    } catch (err) {
      this.loggerService.error('Error verifying webhook signature.', err)
      throw new BadRequestException("Couldn't verify webhook signature.")
    }

    return msg.data
  }

  async hardRemove(id: string, organization: Organization, livemode: boolean) {
    const webhook = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!organization.svixApplicationId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a svixApplicationId.`
      )
    }
    await this.svix.endpoint.delete(
      organization.svixApplicationId,
      webhook.svixEndpointId
    )

    return await this.prisma.client.webhook.delete({
      where: { id, organizationId: organization.id, livemode },
    })
  }

  async enqueue(
    applicationId: string,
    object: Sanitized<Order> | Sanitized<PaymentIntent> | PaymentGroup | Bill,
    event: KohortPayEvent
  ) {
    await this.webhookQueue.add(QueueName.WEBHOOK, {
      applicationId,
      object,
      event,
    })
  }

  async send(
    applicationId: string,
    data: Sanitized<PaymentIntent> | PaymentGroup | Bill,
    event: KohortPayEvent
  ) {
    try {
      const svixResponse = await this.svix.message.create(applicationId, {
        eventType: event,
        payload: {
          type: event,
          data,
        },
        channels: [data.livemode ? 'live' : 'test'],
      })
      this.loggerService.log(
        `Message ${svixResponse.id} sent successfully to Svix.`,
        {
          service: WebhooksService.name,
          function: this.send.name,
          object: data.id,
          svix: svixResponse,
          event,
        }
      )
      return svixResponse
    } catch (error) {
      this.loggerService.error(
        `Error during the sending of webhook ${event}`,
        error.stack,
        {
          service: WebhooksService.name,
          function: this.send.name,
          object: data.id,
          svixApplicationId: applicationId,
        }
      )
      throw new Error(`Error sending webhook ${event}`)
    }
  }
}
