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
  Customer,
  DiscountType,
  EmailType,
  Locale,
  Order,
  OrderStatus,
  Organization,
  Prisma,
  RiskLevel,
} from '@prisma/client'
import { Queue } from 'bull'
import { randomBytes } from 'crypto'
import { CustomPrismaService } from 'nestjs-prisma'

import { AmbassadorService } from '../ambassador/ambassador.service'
import { VAT_RATE } from '../common/constants/bill-pdf.constants'
import { PRIMARY_COLOR } from '../common/constants/colors.constants'
import {
  AMBASSADOR_CODE_PREFIX,
  ORDER_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { ORDER_RELATIONS } from '../common/constants/database-relation-fields.constants'
import {
  NODE_ENV_PROD,
  SYSTEM,
} from '../common/constants/miscellaneous.constants'
import {
  EMAIL_PROVIDER,
  TEMPLATE_DISCOUNT_SUCCESS,
  TEMPLATE_KOHORT_REF_PAYMENT_CASHBACK_WITHDRAWN,
  TEMPLATE_KOHORT_REF_PAYMENT_IBAN_REQUEST,
  TEMPLATE_KOHORT_REF_PAYMENT_SUCCESS,
  TEMPLATE_PAYMENT_CAPTURED_NO_DISCOUNT,
} from '../common/constants/transaction-emails.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { translation } from '../common/locales/locale'
import calculateRemainingTime from '../common/utils/calculate-remaining-time'
import getColorVariants from '../common/utils/color-variants'
import encodeUrlParams from '../common/utils/encode-url'
import { getTemplateName } from '../common/utils/find-whatsapp-template-name'
import { formatDiscount } from '../common/utils/format-discount'
import { formatLink } from '../common/utils/format-link'
import { formatPhoneNumber } from '../common/utils/format-phone-number'
import { formatWebsiteUrl } from '../common/utils/format-website-url'
import { replaceUnderscoreWithHyphen } from '../common/utils/replace-undescore-with-hyphen'
import { CustomersService } from '../customers/customers.service'
import { EmailsService } from '../email/emails.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackService } from '../slack/slack.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto'
import { OrderCashbackAvailableEvent } from './events/order-cashback-available.event'
import { OrderCreatedEvent } from './events/order-created.event'

@Injectable()
export class OrdersService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    @Inject(forwardRef(() => PaymentGroupsService))
    private readonly paymentGroupsService: PaymentGroupsService,
    private readonly paymentGroupSettingsService: PaymentGroupSettingsService,
    private readonly customersService: CustomersService,
    private readonly loggerService: DefaultScopedLoggerService,
    private readonly transactionalEmailsService: TransactionalEmailsService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService,
    @InjectQueue(QueueName.WITHDRAW_CASHBACK)
    private withdrawCashbackQueue: Queue,
    private readonly whatsappService: WhatsappService,
    private readonly eventEmitter: EventEmitter2,
    private readonly organizationsService: OrganizationsService,
    private readonly ambassadorService: AmbassadorService,
    private readonly slackService: SlackService
  ) {}

  async create(
    organization: Organization,
    livemode: boolean,
    createOrderDto: CreateOrderDto,
    createdBy: string = SYSTEM
  ) {
    if (createOrderDto.clientReferenceId) {
      const order =
        await this.findOneByClientReferenceIdOrganizationIdAndLivemode(
          createOrderDto.clientReferenceId,
          organization.id,
          livemode
        )
      if (order) {
        throw new BadRequestException(
          `Order with client reference id ${createOrderDto.clientReferenceId} already exists.`
        )
      }
    }

    const paymentGroupSettings =
      await this.paymentGroupSettingsService.findOneByOrganizationIdAndLivemode(
        organization.id,
        livemode
      )
    if (!paymentGroupSettings) {
      throw new BadRequestException(
        `Payment Group Settings not found for organization ${organization.id}.`
      )
    }

    if (createOrderDto.amount < paymentGroupSettings.minPurchaseValue) {
      throw new BadRequestException(
        `The minimum purchase value is ${paymentGroupSettings.minPurchaseValue}`
      )
    }

    await this.customersService.validate(
      createOrderDto.customerEmail ?? null,
      createOrderDto.customerId ?? null,
      organization.id,
      livemode
    )

    const customer = await this.createCustomer(
      createOrderDto,
      organization.id,
      livemode
    )

    let paymentGroupId: string | null = null
    if (createOrderDto.paymentGroupShareId) {
      paymentGroupId = (
        await this.paymentGroupsService.validate(
          createOrderDto.paymentGroupShareId,
          { customerEmail: createOrderDto.customerEmail }
        )
      ).id
    }

    const id = this.idsService.createId(ORDER_DATABASE_PREFIX)

    if (createOrderDto.locale === Locale.en_GB) {
      createOrderDto.locale = Locale.en_US
    }

    let order: Order | null = await this.prisma.client.order.create({
      data: {
        ...createOrderDto,
        paymentGroupId,
        id,
        livemode,
        organizationId: organization.id,
        customerId: customer.id,
        createdBy,
        updatedBy: createdBy,
      },
    })

    if (order.paymentGroupId?.startsWith(AMBASSADOR_CODE_PREFIX)) {
      await this.linktoAmbassador(order.id, order.paymentGroupId)
    } else {
      await this.createOrJoinGroup(
        order.id,
        order.organizationId,
        order.livemode
      )
    }

    // Another find here to return the updated order
    order = await this.findOne(order.id)
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found.`)
    }

    this.eventEmitter.emit(
      KohortPayEvent.ORDER_CREATED,
      new OrderCreatedEvent(order)
    )

    return order
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(ORDER_RELATIONS, query?.expand)

    const order = await this.prisma.client.order.findUnique({
      where: {
        id,
      },
      include,
    })

    return order
  }

  async findWithAmbassador30DaysAgo() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return await this.prisma.client.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
          lt: new Date(thirtyDaysAgo.getTime() + 24 * 60 * 60 * 1000),
        },
        ambassadorId: { not: null },
      },
    })
  }

  async findOneByClientReferenceIdOrganizationIdAndLivemode(
    clientReferenceId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const order = await this.prisma.client.order.findFirst({
      where: {
        clientReferenceId,
        organizationId,
        livemode,
      },
      orderBy: { createdAt: 'desc' },
    })

    return order
  }

  async findOneByClientReferenceId(
    clientReferenceId: string,
    query?: QueryDto
  ) {
    const include = formatExpand(ORDER_RELATIONS, query?.expand)
    return await this.prisma.client.order.findFirst({
      where: { clientReferenceId },
      orderBy: { createdAt: 'desc' },
      include,
    })
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(ORDER_RELATIONS, query?.expand)
    const order = await this.prisma.client.order.findUnique({
      where: {
        id,
        organizationId,
        livemode,
      },
      include,
    })

    return order
  }

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(ORDER_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(Prisma.OrderScalarFieldEnum, query?.orderBy)
    const search = formatSearch(Prisma.OrderScalarFieldEnum, query?.search)
    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.order.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: { organizationId, livemode, ...search },
      }),
      this.prisma.client.order.count({
        where: { organizationId, livemode, ...search },
      }),
    ])
    return { data, count }
  }

  async findAllByPaymentGroup(paymentGroupId: string, query?: QueryDto) {
    const include = formatExpand(ORDER_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(Prisma.OrderScalarFieldEnum, query?.orderBy)
    const search = formatSearch(Prisma.OrderScalarFieldEnum, query?.search)

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.order.findMany({
        where: {
          paymentGroupId,
          ...search,
        },
        include,
        orderBy,
        skip: query?.skip,
        take: query?.take,
      }),
      this.prisma.client.order.count({
        where: { paymentGroupId, ...search },
      }),
    ])

    return { data, count }
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.order.update({
      where: {
        id,
        organizationId,
        livemode,
      },
      data: {
        status,
        updatedBy,
      },
    })
  }

  async updateRiskLevel(
    id: string,
    organizationId: string,
    livemode: boolean,
    riskLevel: RiskLevel,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.order.update({
      where: {
        id,
        organizationId,
        livemode,
      },
      data: {
        riskLevel,
        updatedBy,
      },
    })
  }

  async linktoAmbassador(orderId: string, referralCode: string) {
    const ambassador = await this.ambassadorService.findOneByCode(referralCode)
    if (!ambassador) {
      throw new NotFoundException(
        `Ambassador with code ${referralCode} not found.`
      )
    }

    await this.prisma.client.order.update({
      where: {
        id: orderId,
      },
      data: {
        ambassadorId: ambassador.id,
      },
    })

    const text = `:money_with_wings: Ambassador ${ambassador.id} referred someone (${orderId}) ! :tada:`
    await this.slackService.enqueue({
      text,
      webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
    })
  }

  async createOrJoinGroup(
    orderId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const order = await this.findOneByOrganizationIdAndLivemode(
      orderId,
      organizationId,
      livemode
    )

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found.`)
    }

    if (order.customerId && !order.paymentGroupId) {
      return await this.paymentGroupsService.create(
        organizationId,
        livemode,
        {
          orderId: order.id,
          customerId: order.customerId,
        },
        order.customerId
      )
    } else if (order.paymentGroupId) {
      try {
        return await this.paymentGroupsService.join(
          order.paymentGroupId,
          order.id
        )
      } catch (error) {
        this.loggerService.error('Error while joining group', error.stack, {
          service: OrdersService.name,
          method: this.createOrJoinGroup.name,
          object: order.id,
        })
        await this.removePaymentGroup(orderId, organizationId, livemode)
        return await this.createOrJoinGroup(orderId, organizationId, livemode)
      }
    }

    this.loggerService.error('Cannot create or join group', undefined, {
      service: OrdersService.name,
      method: this.createOrJoinGroup.name,
      object: order.id,
    })
    throw new Error('Cannot create or join group.')
  }

  async removePaymentGroup(
    orderId: string,
    organizationId: string,
    livemode: boolean
  ) {
    return this.prisma.client.order.update({
      where: {
        id: orderId,
        organizationId,
        livemode,
      },
      data: { paymentGroupId: null },
    })
  }

  async withdrawCashback(id: string, createWithdrawalDto: CreateWithdrawalDto) {
    const order = (await this.findOne(id, {
      expand: ['organization'],
    })) as Prisma.OrderGetPayload<{
      include: {
        organization: true
      }
    }>

    if (!order) {
      throw new NotFoundException(`Payment intent ${id} not found.`)
    }

    if (!order.organization) {
      throw new NotFoundException(
        `Organization of payment id ${id}  not found.`
      )
    }

    if (order.token !== createWithdrawalDto.token) {
      throw new BadRequestException(`Invalid token.`)
    }

    if (!order.organization.cashbackBankId) {
      throw new BadRequestException(
        `Organization ${order.organization.id} has no cashback bank account.`
      )
    }

    if (order.status !== OrderStatus.CASHBACK_AVAILABLE) {
      throw new BadRequestException(
        `Cashback cannot be withdrawn from Payment intent ${id} because it is not in the correct state.`
      )
    }

    if (!order.customerId) {
      throw new BadRequestException(`Payment intent ${id} has no customer.`)
    }

    if (!order.amountCashback || order.amountCashback <= 0) {
      throw new BadRequestException(
        `Payment intent ${id} has no cashback amount.`
      )
    }

    await this.updateOrderStatus(
      order.id,
      OrderStatus.CASHBACK_PROCESSING,
      order.organizationId,
      order.livemode
    )

    await this.prisma.client.order.update({
      where: {
        id,
        organizationId: order.organizationId,
        livemode: order.livemode,
      },
      data: {
        token: null,
      },
    })

    return await this.enqueueCashback(order.id, createWithdrawalDto)
  }

  async sendCashback(
    id: string,
    discountValue: number,
    discountType: DiscountType,
    updatedBy: string = SYSTEM
  ) {
    const order = (await this.findOne(id, {
      expand: ['customer', 'organization', 'paymentGroup'],
    })) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: true
        paymentGroup: true
      }
    }>

    if (!order) {
      throw new NotFoundException(`Order ${id} not found.`)
    }

    if (order.status !== OrderStatus.CREATED) {
      throw new BadRequestException(
        `Cashback cannot be sent to Order ${id} because it is not in the correct state.`
      )
    }

    if (!order.customer) {
      throw new BadRequestException(`Order ${id} has no customer.`)
    }

    const amountCashback = this.computeCashbackAmount(
      order.amount,
      discountValue,
      discountType
    )

    const orderUpdated = await this.prisma.client.order.update({
      where: {
        id,
        organizationId: order.organizationId,
        livemode: order.livemode,
      },
      data: {
        status: OrderStatus.CASHBACK_AVAILABLE,
        amountCashback,
        updatedBy,
        token: randomBytes(32).toString('hex'),
      },
    })

    this.eventEmitter.emit(
      KohortPayEvent.ORDER_CASHBACK_AVAILABLE,
      new OrderCashbackAvailableEvent(orderUpdated, discountType, discountValue)
    )

    this.loggerService.log(
      `Order ${id} status updated to AVAILABLE successfully.`,
      {
        service: OrdersService.name,
        function: this.sendCashback.name,
        objectId: orderUpdated.id,
      }
    )

    return orderUpdated
  }

  async saveApplicationFeeAmount(order: Order) {
    const applicationFeeAmount = await this.computeApplicationFeeAmount(order)

    return this.prisma.client.order.update({
      where: {
        id: order.id,
        organizationId: order.organizationId,
        livemode: order.livemode,
      },
      data: {
        applicationFeeAmount,
      },
    })
  }

  async computeApplicationFeeAmount(order: Order) {
    // This method is used to compute the applicationFeeAmount of a order.
    // It is highly critical and changes should be made with extreme caution.
    // Several things to keep in mind:
    // The return value is in cents
    // Math.round is used to avoid javascript decimal issues

    const organization = await this.organizationsService.findOne(
      order.organizationId
    )
    if (!organization) {
      throw new Error(`Organization with id ${order.organizationId} not found`)
    }
    return this.calculateFeesWithVAT(
      Math.round(
        (organization.kohortAcquisitionFees.toNumber() * order.amount) / 100
      )
    )
  }

  async calculateFeesWithVAT(feesWithoutVAT: number) {
    const vatAmount = Math.round(feesWithoutVAT * VAT_RATE)
    return feesWithoutVAT + vatAmount
  }

  computeCashbackAmount(
    amount: number,
    discountValue: number,
    discountType: DiscountType
  ) {
    // This method is used to compute the discountAmount of an order.
    // It is highly critical and changes should be made with extreme caution.
    // The return value is in cents.
    if (discountValue === 0) return 0
    else if (discountType === DiscountType.PERCENTAGE) {
      return Math.round((amount * discountValue) / 100)
    } else if (discountType === DiscountType.AMOUNT) {
      return Math.round(discountValue * 100)
    }
    return 0
  }

  async createCustomer(
    createOrderDto: CreateOrderDto,
    organizationId: string,
    livemode: boolean
  ) {
    let customer: Customer | null = null
    if (createOrderDto.customerId) {
      customer = await this.customersService.findOneWithDeleted(
        createOrderDto.customerId
      )
      if (!customer) {
        throw new NotFoundException(
          `Customer with id ${createOrderDto.customerId} not found.`
        )
      }
    } else if (
      createOrderDto.customerEmail &&
      createOrderDto.customerFirstName &&
      createOrderDto.customerLastName
    ) {
      customer =
        await this.customersService.findOneByEmailAndOrganizationIdAndLivemodeWithDeleted(
          createOrderDto.customerEmail,
          organizationId,
          livemode
        )
      if (!customer) {
        customer = await this.customersService.create(
          organizationId,
          livemode,
          {
            emailAddress: createOrderDto.customerEmail,
            firstName: createOrderDto.customerFirstName,
            lastName: createOrderDto.customerLastName,
            phoneNumber: createOrderDto.customerPhoneNumber,
            locale: createOrderDto.locale,
          }
        )
      }
    } else {
      throw new Error(
        `Order is missing customer information. Cannot find or create new Customer.`
      )
    }

    if (customer.deletedAt) {
      customer = await this.customersService.update(
        customer.id,
        customer.organizationId,
        customer.livemode,
        { deletedAt: null }
      )
    }

    if (
      createOrderDto.customerPhoneNumber &&
      createOrderDto.customerPhoneNumber !== customer.phoneNumber
    ) {
      return await this.customersService.update(
        customer.id,
        customer.organizationId,
        customer.livemode,
        {
          phoneNumber: createOrderDto.customerPhoneNumber,
        }
      )
    }

    return customer
  }

  async enqueueCashback(id: string, createWithdrawalDto: CreateWithdrawalDto) {
    await this.withdrawCashbackQueue.add(QueueName.WITHDRAW_CASHBACK, {
      id,
      createWithdrawalDto,
    })
  }

  //#region Emails

  async sendConfirmationEmail(
    orderId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const order = (await this.findOneByOrganizationIdAndLivemode(
      orderId,
      organizationId,
      livemode,
      {
        expand: ['paymentGroup', 'customer', 'organization.brandSettings'],
      }
    )) as Prisma.OrderGetPayload<{
      include: {
        paymentGroup: true
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
      }
    }>
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found.`)
    }

    if (!order.paymentGroupId) {
      throw new Error(`Order with id ${orderId} has no paymentGroup.`)
    }

    if (!order.customer) {
      throw new Error(`Order with id ${orderId} has no customer.`)
    }

    const paymentGroup = (await this.paymentGroupsService.findOne(
      order.paymentGroupId,
      {
        expand: ['paymentGroupSettings.discountLevels', 'customer'],
      }
    )) as Prisma.PaymentGroupGetPayload<{
      include: {
        paymentGroupSettings: {
          include: {
            discountLevels: true
          }
        }
        customer: true
      }
    }>
    if (!paymentGroup) {
      throw new NotFoundException(
        `PaymentGroup with id ${order.paymentGroupId} not found`
      )
    }

    const participantCount = (await this.findAllByPaymentGroup(paymentGroup.id))
      .count

    const creator = paymentGroup.customer

    const discountValue =
      this.paymentGroupsService.getCurrentDiscountLevel(
        participantCount,
        paymentGroup.paymentGroupSettings?.discountLevels || []
      )?.value || 0

    const maxDiscountValue =
      this.paymentGroupsService.getMaxDiscountLevel(
        paymentGroup.paymentGroupSettings?.discountLevels || []
      )?.value || 0

    const maxDiscountAmount = this.computeCashbackAmount(
      order.amount,
      maxDiscountValue,
      paymentGroup.paymentGroupSettings?.discountType || 'PERCENTAGE'
    )
    const startingTime = order.createdAt.toLocaleDateString(
      replaceUnderscoreWithHyphen(order.customer.locale)
    )

    const timeLeft = calculateRemainingTime(paymentGroup.expiresAt)

    const dateToSend = paymentGroup.expiresAt.toLocaleDateString(
      replaceUnderscoreWithHyphen(order.customer.locale)
    )
    const discountAmount = this.computeCashbackAmount(
      order.amount,
      discountValue,
      paymentGroup.paymentGroupSettings?.discountType || 'PERCENTAGE'
    )
    const nextLevel = this.paymentGroupsService.getNextLevel(
      participantCount,
      paymentGroup.paymentGroupSettings?.discountLevels || []
    )
    const nextDiscountLevel = formatDiscount(
      nextLevel?.value || 0,
      paymentGroup.paymentGroupSettings?.discountType || 'PERCENTAGE',
      order.customer.locale,
      order.currency
    )

    const currentDiscountAmount = new Intl.NumberFormat(
      replaceUnderscoreWithHyphen(order.customer.locale),
      {
        style: 'currency',
        currency: order.currency,
      }
    ).format(discountAmount / 100)

    const currentDiscount = formatDiscount(
      discountValue,
      paymentGroup.paymentGroupSettings?.discountType,
      order.customer?.locale,
      order.currency
    )

    const currentBrandSettings = order.organization.brandSettings.find(
      (brandSetting) => brandSetting.livemode === paymentGroup.livemode
    )
    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )
    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        order.organizationId,
        order.livemode,
        participantCount > 1 ? EmailType.JOIN_GROUP : EmailType.NEW_GROUP,
        order.customer.locale
      )
    await this.emailsService.enqueue({
      subject: transactionalEmail?.subject || '',
      fromEmail: transactionalEmail?.fromEmail || '',
      fromName: order.organization.fromEmailName || undefined,
      html: transactionalEmail?.body || '',
      to: order.customer.emailAddress,
      dynamicTemplateData: {
        subject:
          participantCount > 1
            ? `${translation(
                order.customer.locale || Locale.fr_FR,
                'paymentProcessedSuccessKohortRef',
                'subjectJoinedKohort'
              ).toString()} ${currentDiscountAmount} ${translation(
                order.customer.locale || Locale.fr_FR,
                'paymentProcessedSuccessKohortRef',
                'cashback'
              ).toString()}`
            : `${translation(
                order.customer.locale || Locale.fr_FR,
                'paymentProcessedSuccessKohortRef',
                'subjectCreatedKohort'
              ).toString()} ${order.organization.name} 🔥`,
        colors: currentBrandSettings?.color ? colors : null,
        paymentIntent: {
          id: order.id,
          amount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format((order.amount - discountAmount) / 100),
          updatedAt: order.updatedAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(order.customer.locale)
          ),
          createdAt: order.createdAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(order.customer.locale)
          ),
          amountCashback: currentDiscountAmount,
          amountCurrentlyCaptured: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format(order.amount / 100),
        },
        currentDiscount:
          paymentGroup.paymentGroupSettings?.discountType ===
          DiscountType.PERCENTAGE
            ? currentDiscount
            : null, // to not show it if they are the same
        organization: order.organization,
        maxCashbackAmount: new Intl.NumberFormat(
          replaceUnderscoreWithHyphen(order.customer.locale),
          {
            style: 'currency',
            currency: order.currency,
          }
        ).format(maxDiscountAmount / 100),
        nextDiscountLevel,
        paymentGroup: {
          ...paymentGroup,
          shareUrl: `${this.configService.get<string>(
            'MY_KOHORT_APP_URL',
            ''
          )}/${order.customer.locale || Locale.fr_FR}/pg/${paymentGroup.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_KOHORT_REF_PAYMENT_SUCCESS}&utm_content=cta_share_button`,
        },
        customer: {
          firstName: order.customer.firstName,
        },
        creator,
        startingTime,
        timeLeft,
        participantCount: participantCount > 1 ? participantCount : null,
        discountType:
          paymentGroup.paymentGroupSettings?.discountType ===
          DiscountType.PERCENTAGE
            ? DiscountType.PERCENTAGE
            : null,
        dateToSend,
        staticData: translation(
          order.customer.locale || Locale.fr_FR,
          'paymentProcessedSuccessKohortRef'
        ),
      },
    })
    if (
      order.customer.phoneNumber &&
      paymentGroup.paymentGroupSettings?.whatsappCommunication
    ) {
      if (
        order.customer.phoneNumber &&
        paymentGroup.paymentGroupSettings?.whatsappCommunication
      ) {
        if (participantCount <= 1) {
          const isProduction =
            this.configService.get('NODE_ENV') === NODE_ENV_PROD
          const locale = order.customer.locale || Locale.fr_FR
          const customerFirstName = order.customer.firstName || ''
          const organizationName = order.organization.name || ''
          const currencyFormatter = new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          )
          const formattedDiscount = currencyFormatter.format(
            maxDiscountAmount / 100
          )
          const recipientPhoneNumber = formatPhoneNumber(
            order.customer.phoneNumber
          )
          const appUrl = this.configService.get<string>('MY_KOHORT_APP_URL', '')

          const shortUrl = `${appUrl}/r/${encodeUrlParams(locale, paymentGroup.shareId, true)}`

          this.loggerService.log(
            `Sending WhatsApp messages to customer with ID: ${order.id}`,
            {
              service: OrdersService.name,
              method: this.sendConfirmationEmail.name,
              object: order.id,
            }
          )

          await this.whatsappService.enqueue({
            recipientPhoneNumber,
            templateName: getTemplateName('intro', isProduction),
            locale,
            variables: [customerFirstName, organizationName, formattedDiscount],
          })
          await this.whatsappService.enqueue({
            recipientPhoneNumber,
            templateName: getTemplateName('forward', isProduction),
            locale,
            variables: [
              paymentGroup.shareId,
              formatLink(order.organization.websiteUrl || ''),
              formattedDiscount,
              `${shortUrl}`,
            ],
          })

          this.loggerService.log(
            `Successfully sent WhatsApp messages to customer with ID: ${order.id}`,
            {
              service: OrdersService.name,
              method: this.sendConfirmationEmail.name,
              object: order.id,
            }
          )
        }
      } else {
        this.loggerService.log(
          `No WhatsApp sent due to a missing phone number or disabled WhatsApp communication setting for the customer associated with the Order ${order.id}`,
          {
            service: OrdersService.name,
            method: this.sendConfirmationEmail.name,
            object: order.id,
          }
        )
      }
    }
  }

  async sendCashbackWithdrawalEmail(orderId: string) {
    const order = (await this.findOne(orderId, {
      expand: ['customer', 'organization.brandSettings', 'paymentGroup'],
    })) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`)
    }

    if (!order.customer) {
      throw new Error('Order has no customer.')
    }

    const currentBrandSettings = order.organization?.brandSettings?.find(
      (brandSetting) => brandSetting.livemode === order.livemode
    )
    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )

    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        order.organizationId,
        order.livemode,
        EmailType.CASHBACK_WITHDRAWN,
        order.customer.locale
      )

    await this.emailsService.enqueue({
      html: transactionalEmail?.body || '',
      fromEmail: transactionalEmail?.fromEmail || '',
      fromName: order.organization.fromEmailName || undefined,
      subject: transactionalEmail?.subject || '',
      to: order.customer.emailAddress,
      dynamicTemplateData: {
        subject:
          translation(
            order.customer.locale || Locale.fr_FR,
            'paymentGroupCashbackWithdrawn',
            'subject'
          ).toString() || '',
        colors: currentBrandSettings?.color ? colors : null,
        paymentIntent: {
          id: order.id,
          amount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format(order.amount / 100),
          amountCashback: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format(order.amountCashback ? order.amountCashback / 100 : 0),
          createdAt: order.createdAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              month: '2-digit',
              day: '2-digit',
            }
          ),
        },
        paymentGroup: {
          ...order.paymentGroup,
          shareUrl: `${this.configService.get<string>(
            'MY_KOHORT_APP_URL',
            ''
          )}/${order.customer.locale || Locale.fr_FR}/pg/${order.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_KOHORT_REF_PAYMENT_CASHBACK_WITHDRAWN}&utm_content=cta_share_button`,
        },
        customer: {
          firstName: order.customer.firstName,
        },
        organization: {
          name: order.organization.name,
          imageUrl: order.organization.imageUrl,
          websiteUrl: formatWebsiteUrl(order.organization.websiteUrl || ''),
        },
        staticData: translation(
          order.customer.locale || Locale.fr_FR,
          'paymentGroupCashbackWithdrawn'
        ),
      },
    })
    this.loggerService.log(
      `Cashback withdrawal email passed to the queue successfully.`,
      {
        service: OrdersService.name,
        function: this.sendCashbackWithdrawalEmail.name,
        objectId: order.id,
      }
    )
  }

  async sendCashbackReadyEmail(
    orderId: string,
    discountType: DiscountType,
    discountValue: number
  ) {
    const order = (await this.findOne(orderId, {
      expand: ['customer', 'organization.brandSettings', 'paymentGroup'],
    })) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`)
    }

    if (!order.customer) {
      throw new Error('Order has no customer.')
    }

    if (discountValue > 0) {
      const currentBrandSettings = order.organization?.brandSettings?.find(
        (brandSetting) => brandSetting.livemode === order.livemode
      )
      const colors = getColorVariants(
        currentBrandSettings?.color || PRIMARY_COLOR
      )

      const transactionalEmail =
        await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
          order.organizationId,
          order.livemode,
          EmailType.CASHBACK_AVAILABLE,
          order.customer.locale
        )

      this.loggerService.log('Sending cashback email', {
        order,
        transactionalEmail,
      })

      await this.emailsService.enqueue({
        subject: transactionalEmail?.subject || '',
        html: transactionalEmail?.body || '',
        to: order.customer.emailAddress,
        fromEmail: transactionalEmail?.fromEmail || '',
        fromName: order.organization.fromEmailName || undefined,
        dynamicTemplateData: {
          subject:
            translation(
              order.customer.locale || Locale.fr_FR,
              'paymentGroupIBANRequest',
              'subject'
            ).toString() || '',
          colors: currentBrandSettings?.color ? colors : null,
          paymentIntent: {
            id: order.id,
            amount: new Intl.NumberFormat(
              replaceUnderscoreWithHyphen(order.customer.locale),
              {
                style: 'currency',
                currency: order.currency,
              }
            ).format(order.amount / 100),
            createdAt: order.createdAt.toLocaleDateString(
              replaceUnderscoreWithHyphen(order.customer.locale),
              {
                month: '2-digit',
                day: '2-digit',
              }
            ),
          },
          paymentGroup: {
            ...order.paymentGroup,
            shareUrl: `${this.configService.get<string>(
              'MY_KOHORT_APP_URL',
              ''
            )}/${order.customer.locale || Locale.fr_FR}/pg/${order.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_KOHORT_REF_PAYMENT_IBAN_REQUEST}&utm_content=cta_share_button`,
          },
          customer: {
            firstName: order.customer.firstName,
          },
          organization: {
            name: order.organization.name,
            imageUrl: order.organization.imageUrl,
            websiteUrl: formatWebsiteUrl(order.organization.websiteUrl || ''),
          },
          url: `${this.configService.get<string>(
            'CHECKOUT_APP_URL',
            ''
          )}/w/${order.id}?token=${order.token}`,
          cashbackAmount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format(order.amountCashback ? order.amountCashback / 100 : 0),
          discount: formatDiscount(
            discountValue,
            discountType,
            order.customer.locale,
            order.currency
          ),
          discountType: discountType == 'PERCENTAGE' ? discountType : null,
          staticData: translation(
            order.customer.locale || Locale.fr_FR,
            'paymentGroupIBANRequest'
          ),
        },
      })
    }
  }

  async noCashbackSentEmail(orderId: string, orderDetails: object[]) {
    const order = (await this.findOne(orderId, {
      expand: ['customer', 'organization.brandSettings', 'paymentGroup'],
    })) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`)
    }
    if (!order.customer) {
      throw new Error('Order has no customer.')
    }
    const currentBrandSettings = order.organization.brandSettings.find(
      (brandSetting) => brandSetting.livemode === order.livemode
    )

    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )
    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        order.organizationId,
        order.livemode,
        EmailType.GROUP_EXPIRED,
        order.customer.locale
      )
    await this.emailsService.enqueue({
      subject: transactionalEmail?.subject || '',
      fromEmail: transactionalEmail?.fromEmail || '',
      fromName: order.organization.fromEmailName || undefined,
      html: transactionalEmail?.body || '',
      to: order.customer.emailAddress,
      dynamicTemplateData: {
        subject:
          translation(
            order.customer.locale || Locale.fr_FR,
            'paymentgroupNoCashback',
            'subject'
          ).toString() || '',
        colors: currentBrandSettings?.color ? colors : null,
        paymentIntent: {
          id: order.id,
          amount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format(order.amount / 100),
          updatedAt: order.updatedAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(order.customer.locale)
          ),
          createdAt: order.createdAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(order.customer.locale)
          ),
        },
        paymentGroup: {
          ...order.paymentGroup,
          shareUrl: `${this.configService.get<string>(
            'MY_KOHORT_APP_URL',
            ''
          )}/${order.customer.locale || Locale.fr_FR}/pg/${order.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_PAYMENT_CAPTURED_NO_DISCOUNT}&utm_content=cta_share_button`,
        },
        customer: {
          firstName: order.customer.firstName,
        },
        organization: {
          name: order.organization.name,
          formatedWebsiteUrl: formatWebsiteUrl(
            order.organization.websiteUrl || ''
          ),
          websiteUrl: order.organization.websiteUrl || '',
          imageUrl: order.organization.imageUrl,
        },
        orderDetails: orderDetails.length > 0 ? orderDetails : null,
        staticData: translation(
          order.customer.locale || Locale.fr_FR,
          'paymentgroupNoCashback'
        ),
      },
    })
  }

  async sendCashbackSentEmail(
    orderId: string,
    discountValue: number,
    orderDetails: object[],
    discountType: DiscountType
  ) {
    const order = (await this.findOne(orderId, {
      expand: ['customer', 'organization.brandSettings', 'paymentGroup'],
    })) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!orderDetails) {
      throw new NotFoundException(`Order ${orderId} not found.`)
    }
    if (!order.customer) {
      throw new Error('Order has no customer.')
    }
    if (discountValue > 0) {
      const currentBrandSettings = order.organization?.brandSettings?.find(
        (brandSetting) => brandSetting.livemode === order.livemode
      )
      const colors = getColorVariants(
        currentBrandSettings?.color || PRIMARY_COLOR
      )

      const transactionalEmail =
        await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
          order.organizationId,
          order.livemode,
          EmailType.CASHBACK_SENT,
          order.customer.locale
        )

      await this.emailsService.enqueue({
        subject: transactionalEmail?.subject || '',
        html: transactionalEmail?.body || '',
        to: order.customer.emailAddress,
        fromEmail: transactionalEmail?.fromEmail || '',
        fromName: order.organization.fromEmailName || undefined,
        dynamicTemplateData: {
          subject:
            translation(
              order.customer.locale || Locale.fr_FR,
              'paymentgroupCashbackSuccess',
              'subject'
            ).toString() || '',
          colors: currentBrandSettings?.color ? colors : null,
          paymentIntent: {
            id: order.id,
            amount: new Intl.NumberFormat(
              replaceUnderscoreWithHyphen(order.customer.locale),
              {
                style: 'currency',
                currency: order.currency,
              }
            ).format(order.amount / 100),
            updatedAt: order.updatedAt.toLocaleDateString(
              replaceUnderscoreWithHyphen(order.customer.locale)
            ),
            createdAt: order.createdAt.toLocaleDateString(
              replaceUnderscoreWithHyphen(order.customer.locale)
            ),
          },
          paymentGroup: {
            ...order.paymentGroup,
            shareUrl: `${this.configService.get<string>(
              'MY_KOHORT_APP_URL',
              ''
            )}/${order.customer.locale || Locale.fr_FR}/pg/${order.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_DISCOUNT_SUCCESS}&utm_content=cta_share_button`,
          },
          customer: {
            firstName: order.customer.firstName,
          },
          organization: {
            name: order.organization.name,
            imageUrl: order.organization.imageUrl,
            websiteUrl: formatWebsiteUrl(order.organization.websiteUrl || ''),
          },
          orderDetails: orderDetails.length > 0 ? orderDetails : null,
          discountAmount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(order.customer.locale),
            {
              style: 'currency',
              currency: order.currency,
            }
          ).format(order.amountCashback ? order.amountCashback / 100 : 0),
          discount: formatDiscount(
            discountValue,
            discountType,
            order.customer.locale,
            order.currency
          ),
          discountType: discountType == 'PERCENTAGE' ? discountType : null,
          staticData: translation(
            order.customer.locale || Locale.fr_FR,
            'paymentgroupCashbackSuccess'
          ),
        },
      })
    }
  }

  //#endregion Emails
}
