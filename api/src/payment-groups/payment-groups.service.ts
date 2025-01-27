import { InjectQueue } from '@nestjs/bull'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  Currency,
  DiscountLevel,
  DiscountType,
  EmailType,
  Locale,
  PaymentGroup,
  PaymentGroupStatus,
  PaymentIntentStatus,
  Prisma,
  ReminderEmailSentStatus,
} from '@prisma/client'
import { Queue } from 'bull'
import { CustomPrismaService } from 'nestjs-prisma'

import { PRIMARY_COLOR } from '../common/constants/colors.constants'
import { PAYMENT_GROUP_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { PAYMENT_GROUP_RELATIONS } from '../common/constants/database-relation-fields.constants'
import {
  NODE_ENV_PROD,
  SYSTEM,
} from '../common/constants/miscellaneous.constants'
import { SEVEN_DAYS_IN_MINUTES } from '../common/constants/payment-group.constants'
import {
  AYMERIC_USER_ID,
  MARTIN_USER_ID,
} from '../common/constants/slack.constants'
import {
  EMAIL_PROVIDER,
  TEMPLATE_GROUP_MIDWAY_REMINDER,
  TEMPLATE_GROUP_NEW_LEVEL_UNLOCKED,
} from '../common/constants/transaction-emails.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { PaymentGroupValidationErrors } from '../common/enums/errors'
import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { translation } from '../common/locales/locale'
import getColorVariants from '../common/utils/color-variants'
import {
  computeAdjustedDate,
  computeExpiresAt,
  computeMidExpiresAt,
} from '../common/utils/compute-expires-at'
import encodeUrlParams from '../common/utils/encode-url'
import { getTemplateName } from '../common/utils/find-whatsapp-template-name'
import {
  formatDateTime,
  formatDateTo2Digits,
} from '../common/utils/format-date'
import { formatLink } from '../common/utils/format-link'
import { formatPhoneNumber } from '../common/utils/format-phone-number'
import { replaceUnderscoreWithHyphen } from '../common/utils/replace-undescore-with-hyphen'
import { CustomersService } from '../customers/customers.service'
import { EmailsService } from '../email/emails.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersService } from '../orders/orders.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackService } from '../slack/slack.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { CreatePaymentGroupDto } from './dto/create-payment-group.dto'
import { HelpPaymentGroupDto } from './dto/help-payment-group.dto'
import { UpdatePaymentGroupDto } from './dto/update-payment-group.dto'
import { ValidatePaymentGroupDto } from './dto/validate-payment-group.dto'
import { PaymentGroupCreatedEvent } from './events/payment-group-created.event'
import { PaymentGroupExpiredEvent } from './events/payment-group-expired.event'
import {
  DeprecatedPaymentGroupNewMemberJoinedEvent,
  PaymentGroupNewMemberJoinedEvent,
} from './events/payment-group-joined.event'
import { PaymentGroupSucceededEvent } from './events/payment-group-succeeded.event'

@Injectable()
export class PaymentGroupsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    @Inject(forwardRef(() => PaymentIntentsService))
    private readonly paymentIntentsService: PaymentIntentsService,
    private readonly emailsService: EmailsService,
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
    @InjectQueue(QueueName.PROCESS_PAYMENT_GROUP)
    private processPaymentGroupQueue: Queue,
    private readonly paymentGroupSettingsService: PaymentGroupSettingsService,
    private readonly loggerService: DefaultScopedLoggerService,
    private readonly whatsappService: WhatsappService,
    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationsService: OrganizationsService,
    private readonly slackService: SlackService,
    private eventEmitter: EventEmitter2,
    private readonly transactionalEmailsService: TransactionalEmailsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService
  ) {}

  async create(
    organizationId: string,
    livemode: boolean,
    createPaymentGroupDto: CreatePaymentGroupDto,
    createdBy: string = SYSTEM
  ) {
    const organization = await this.organizationsService.findOne(organizationId)
    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} not found.`)
    }

    const paymentGroupSettings =
      (await this.paymentGroupSettingsService.findOneByOrganizationIdAndLivemode(
        organization.id,
        livemode,
        { expand: ['discountLevels'] }
      )) as Prisma.PaymentGroupSettingsGetPayload<{
        include: {
          discountLevels: true
        }
      }>

    if (!paymentGroupSettings) {
      throw new BadRequestException(
        `Payment group settings not found for organization ${organization.id}. Cannot create PaymentGroup.`
      )
    }

    const { paymentIntentId, orderId, ...cleanCreatePaymentGroupDto } =
      createPaymentGroupDto

    if (!orderId && !paymentIntentId) {
      throw new BadRequestException(
        'Either orderId or paymentIntentId is required.'
      )
    }

    const startDate = new Date()
    const expiresAt = computeExpiresAt(
      createPaymentGroupDto.expiresAt,
      paymentGroupSettings.minutesDuration
    )
    let midExpireAt: Date | undefined = undefined
    let jPlus7StartAt: Date | undefined = undefined
    let jMinus5ExpireAt: Date | undefined = undefined
    if (paymentGroupSettings.minutesDuration <= SEVEN_DAYS_IN_MINUTES) {
      midExpireAt = computeMidExpiresAt(
        createPaymentGroupDto.expiresAt,
        paymentGroupSettings.minutesDuration
      )
    } else {
      jPlus7StartAt = computeAdjustedDate(startDate, 7, 8, 0)
      jMinus5ExpireAt = computeAdjustedDate(expiresAt, -5, 8, 0)
    }
    const customer =
      await this.customersService.findOneByOrganizationIdAndLivemode(
        createPaymentGroupDto.customerId,
        organization.id,
        livemode
      )

    if (!customer) {
      throw new NotFoundException(
        `Customer ${createPaymentGroupDto.customerId} not found.`
      )
    }

    const objectId = paymentIntentId
      ? {
          paymentIntents: {
            connect: {
              id: paymentIntentId,
            },
          },
        }
      : {
          orders: {
            connect: {
              id: orderId,
            },
          },
        }

    const paymentGroup = await this.prisma.client.paymentGroup.create({
      data: {
        ...cleanCreatePaymentGroupDto,
        id: this.idsService.createId(PAYMENT_GROUP_DATABASE_PREFIX),
        shareId: this.idsService.createPaymentGroupShareId(livemode),
        organizationId: organization.id,
        livemode,
        expiresAt,
        jMinus2ExpireAt: jMinus5ExpireAt,
        jPlus3StartAt: jPlus7StartAt,
        creatorEmail: customer.emailAddress,
        midExpireAt: midExpireAt,
        ...objectId,
        createdBy,
        updatedBy: createdBy,
      },
    })

    this.loggerService.log(`Payment group ${paymentGroup.id} created.`, {
      service: PaymentGroupsService.name,
      function: this.create.name,
      objectId: paymentGroup.id,
    })

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_GROUP_CREATED,
      new PaymentGroupCreatedEvent(paymentGroup, paymentIntentId, orderId)
    )

    return paymentGroup
  }

  async findAllByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(PAYMENT_GROUP_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.PaymentGroupScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(
      Prisma.PaymentGroupScalarFieldEnum,
      query?.search
    )
    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.paymentGroup.findMany({
        where: {
          organizationId,
          livemode,
          ...search,
        },
        include,
        skip: query?.skip,
        take: query?.take,
        orderBy,
      }),
      this.prisma.client.paymentGroup.count({
        where: { organizationId, livemode, ...search },
      }),
    ])
    return { data, count }
  }

  async findAll(query?: QueryDto) {
    const include = formatExpand(PAYMENT_GROUP_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.PaymentGroupScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(
      Prisma.PaymentGroupScalarFieldEnum,
      query?.search
    )
    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.paymentGroup.findMany({
        where: {
          ...search,
        },
        include,
        skip: query?.skip,
        take: query?.take,
        orderBy,
      }),
      this.prisma.client.paymentGroup.count({
        where: { ...search },
      }),
    ])
    return { data, count }
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(PAYMENT_GROUP_RELATIONS, query?.expand)
    let paymentGroup = await this.prisma.client.paymentGroup.findUnique({
      where: {
        id,
        organizationId,
        livemode,
      },
      include,
    })

    if (!paymentGroup) {
      paymentGroup = await this.prisma.client.paymentGroup.findUnique({
        where: {
          shareId: id,
          organizationId,
          livemode,
        },
        include,
      })
    }
    return paymentGroup
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(PAYMENT_GROUP_RELATIONS, query?.expand)
    let paymentGroup = await this.prisma.client.paymentGroup.findUnique({
      where: {
        id,
      },
      include,
    })

    if (!paymentGroup) {
      paymentGroup = await this.prisma.client.paymentGroup.findUnique({
        where: {
          shareId: id,
        },
        include,
      })
    }
    return paymentGroup
  }

  async findOneByCode(code: string, query?: QueryDto) {
    const include = formatExpand(PAYMENT_GROUP_RELATIONS, query?.expand)
    const paymentGroup = await this.prisma.client.paymentGroup.findUnique({
      where: {
        shareId: code,
      },
      include,
    })
    return paymentGroup
  }

  async findAllStatusOpenAndExpired() {
    return await this.prisma.client.paymentGroup.findMany({
      where: {
        status: PaymentGroupStatus.OPEN,
        expiresAt: {
          lte: new Date(),
        },
      },
    })
  }

  async update(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatePaymentGroupDto: UpdatePaymentGroupDto,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.paymentGroup.update({
      where: {
        id,
        organizationId,
        livemode,
      },
      data: { ...updatePaymentGroupDto, updatedBy },
    })
  }

  async deprecatedGetParticipants(id: string, query?: QueryDto) {
    const paymentGroup = await this.findOne(id)
    if (!paymentGroup) {
      throw new NotFoundException(`Payment group ${id} not found.`)
    }

    return await this.paymentIntentsService.findAllByPaymentGroup(
      paymentGroup.id,
      query
    )
  }

  async join(id: string, orderId: string) {
    const paymentGroup = (await this.findOne(id, {
      expand: ['paymentGroupSettings.discountLevels'],
    })) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
      }
    }>
    if (!paymentGroup) {
      this.loggerService.error('Payment group not found.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new NotFoundException(`Payment group ${id} not found.`)
    }
    if (!paymentGroup.paymentGroupSettings) {
      this.loggerService.error('Payment group settings not found.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new BadRequestException(
        `Payment group ${id} has no payment group settings.`
      )
    }

    const order = (await this.ordersService.findOneByOrganizationIdAndLivemode(
      orderId,
      paymentGroup.organizationId,
      paymentGroup.livemode,
      {
        expand: ['customer', 'organization.brandSettings'],
      }
    )) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
      }
    }>
    if (!order) {
      this.loggerService.error('Order not found.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new NotFoundException(`Order ${orderId} not found.`)
    }

    if (!order.customer) {
      this.loggerService.error('Customer not found.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new BadRequestException(`Order ${orderId} has no customer.`)
    }

    if (paymentGroup.status !== PaymentGroupStatus.OPEN) {
      this.loggerService.error('Payment group status is not open.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new BadRequestException(
        `Payment group ${id} is not open. Current status is ${paymentGroup.status}.`
      )
    }

    const participants = await this.ordersService.findAllByPaymentGroup(
      paymentGroup.id
    )

    if (
      participants.data.length >=
      paymentGroup.paymentGroupSettings.maxParticipants
    ) {
      this.loggerService.error('Payment group is full.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new BadRequestException(`Payment group ${id} is full.`)
    }

    const owner =
      await this.customersService.findOneByOrganizationIdAndLivemode(
        paymentGroup.customerId,
        order.organizationId,
        order.livemode
      )
    if (!owner) {
      this.loggerService.error('Owner not found.', '', {
        service: OrdersService.name,
        method: this.join.name,
        object: orderId,
      })
      throw new BadRequestException(
        `Customer ${paymentGroup.customerId} not found. Group has no owner.`
      )
    }

    if (
      participants.data.length + 1 >=
      paymentGroup.paymentGroupSettings.maxParticipants
    ) {
      await this.enqueueCashbacks(paymentGroup.id)
      this.loggerService.log(
        `Payment group ${paymentGroup.id} has reached maximum participants. Sent to queue for completion`,
        {
          service: PaymentGroupsService.name,
          function: this.deprecatedJoin.name,
          objectId: paymentGroup.id,
        }
      )
    }

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_GROUP_NEW_MEMBER_JOINED,
      new PaymentGroupNewMemberJoinedEvent(paymentGroup, order)
    )

    return await this.findOne(id, { expand: ['paymentIntents'] })
  }

  async deprecatedJoin(id: string, paymentIntentId: string) {
    const paymentGroup = (await this.findOne(id, {
      expand: ['paymentGroupSettings.discountLevels'],
    })) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
      }
    }>
    if (!paymentGroup) {
      throw new NotFoundException(`Payment group ${id} not found.`)
    }
    if (!paymentGroup.paymentGroupSettings) {
      throw new BadRequestException(
        `Payment group ${id} has no payment group settings.`
      )
    }

    const paymentIntent =
      (await this.paymentIntentsService.findOneByOrganizationIdAndLivemode(
        paymentIntentId,
        paymentGroup.organizationId,
        paymentGroup.livemode,
        {
          expand: ['customer', 'organization.brandSettings'],
        }
      )) as Prisma.PaymentIntentGetPayload<{
        include: {
          customer: true
          organization: {
            include: {
              brandSettings: true
            }
          }
        }
      }>
    if (!paymentIntent) {
      throw new NotFoundException(
        `Payment intent ${paymentIntentId} not found.`
      )
    }

    if (!paymentIntent.customer) {
      throw new BadRequestException(
        `Payment intent ${paymentIntentId} has no customer.`
      )
    }

    if (paymentGroup.status !== PaymentGroupStatus.OPEN) {
      throw new BadRequestException(
        `Payment group ${id} is not open. Current status is ${paymentGroup.status}.`
      )
    }

    const participants = (await this.deprecatedGetParticipants(
      paymentGroup.id,
      {
        expand: ['customer', 'checkoutSession.lineItems'],
      }
    )) as {
      data: Prisma.PaymentIntentGetPayload<{
        include: {
          customer: true
          checkoutSession: {
            include: {
              lineItems: true
            }
          }
        }
      }>[]
      count: number
    }

    if (
      participants.data.length >=
      paymentGroup.paymentGroupSettings.maxParticipants
    ) {
      throw new BadRequestException(`Payment group ${id} is full.`)
    }

    const owner =
      await this.customersService.findOneByOrganizationIdAndLivemode(
        paymentGroup.customerId,
        paymentIntent.organizationId,
        paymentIntent.livemode
      )
    if (!owner) {
      throw new BadRequestException(
        `Customer ${paymentGroup.customerId} not found. Group has no owner.`
      )
    }

    await this.paymentIntentsService.update(
      paymentIntentId,
      paymentIntent.organization.id,
      paymentIntent.livemode,
      {
        paymentGroupId: paymentGroup.id,
      },
      paymentIntent.customer.id
    )

    if (
      participants.data.length + 1 >=
      paymentGroup.paymentGroupSettings.maxParticipants
    ) {
      await this.enqueueCashbacks(paymentGroup.id)
      this.loggerService.log(
        `Payment group ${paymentGroup.id} has reached maximum participants. Sent to queue for completion`,
        {
          service: PaymentGroupsService.name,
          function: this.deprecatedJoin.name,
          objectId: paymentGroup.id,
        }
      )
    }

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_GROUP_NEW_MEMBER_JOINED,
      new DeprecatedPaymentGroupNewMemberJoinedEvent(
        paymentGroup,
        paymentIntent
      )
    )

    return await this.findOne(id, { expand: ['paymentIntents'] })
  }

  async enqueueCashbacks(paymentGroupId: string) {
    await this.processPaymentGroupQueue.add(
      QueueName.PROCESS_PAYMENT_GROUP,
      paymentGroupId
    )
  }

  async process(id: string) {
    const paymentGroup = (await this.findOne(id, {
      expand: ['paymentIntents', 'orders'],
    })) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentIntents: true
        orders: true
      }
    }>
    if (
      !paymentGroup ||
      (paymentGroup.paymentIntents.length === 0 &&
        paymentGroup.orders.length === 0)
    ) {
      throw new BadRequestException(
        `Payment group ${id} not found or missing orders.`
      )
    }

    const paymentGroupSettings =
      (await this.paymentGroupSettingsService.findOneByPaymentGroupIdAndLivemode(
        id,
        paymentGroup.livemode,
        { expand: ['discountLevels'] }
      )) as Prisma.PaymentGroupSettingsGetPayload<{
        include: {
          discountLevels: true
        }
      }>
    if (!paymentGroupSettings) {
      throw new NotFoundException(
        `Payment group settings not found for payment group ${id}.`
      )
    }

    const discountValue =
      this.getCurrentDiscountLevel(
        paymentGroup.orders.length > 0
          ? paymentGroup.orders.length
          : paymentGroup.paymentIntents.length,
        paymentGroupSettings.discountLevels
      )?.value || 0

    let paymentGroupUpdated: PaymentGroup | undefined

    // If group is successful, we complete it and send cashbacks
    if (paymentGroup.paymentIntents.length > 1) {
      paymentGroupUpdated = await this.deprecatedComplete(
        paymentGroup.id,
        paymentGroup.organizationId,
        paymentGroup.livemode
      )
      const paymentIntentIds: string[] = []
      paymentGroup.paymentIntents.forEach((paymentIntent) => {
        if (paymentIntent.status === PaymentIntentStatus.SUCCEEDED)
          paymentIntentIds.push(paymentIntent.id)
      })

      await this.paymentIntentsService.enqueueCashbacks(
        paymentIntentIds,
        discountValue,
        paymentGroupSettings.discountType
      )

      this.loggerService.log(
        `Payment Intents ${paymentIntentIds} sent to queue.`,
        {
          service: PaymentGroupsService.name,
          function: this.process.name,
          objectId: paymentIntentIds,
        }
      )
    } else if (paymentGroup.orders.length > 1) {
      paymentGroupUpdated = await this.complete(
        paymentGroup.id,
        paymentGroup.organizationId,
        paymentGroup.livemode
      )

      paymentGroup.orders.forEach(async (order) => {
        await this.ordersService.sendCashback(
          order.id,
          discountValue,
          paymentGroupSettings.discountType
        )
      })
    } else {
      // If group is not successful, we expire it
      paymentGroupUpdated = await this.expire(
        paymentGroup.id,
        paymentGroup.organizationId,
        paymentGroup.livemode
      )
    }

    return paymentGroupUpdated
  }

  findOwnerPaymentIntent(
    paymentGroup: PaymentGroup,
    paymentIntents: Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        checkoutSession: {
          include: {
            lineItems: true
          }
        }
      }
    }>[]
  ) {
    const owner = paymentIntents.find(
      (paymentIntent) => paymentIntent.customerId === paymentGroup.customerId
    )
    if (!owner) {
      throw new BadRequestException(
        `Payment group ${paymentGroup.id} has no owner.`
      )
    }
    return owner
  }

  async getCustomers(paymentGroupId: string) {
    const customers = await this.prisma.client.paymentIntent.findMany({
      where: {
        paymentGroupId,
      },
      include: {
        customer: true,
      },
    })
    return customers
  }

  async cancel(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    const paymentGroup = (await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode,
      { expand: ['paymentIntents'] }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentIntents: true
      }
    }>
    if (!paymentGroup) {
      throw new NotFoundException(`Payment group ${id} not found.`)
    }
    if (
      paymentGroup.status !== PaymentGroupStatus.OPEN ||
      paymentGroup.expiresAt < new Date()
    ) {
      throw new BadRequestException(`Payment group ${id} is not cancelable.`)
    }
    if (paymentGroup.paymentIntents.length > 1) {
      throw new BadRequestException(
        `Payment Group ${id} is not cancelable because it has participants.`
      )
    }
    const paymentGroupCanceled = await this.prisma.client.paymentGroup.update({
      where: { id: paymentGroup.id },
      data: {
        status: PaymentGroupStatus.CANCELED,
        canceledAt: new Date(),
        updatedBy,
      },
    })

    this.loggerService.log(
      `Payment group ${paymentGroupCanceled.id} canceled.`,
      {
        service: PaymentGroupsService.name,
        function: this.cancel.name,
        objectId: paymentGroupCanceled.id,
      }
    )

    return paymentGroupCanceled
  }

  async expire(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    const paymentGroup = (await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode,
      { expand: ['paymentIntents', 'customer', 'orders'] }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentIntents: true
        customer: true
        orders: true
      }
    }>
    if (!paymentGroup) {
      throw new NotFoundException(`Payment Group ${id} not found.`)
    }
    if (paymentGroup.status !== PaymentGroupStatus.OPEN) {
      throw new BadRequestException(
        `Payment group ${id} is already canceled, expired or completed.`
      )
    }
    if (paymentGroup.expiresAt > new Date()) {
      throw new BadRequestException(`Payment group ${id} is still in progress.`)
    }
    if (
      paymentGroup.paymentIntents.length > 1 ||
      paymentGroup.orders.length > 1
    ) {
      throw new BadRequestException(
        `Payment Group ${id} cannot be expired because it has participants.`
      )
    }

    const paymentGroupUpdated = await this.prisma.client.paymentGroup.update({
      where: {
        id,
        organizationId,
        livemode,
      },
      data: {
        status: PaymentGroupStatus.EXPIRED,
        updatedBy,
      },
    })

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_GROUP_EXPIRED,
      new PaymentGroupExpiredEvent(paymentGroupUpdated)
    )

    return paymentGroupUpdated
  }

  async deprecatedComplete(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    const paymentGroup = (await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode,
      { expand: ['customer'] }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        customer: true
      }
    }>
    if (!paymentGroup) {
      throw new NotFoundException(`Payment group ${id} not found.`)
    }
    if (paymentGroup.status !== PaymentGroupStatus.OPEN) {
      throw new BadRequestException(
        `Payment group ${id} is already canceled, expired or completed.`
      )
    }
    if (paymentGroup.expiresAt > new Date()) {
      throw new BadRequestException(`Payment group ${id} is still in progress.`)
    }

    const participants = (await this.deprecatedGetParticipants(
      paymentGroup.id,
      {
        expand: ['customer', 'checkoutSession.lineItems'],
      }
    )) as {
      data: Prisma.PaymentIntentGetPayload<{
        include: {
          customer: true
          checkoutSession: {
            include: {
              lineItems: true
            }
          }
        }
      }>[]
      count: number
    }

    if (participants.data.length < 2) {
      throw new BadRequestException(
        `Payment group ${id} cannot be completed because it has no participants.`
      )
    }

    const paymentGroupUpdated = await this.prisma.client.paymentGroup.update({
      where: { id: paymentGroup.id },
      data: {
        status: PaymentGroupStatus.COMPLETED,
        completedAt: new Date(),
        updatedBy,
      },
    })

    this.loggerService.log(`Payment group ${paymentGroup.id} completed.`, {
      service: PaymentGroupsService.name,
      function: this.deprecatedComplete.name,
      objectId: paymentGroup.id,
    })

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_GROUP_SUCCEEDED,
      new PaymentGroupSucceededEvent(paymentGroupUpdated)
    )

    return paymentGroupUpdated
  }

  async complete(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    const paymentGroup = (await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode,
      { expand: ['customer'] }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        customer: true
      }
    }>
    if (!paymentGroup) {
      throw new NotFoundException(`Payment group ${id} not found.`)
    }
    if (paymentGroup.status !== PaymentGroupStatus.OPEN) {
      throw new BadRequestException(
        `Payment group ${id} is already canceled, expired or completed.`
      )
    }
    if (paymentGroup.expiresAt > new Date()) {
      throw new BadRequestException(`Payment group ${id} is still in progress.`)
    }

    const participants = await this.ordersService.findAllByPaymentGroup(
      paymentGroup.id
    )

    if (participants.data.length < 2) {
      throw new BadRequestException(
        `Group ${id} cannot be completed because it has no participants.`
      )
    }

    const paymentGroupUpdated = await this.prisma.client.paymentGroup.update({
      where: { id: paymentGroup.id },
      data: {
        status: PaymentGroupStatus.COMPLETED,
        completedAt: new Date(),
        updatedBy,
      },
    })

    this.loggerService.log(`Payment group ${paymentGroup.id} completed.`, {
      service: PaymentGroupsService.name,
      function: this.complete.name,
      objectId: paymentGroup.id,
    })

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_GROUP_SUCCEEDED,
      new PaymentGroupSucceededEvent(paymentGroupUpdated)
    )

    return paymentGroupUpdated
  }

  async validate(
    code: string,
    validatePaymentGroupDto: ValidatePaymentGroupDto
  ) {
    const paymentGroup = (await this.findOneByCode(code, {
      expand: ['paymentIntents.customer', 'customer'],
    })) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentIntents: {
          include: {
            customer: true
          }
        }
      }
    }>

    if (!paymentGroup) {
      throw new NotFoundException(
        `Group ${code} not found.`,
        PaymentGroupValidationErrors.NOT_FOUND
      )
    }

    if (
      paymentGroup.status !== PaymentGroupStatus.OPEN ||
      paymentGroup.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        `Group ${code} is already canceled, expired or completed.`,
        PaymentGroupValidationErrors.COMPLETED_EXPIRED_CANCELED
      )
    }

    const paymentGroupSettings =
      (await this.paymentGroupSettingsService.findOneByPaymentGroupIdAndLivemode(
        paymentGroup.id,
        paymentGroup.livemode,
        { expand: ['discountLevels'] }
      )) as Prisma.PaymentGroupSettingsGetPayload<{
        include: {
          discountLevels: true
        }
      }>
    if (!paymentGroupSettings) {
      throw new NotFoundException(
        `Group settings not found for payment group ${code}.`
      )
    }
    if (
      paymentGroupSettings &&
      paymentGroup.paymentIntents.length >= paymentGroupSettings.maxParticipants
    ) {
      throw new BadRequestException(
        `Maximum number of participants reached for group ${code}.`,
        PaymentGroupValidationErrors.MAX_PARTICIPANTS_REACHED
      )
    }

    if (validatePaymentGroupDto.customerEmail) {
      for (const paymentIntent of paymentGroup.paymentIntents) {
        if (
          paymentIntent.customer?.emailAddress ===
          validatePaymentGroupDto.customerEmail
        ) {
          throw new BadRequestException(
            `Customer ${validatePaymentGroupDto.customerEmail} is already in group ${code}.`,
            PaymentGroupValidationErrors.EMAIL_ALREADY_USED
          )
        }
      }
    }

    if (validatePaymentGroupDto.amount) {
      if (
        validatePaymentGroupDto.amount < paymentGroupSettings.minPurchaseValue
      ) {
        throw new BadRequestException(
          `Amount ${validatePaymentGroupDto.amount} is below the minimum purchase value of ${paymentGroupSettings.minPurchaseValue}.`,
          PaymentGroupValidationErrors.AMOUNT_TOO_LOW
        )
      }
    }

    const currentDiscountLevel = this.getCurrentDiscountLevel(
      paymentGroup.paymentIntents.length + 1, // + 1 because we are looking for the discount level reach with new participant
      paymentGroupSettings.discountLevels
    )

    return {
      ...paymentGroupSettings,
      ...paymentGroup,
      currentDiscountLevel,
    }
  }

  getCurrentDiscountLevel(
    participantCount: number,
    discountLevels: DiscountLevel[]
  ) {
    if (participantCount === 1) participantCount = 2
    for (let i = discountLevels.length - 1; i >= 0; i--) {
      if (participantCount >= discountLevels[i].participantsToUnlock) {
        return discountLevels[i]
      }
    }
    return null
  }

  getMaxDiscountLevel(discountLevels: DiscountLevel[]) {
    return discountLevels[discountLevels.length - 1]
  }

  async findAllMidWayAndNotNotified() {
    const now = new Date()

    const paymentGroups = await this.prisma.client.paymentGroup.findMany({
      where: {
        midExpireAt: {
          lte: now, // Less than current time
        },
        reminderEmailSent: ReminderEmailSentStatus.NOT_SENT,
        AND: {
          status: PaymentGroupStatus.OPEN,
        },
      },
      include: {
        _count: {
          select: {
            paymentIntents: true,
          },
        },
        paymentIntents: {
          select: {
            id: true,
          },
        },
      },
    })
    const filteredGroups = paymentGroups.filter(
      (group) => group._count.paymentIntents === 1
    ) // to filter the groups that have only one participant
    return filteredGroups
  }

  async findAllThreeDaysAfterStartAndNotNotified() {
    const now = new Date()

    const paymentGroups = await this.prisma.client.paymentGroup.findMany({
      where: {
        jPlus3StartAt: {
          lte: now, // Less than current time
        },
        reminderEmailSent: ReminderEmailSentStatus.NOT_SENT,
        status: PaymentGroupStatus.OPEN,
      },
      include: {
        _count: {
          select: {
            paymentIntents: true,
          },
        },
        paymentIntents: {
          select: {
            id: true,
          },
        },
      },
    })

    const filteredGroups = paymentGroups.filter(
      (group) => group._count.paymentIntents === 1
    ) // to filter the groups that have only one participant
    return filteredGroups
  }

  async findAllTwoDaysBeforeEndAndNotNotified() {
    const now = new Date()

    const paymentGroups = await this.prisma.client.paymentGroup.findMany({
      where: {
        jMinus2ExpireAt: {
          lte: now,
        },
        reminderEmailSent: ReminderEmailSentStatus.DAY3_SENT,
        status: PaymentGroupStatus.OPEN,
      },
      include: {
        _count: {
          select: {
            paymentIntents: true,
          },
        },
        paymentIntents: {
          select: {
            id: true,
          },
        },
      },
    })

    const filteredGroups = paymentGroups.filter(
      (group) => group._count.paymentIntents === 1
    ) // to filter the groups that have only one participant
    return filteredGroups
  }

  async sendReminderEmail(
    paymentGroupId: string,
    reminderEmailSentStatus: ReminderEmailSentStatus = ReminderEmailSentStatus.MIDWAY_SENT
  ) {
    const paymentGroup = (await this.findOne(paymentGroupId, {
      expand: [
        'customer',
        'organization.brandSettings',
        'paymentGroupSettings.discountLevels',
        'paymentIntents',
      ],
    })) as Prisma.PaymentGroupGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
        paymentIntents: true
      }
    }>

    if (!paymentGroup) {
      throw new NotFoundException(
        `PaymentGroup with id ${paymentGroupId} not found`
      )
    }
    const paymentGroupSettings = paymentGroup.paymentGroupSettings
    if (!paymentGroupSettings) {
      throw new NotFoundException(
        `PaymentGroupSettings with id ${paymentGroupId} not found`
      )
    }

    const creator = paymentGroup.customer
    if (!creator) {
      throw new NotFoundException(
        `Creator of PaymentGroup ${paymentGroupId} not found`
      )
    }

    const organization = paymentGroup.organization
    if (!organization) {
      throw new NotFoundException(
        `Organization of PaymentGroup ${paymentGroupId} not found`
      )
    }

    // Calculate the remaining time until the group expires
    const remainingTime = this.calculateRemainingTime(paymentGroup.expiresAt)

    // format expiresAt & createdAt
    const expiresAt = formatDateTime(paymentGroup.expiresAt, creator.locale)
    const createdAt = formatDateTo2Digits(
      paymentGroup.createdAt,
      creator.locale
    )

    // Calculate the discount & max discount
    const discountValue = paymentGroupSettings.discountLevels[0].value
    const maxDiscountValue =
      paymentGroupSettings.discountLevels[
        paymentGroupSettings.discountLevels.length - 1
      ].value
    const discount = this.formatDiscount(
      discountValue,
      paymentGroupSettings.discountType,
      creator.locale,
      'EUR'
    )
    const maxDiscount = this.formatDiscount(
      maxDiscountValue,
      paymentGroupSettings.discountType,
      creator.locale,
      'EUR'
    )
    const discountAmount =
      this.paymentIntentsService.deprecatedComputeCashbackAmount(
        paymentGroup.paymentIntents[0].amount,
        discountValue,
        paymentGroupSettings.discountType
      )
    const maxDiscountAmount =
      this.paymentIntentsService.deprecatedComputeCashbackAmount(
        paymentGroup.paymentIntents[0].amount,
        maxDiscountValue,
        paymentGroupSettings.discountType
      )

    // Get brand colors
    const currentBrandSettings = paymentGroup.organization.brandSettings.find(
      (brandSetting) => brandSetting.livemode === paymentGroup.livemode
    )
    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )
    const dynamicTemplateData = {
      subject: this.getEmailSubjectByType(
        creator.locale || Locale.fr_FR,
        reminderEmailSentStatus
      ),
      colors: currentBrandSettings?.color ? colors : null,
      discountType: paymentGroupSettings.discountType,
      creatorName: creator.firstName,
      organization,
      paymentGroup: {
        ...paymentGroup,
        shareUrl: `${this.configService.get<string>(
          'MY_KOHORT_APP_URL',
          ''
        )}/${creator?.locale || Locale.fr_FR}/pg/${paymentGroup.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_GROUP_MIDWAY_REMINDER}&utm_content=cta_share_button`,
      },
      customer: creator,
      creatorDiscountAmount: this.formatCurrency(
        discountAmount,
        creator.locale || Locale.fr_FR,
        paymentGroup.paymentIntents[0].currency
      ),
      maxDiscountAmount: this.formatCurrency(
        maxDiscountAmount,
        creator.locale || Locale.fr_FR,
        paymentGroup.paymentIntents[0].currency
      ),
      remainingTime,
      discount,
      expiresAt,
      createdAt,
      maxDiscount,
      reminderEmailSentStatus,
      staticData: translation(
        creator.locale || Locale.fr_FR,
        this.getTranslationKeyByType(reminderEmailSentStatus)
      ),
    }

    const transactionEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        organization.id,
        paymentGroup.livemode,
        EmailType.GROUP_REMINDER,
        creator.locale || Locale.fr_FR
      )

    // Enqueue the email
    await this.emailsService.enqueue({
      html: transactionEmail?.body || '',
      fromEmail: transactionEmail?.fromEmail || '',
      fromName: organization.fromEmailName || undefined,
      to: creator.emailAddress,
      dynamicTemplateData: dynamicTemplateData,
      subject: transactionEmail?.subject || '',
    })

    if (
      creator.phoneNumber &&
      paymentGroup.paymentGroupSettings?.whatsappCommunication
    ) {
      const isProduction = this.configService.get('NODE_ENV') === NODE_ENV_PROD
      const locale = creator.locale || Locale.fr_FR

      const organizationName = paymentGroup.organization.name || ''
      const formattedDiscount = this.formatCurrency(
        maxDiscountAmount,
        creator.locale || Locale.fr_FR,
        paymentGroup.paymentIntents[0].currency
      )
      const recipientPhoneNumber = formatPhoneNumber(creator.phoneNumber)
      const appUrl = this.configService.get<string>('MY_KOHORT_APP_URL', '')

      const shortUrl = `${appUrl}/r/${encodeUrlParams(locale, paymentGroup.shareId, true)}`
      this.loggerService.log(
        `Sending WhatsApp messages to customer with ID: ${creator.id}`,
        {
          service: PaymentIntentsService.name,
          method: this.sendReminderEmail.name,
          object: paymentGroup.id,
          emailType: reminderEmailSentStatus,
        }
      )

      await this.whatsappService.enqueue({
        recipientPhoneNumber,
        templateName: getTemplateName('reminder', isProduction),
        locale,
        variables: [organizationName, formattedDiscount],
      })
      await this.whatsappService.enqueue({
        recipientPhoneNumber,
        templateName: getTemplateName('forward', isProduction),
        locale,
        variables: [
          paymentGroup.shareId,
          formatLink(paymentGroup.organization.websiteUrl || ''),
          formattedDiscount,
          `${shortUrl}`,
        ],
      })

      this.loggerService.log(
        `Successfully sent WhatsApp messages to customer with ID: ${creator.id}`,
        {
          service: PaymentIntentsService.name,
          method: this.sendReminderEmail.name,
          object: paymentGroup.id,
          emailType: reminderEmailSentStatus,
        }
      )
    }

    await this.prisma.client.paymentGroup.update({
      where: { id: paymentGroup.id },
      data: { reminderEmailSent: reminderEmailSentStatus },
    })
  }
  private getEmailSubjectByType(
    locale: string,
    emailType: ReminderEmailSentStatus
  ): string {
    switch (emailType) {
      case ReminderEmailSentStatus.MIDWAY_SENT:
        return (
          translation(
            locale,
            'paymentGroupMidwayReminder',
            'subject'
          ).toString() || ''
        )
      case ReminderEmailSentStatus.DAY3_SENT:
        return (
          translation(
            locale,
            'paymentGroupDay3Reminder',
            'subject'
          ).toString() || ''
        )
      case ReminderEmailSentStatus.DAY2_BEFORE_END_SENT:
        return (
          translation(
            locale,
            'paymentGroupDay2BeforeEndReminder',
            'subject'
          ).toString() || ''
        )
      default:
        return (
          translation(
            locale,
            'paymentGroupMidwayReminder',
            'subject'
          ).toString() || ''
        )
    }
  }

  private getTranslationKeyByType(emailType: ReminderEmailSentStatus): string {
    switch (emailType) {
      case ReminderEmailSentStatus.MIDWAY_SENT:
        return 'paymentGroupMidwayReminder'
      case ReminderEmailSentStatus.DAY3_SENT:
        return 'paymentGroupDay3Reminder'
      case ReminderEmailSentStatus.DAY2_BEFORE_END_SENT:
        return 'paymentGroupDay2BeforeEndReminder'
      default:
        return 'paymentGroupMidwayReminder'
    }
  }
  getNewlyUnlockedDiscountLevel(
    participantCount: number,
    discountLevels: DiscountLevel[]
  ) {
    for (const level of discountLevels) {
      if (participantCount === level.participantsToUnlock) {
        return level
      }
    }
    return null // Return null if the current participant count doesn't exactly match any unlock threshold
  }
  getNextLevel(totalParticipants: number, discountLevels: DiscountLevel[]) {
    const sortedDiscountLevels = discountLevels.sort(
      (a, b) => a.participantsToUnlock - b.participantsToUnlock
    )

    for (let i = 0; i < sortedDiscountLevels.length; i++) {
      if (totalParticipants < sortedDiscountLevels[i].participantsToUnlock) {
        return sortedDiscountLevels[i]
      }
    }

    return sortedDiscountLevels[0]
  }

  formatCurrency(amount: number, locale: Locale, currency: Currency) {
    return new Intl.NumberFormat(replaceUnderscoreWithHyphen(locale), {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  formatDiscount(
    discountValue: number,
    discountType: DiscountType,
    locale: Locale,
    currency: Currency
  ) {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discountValue}%`
    } else {
      return this.formatCurrency(discountValue * 100, locale, currency)
    }
  }

  calculateRemainingTime(expiresAt: Date) {
    const now = new Date()
    const expiresTime = new Date(expiresAt).getTime()
    const nowTime = now.getTime()

    // Calculate the difference in milliseconds
    const timeDiff = expiresTime - nowTime

    // Convert milliseconds into days, hours, and minutes
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    // Build the formatted time string
    let formattedTime = ''
    if (days > 0) {
      formattedTime = `${days}jour` + (days > 1 ? 's' : '')
    } else if (hours > 0) {
      formattedTime = `${hours} heure` + (hours > 1 ? 's' : '')
    } else if (hours <= 0 && days <= 0) {
      formattedTime += `${minutes} minutes`
    } else {
      formattedTime = `${hours}h${minutes}`
    }

    return formattedTime
  }
  async deprecatedSendEmailsOnDiscountLevelUnlocked(
    paymentGroup: Prisma.PaymentGroupGetPayload<{
      include: {
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
      }
    }>,
    paymentIntent: Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
      }
    }>
  ) {
    if (!paymentGroup.paymentGroupSettings) {
      throw new BadRequestException(
        `Payment group ${paymentGroup.id} has no payment group settings.`
      )
    }
    if (!paymentIntent.customer) {
      throw new BadRequestException(
        `Payment intent ${paymentIntent.id} has no customer.`
      )
    }

    const participants = (await this.deprecatedGetParticipants(
      paymentGroup.id,
      {
        expand: ['customer', 'checkoutSession.lineItems'],
      }
    )) as {
      data: Prisma.PaymentIntentGetPayload<{
        include: {
          customer: true
          checkoutSession: {
            include: {
              lineItems: true
            }
          }
        }
      }>[]
      count: number
    }

    const totalMembers = participants.data.length
    const owner =
      await this.customersService.findOneByOrganizationIdAndLivemode(
        paymentGroup.customerId,
        paymentIntent.organizationId,
        paymentIntent.livemode
      )
    if (!owner) {
      throw new BadRequestException(
        `Customer ${paymentGroup.customerId} not found. Group has no owner.`
      )
    }
    const DiscountLevelUnlocked = this.getNewlyUnlockedDiscountLevel(
      totalMembers,
      paymentGroup.paymentGroupSettings.discountLevels
    )
    const nextLevel = this.getNextLevel(
      totalMembers,
      paymentGroup.paymentGroupSettings.discountLevels
    )

    if (DiscountLevelUnlocked) {
      const discountValueUnlocked = DiscountLevelUnlocked.value
      const discountUnlocked = this.formatDiscount(
        discountValueUnlocked,
        paymentGroup.paymentGroupSettings.discountType,
        paymentIntent.customer.locale,
        paymentIntent.currency
      )

      const moreFriendsNeeded = nextLevel?.participantsToUnlock - totalMembers
      const nextDiscountLevel = this.formatDiscount(
        nextLevel?.value || 0,
        paymentGroup.paymentGroupSettings.discountType,
        paymentIntent.customer.locale,
        paymentIntent.currency
      )
      const participantsExceptNewJoiner = participants.data.filter(
        (participant) =>
          participant.customerEmail !== paymentIntent.customerEmail &&
          participant.customerEmail !== null
      )

      const currentBrandSettings =
        paymentIntent.organization.brandSettings.find(
          (brandSetting) => brandSetting.livemode === paymentGroup.livemode
        )
      const colors = getColorVariants(
        currentBrandSettings?.color || PRIMARY_COLOR
      )
      for (const participant of participantsExceptNewJoiner) {
        if (participant.customerEmail) {
          const transactionEmail =
            await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
              paymentIntent.organizationId,
              paymentIntent.livemode,
              EmailType.NEW_LEVEL_UNLOCKED,
              paymentIntent.customer.locale || Locale.fr_FR
            )
          await this.emailsService.enqueue({
            to: participant.customerEmail,
            fromEmail: transactionEmail?.fromEmail || '',
            fromName: paymentIntent.organization.fromEmailName || undefined,
            subject: transactionEmail?.subject || '',
            html: transactionEmail?.body || '',
            dynamicTemplateData: {
              subject:
                translation(
                  participant.customer?.locale || Locale.fr_FR,
                  'paymentGroupNewUnlockedLevel',
                  'subject'
                ).toString() || '',
              colors: currentBrandSettings?.color ? colors : null,
              newMemberName: `${paymentIntent.customer.firstName} ${paymentIntent.customer.lastName ? paymentIntent.customer.lastName[0] + '.' : ''}`,
              creatorName: `${owner.firstName} ${owner.lastName ? owner.lastName[0] + '.' : ''}`,
              customer: participant.customer,
              organization: paymentIntent.organization,
              totalMembers,
              moreFriendsNeeded,
              nextDiscountLevel,
              discountType:
                paymentGroup.paymentGroupSettings.discountType ===
                DiscountType.AMOUNT
                  ? DiscountType.AMOUNT
                  : null,
              discountUnlocked,
              paymentGroup: {
                ...paymentGroup,
                shareUrl: `${this.configService.get<string>(
                  'MY_KOHORT_APP_URL',
                  ''
                )}/${participant.customer?.locale || Locale.fr_FR}/pg/${paymentGroup.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_GROUP_NEW_LEVEL_UNLOCKED}&utm_content=cta_share_button`,
              },
              staticData: translation(
                participant.customer?.locale || Locale.fr_FR,
                'paymentGroupNewUnlockedLevel'
              ),
            },
          })
        }
      }
      this.loggerService.log(
        `Payment group ${paymentGroup.id} new level unlocked email sent.`,
        {
          service: PaymentGroupsService.name,
          function: this.deprecatedJoin.name,
          objectId: paymentGroup.id,
        }
      )
    }
  }

  async sendEmailsOnDiscountLevelUnlocked(
    paymentGroup: Prisma.PaymentGroupGetPayload<{
      include: {
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
      }
    }>,
    order: Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
      }
    }>
  ) {
    if (!paymentGroup.paymentGroupSettings) {
      throw new BadRequestException(
        `Payment group ${paymentGroup.id} has no payment group settings.`
      )
    }
    if (!order.customer) {
      throw new BadRequestException(
        `Payment intent ${order.id} has no customer.`
      )
    }

    const participants = (await this.ordersService.findAllByPaymentGroup(
      paymentGroup.id,
      { expand: ['customer'] }
    )) as {
      data: Prisma.OrderGetPayload<{
        include: {
          customer: true
        }
      }>[]
      count: number
    }

    const totalMembers = participants.data.length
    const owner =
      await this.customersService.findOneByOrganizationIdAndLivemode(
        paymentGroup.customerId,
        order.organizationId,
        order.livemode
      )
    if (!owner) {
      throw new BadRequestException(
        `Customer ${paymentGroup.customerId} not found. Group has no owner.`
      )
    }
    const DiscountLevelUnlocked = this.getNewlyUnlockedDiscountLevel(
      totalMembers,
      paymentGroup.paymentGroupSettings.discountLevels
    )
    const nextLevel = this.getNextLevel(
      totalMembers,
      paymentGroup.paymentGroupSettings.discountLevels
    )

    if (DiscountLevelUnlocked) {
      const discountValueUnlocked = DiscountLevelUnlocked.value
      const discountUnlocked = this.formatDiscount(
        discountValueUnlocked,
        paymentGroup.paymentGroupSettings.discountType,
        order.customer.locale,
        order.currency
      )

      const moreFriendsNeeded = nextLevel?.participantsToUnlock - totalMembers
      const nextDiscountLevel = this.formatDiscount(
        nextLevel?.value || 0,
        paymentGroup.paymentGroupSettings.discountType,
        order.customer.locale,
        order.currency
      )
      const participantsExceptNewJoiner = participants.data.filter(
        (participant) =>
          participant.customerEmail !== order.customerEmail &&
          participant.customerEmail !== null
      )

      const currentBrandSettings = order.organization.brandSettings.find(
        (brandSetting) => brandSetting.livemode === paymentGroup.livemode
      )
      const colors = getColorVariants(
        currentBrandSettings?.color || PRIMARY_COLOR
      )
      for (const participant of participantsExceptNewJoiner) {
        if (participant.customerEmail) {
          const transactionEmail =
            await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
              order.organizationId,
              order.livemode,
              EmailType.NEW_LEVEL_UNLOCKED,
              order.customer.locale || Locale.fr_FR
            )
          await this.emailsService.enqueue({
            to: participant.customerEmail,
            fromEmail: transactionEmail?.fromEmail || '',
            fromName: order.organization.fromEmailName || undefined,
            subject: transactionEmail?.subject || '',
            html: transactionEmail?.body || '',
            dynamicTemplateData: {
              subject:
                translation(
                  participant.customer?.locale || Locale.fr_FR,
                  'paymentGroupNewUnlockedLevel',
                  'subject'
                ).toString() || '',
              colors: currentBrandSettings?.color ? colors : null,
              newMemberName: `${order.customer.firstName} ${order.customer.lastName ? order.customer.lastName[0] + '.' : ''}`,
              creatorName: `${owner.firstName} ${owner.lastName ? owner.lastName[0] + '.' : ''}`,
              customer: participant.customer,
              organization: order.organization,
              totalMembers,
              moreFriendsNeeded,
              nextDiscountLevel,
              discountType:
                paymentGroup.paymentGroupSettings.discountType ===
                DiscountType.AMOUNT
                  ? DiscountType.AMOUNT
                  : null,
              discountUnlocked,
              paymentGroup: {
                ...paymentGroup,
                shareUrl: `${this.configService.get<string>(
                  'MY_KOHORT_APP_URL',
                  ''
                )}/${participant.customer?.locale || Locale.fr_FR}/pg/${paymentGroup.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_GROUP_NEW_LEVEL_UNLOCKED}&utm_content=cta_share_button`,
              },
              staticData: translation(
                participant.customer?.locale || Locale.fr_FR,
                'paymentGroupNewUnlockedLevel'
              ),
            },
          })
        }
      }
      this.loggerService.log(
        `Payment group ${paymentGroup.id} new level unlocked email sent.`,
        {
          service: PaymentGroupsService.name,
          function: this.deprecatedJoin.name,
          objectId: paymentGroup.id,
        }
      )
    }
  }

  async requestReferralHelp(
    id: string,
    helpPaymentGroupDto: HelpPaymentGroupDto
  ) {
    const paymentGroup = (await this.findOne(id, {
      expand: ['organization', 'customer'],
    })) as Prisma.PaymentGroupGetPayload<{
      include: {
        organization: true
        customer: true
      }
    }>

    if (!paymentGroup) {
      throw new NotFoundException(`Payment group ${id} not found.`)
    }

    const groupLink = `${this.configService.get<string>(
      'MY_KOHORT_APP_URL',
      ''
    )}/pg/${paymentGroup.shareId}`

    const slackMessage =
      `🔍 *Referral Help Request*\n\n` +
      `*Organization:* ${paymentGroup.organization.name}\n` +
      `*Payment Group:* ${paymentGroup.shareId}\n` +
      `*Group Link:* ${groupLink}\n\n` +
      helpPaymentGroupDto.message
        ? `*Message:* ${helpPaymentGroupDto.message}\n\n`
        : '' + `<@${MARTIN_USER_ID}> <@${AYMERIC_USER_ID}>`

    try {
      await this.slackService.enqueue({
        text: slackMessage,
        webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
      })

      this.loggerService.log(
        `Referral help request sent for payment group ${paymentGroup.id}`,
        {
          service: PaymentGroupsService.name,
          function: 'requestReferralHelp',
          objectId: paymentGroup.id,
        }
      )

      return {
        success: true,
        message: 'Help request sent successfully',
      }
    } catch (error) {
      this.loggerService.error(
        'Failed to send referral help request to Slack',
        error.stack,
        {
          service: PaymentGroupsService.name,
          function: 'requestReferralHelp',
          objectId: paymentGroup.id,
        }
      )
      throw new BadRequestException('Failed to send help request')
    }
  }
}
