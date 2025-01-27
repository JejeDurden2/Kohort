import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Ambassador,
  CheckoutSessionStatus,
  LineItem,
  LineItemType,
  Locale,
  Organization,
  PaymentGroup,
  Prisma,
} from '@prisma/client'
import { CustomPrismaService } from 'nestjs-prisma'

import { CodesService } from '../codes/codes.service'
import {
  AMBASSADOR_CODE_PREFIX,
  CHECKOUT_SESSION_DATABASE_PREFIX,
  KOHORT_CODE_PREFIX,
  LINE_ITEM_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { CHECKOUT_SESSION_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { CheckoutSessionValidationErrors } from '../common/enums/errors'
import { IdsService } from '../common/ids/ids.service'
import { computeExpiresAt } from '../common/utils/compute-expires-at'
import { CustomersService } from '../customers/customers.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto'
import { CreateLineItemDto } from './dto/create-line-item.dto'
import { UpdateCheckoutSessionDto } from './dto/update-checkout-session.dto'

@Injectable()
export class CheckoutSessionsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => PaymentIntentsService))
    private readonly paymentIntentsService: PaymentIntentsService,
    private readonly loggerService: DefaultScopedLoggerService,
    @Inject(forwardRef(() => PaymentGroupsService))
    private readonly paymentGroupsService: PaymentGroupsService,
    private readonly paymentGroupSettingsService: PaymentGroupSettingsService,
    private readonly customersService: CustomersService,
    private readonly codesService: CodesService
  ) {}

  async create(
    organization: Organization,
    livemode: boolean,
    createCheckoutSessionDto: CreateCheckoutSessionDto,
    createdBy: string = SYSTEM
  ) {
    if (createCheckoutSessionDto.clientReferenceId) {
      const checkoutSession =
        await this.findOneByClientReferenceIdOrganizationIdAndLivemode(
          createCheckoutSessionDto.clientReferenceId,
          organization.id,
          livemode
        )
      if (checkoutSession) {
        throw new BadRequestException(
          `Checkout session with client reference id ${createCheckoutSessionDto.clientReferenceId} already exists.`
        )
      }
    }

    if (createCheckoutSessionDto.paymentClientReferenceId) {
      const checkoutSession =
        await this.paymentIntentsService.findOneByClientReferenceIdOrganizationIdAndLivemode(
          createCheckoutSessionDto.paymentClientReferenceId,
          organization.id,
          livemode
        )
      if (checkoutSession) {
        throw new BadRequestException(
          `Checkout session with client reference id ${createCheckoutSessionDto.paymentClientReferenceId} already exists.`
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

    const {
      ['lineItems']: lineItems,
      paymentGroupShareId: groupShareId,
      ...createCheckoutSessionDtoWithoutLineItems
    } = createCheckoutSessionDto

    if (
      createCheckoutSessionDto.amountTotal <
      paymentGroupSettings.minPurchaseValue
    ) {
      throw new BadRequestException(
        `The minimum purchase value is ${paymentGroupSettings.minPurchaseValue}`
      )
    }

    let ambassador: Ambassador | null = null
    if (groupShareId) {
      if (groupShareId.startsWith(AMBASSADOR_CODE_PREFIX)) {
        ambassador = await this.codesService.validate(groupShareId)
      } else if (groupShareId.startsWith(KOHORT_CODE_PREFIX)) {
        await this.paymentGroupsService.validate(groupShareId, {
          customerEmail: createCheckoutSessionDto.customerEmail,
        })
      } else {
        throw new NotFoundException('Code not found.')
      }
    }

    if (lineItems) {
      this.validateLineItemsTypeRestrictions(lineItems)
    }

    const id = this.idsService.createId(CHECKOUT_SESSION_DATABASE_PREFIX)
    const shareId = this.idsService.createCheckoutId(livemode)
    const url = `${this.configService.get('CHECKOUT_APP_URL')}/c/${shareId}`
    const status = CheckoutSessionStatus.COMPLETED

    if (createCheckoutSessionDto.locale === Locale.en_GB) {
      createCheckoutSessionDto.locale = Locale.en_US
    }

    const expiresAt = computeExpiresAt(createCheckoutSessionDto.expiresAt, null)
    const checkoutSession = await this.prisma.client.checkoutSession.create({
      data: {
        ...createCheckoutSessionDtoWithoutLineItems,
        paymentGroupShareId: ambassador?.id
          ? undefined
          : createCheckoutSessionDto.paymentGroupShareId,
        id,
        shareId,
        livemode,
        url,
        expiresAt,
        organizationId: organization.id,
        customerId: createCheckoutSessionDto.customerId,
        lineItems: {
          create: lineItems
            ? lineItems.map((createLineItemDto: CreateLineItemDto) => ({
                ...createLineItemDto,
                id: this.idsService.createId(LINE_ITEM_DATABASE_PREFIX),
                amountTotal:
                  createLineItemDto.price * createLineItemDto.quantity,
              }))
            : [],
        },
        status,
        createdBy,
        updatedBy: createdBy,
      },
    })

    if (!checkoutSession) {
      this.loggerService.error('Unable to create CheckoutSession.', '', {
        service: CheckoutSessionsService.name,
        function: this.create.name,
        dto: createCheckoutSessionDto,
      })
      throw new Error('Unable to create checkout session.')
    }

    const payment = await this.paymentIntentsService.create(
      organization,
      livemode,
      {
        checkoutSessionId: checkoutSession.id,
        amount: checkoutSession.amountTotal,
        customerId: checkoutSession.customerId,
        paymentGroupId: paymentGroupSettings.paymentGroupId,
        ambassadorId: ambassador?.id,
        clientReferenceId:
          checkoutSession.paymentClientReferenceId ?? undefined,
      }
    )
    if (!payment) {
      this.loggerService.error('Unable to create PaymentIntent.', '', {
        service: CheckoutSessionsService.name,
        function: this.create.name,
        object: checkoutSession.id,
        dto: {
          ...createCheckoutSessionDto,
          checkoutSessionId: checkoutSession.id,
          customerId: checkoutSession.customerId,
        },
      })
      throw new Error('Unable to create payment intent.')
    }

    await this.customersService.validate(
      createCheckoutSessionDto.customerEmail ?? null,
      createCheckoutSessionDto.customerId ?? null,
      organization.id,
      livemode
    )
    return checkoutSession
  }

  validateLineItemsTypeRestrictions(lineItems: CreateLineItemDto[]) {
    lineItems.forEach((lineItem: LineItem) => {
      if (lineItem.type !== LineItemType.PRODUCT && lineItem.quantity !== 1) {
        throw new BadRequestException(
          `The quantity of ${lineItem.type} must be 1. Please add a new lineItem if you need more than one.`
        )
      }
      if (lineItem.type === LineItemType.PRODUCT) {
        if (lineItem.price < 0) {
          throw new BadRequestException(
            `The price of a product cannot be negative.`
          )
        }
      } else if (lineItem.type === LineItemType.DISCOUNT) {
        if (lineItem.price >= 0) {
          throw new BadRequestException(
            `The price of a discount cannot be positive.`
          )
        }
      } else if (lineItem.type === LineItemType.GIFT_CARD) {
        if (lineItem.price >= 0) {
          throw new BadRequestException(
            `The price of a gift card cannot be positive.`
          )
        }
      } else if (lineItem.type === LineItemType.SHIPPING) {
        if (lineItem.price < 0) {
          throw new BadRequestException(
            `The price of a shipping cannot be negative.`
          )
        }
      } else if (lineItem.type === LineItemType.STORE_CREDIT) {
        if (lineItem.price >= 0) {
          throw new BadRequestException(
            `The price of a store credit cannot be positive.`
          )
        }
      }
    })
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(CHECKOUT_SESSION_RELATIONS, query?.expand)
    let checkoutSession = await this.prisma.client.checkoutSession.findUnique({
      where: {
        id,
      },
      include,
    })
    if (!checkoutSession) {
      checkoutSession = await this.prisma.client.checkoutSession.findUnique({
        where: {
          shareId: id,
        },
        include,
      })
    }
    return checkoutSession
  }

  async findOneByClientReferenceIdOrganizationIdAndLivemode(
    clientReferenceId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const checkoutSession = await this.prisma.client.checkoutSession.findFirst({
      where: {
        clientReferenceId,
        organizationId,
        livemode,
      },
      orderBy: { createdAt: 'desc' },
    })

    return checkoutSession
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(CHECKOUT_SESSION_RELATIONS, query?.expand)
    const checkoutSession = await this.prisma.client.checkoutSession.findUnique(
      {
        where: {
          id,
          organizationId,
          livemode,
        },
        include,
      }
    )
    if (!checkoutSession) {
      return await this.prisma.client.checkoutSession.findUnique({
        where: {
          shareId: id,
          organizationId,
          livemode,
        },
        include,
      })
    }
    return checkoutSession
  }

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(CHECKOUT_SESSION_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.CheckoutSessionScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(
      Prisma.CheckoutSessionScalarFieldEnum,
      query?.search
    )
    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.checkoutSession.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: { organizationId, livemode, ...search },
      }),
      this.prisma.client.checkoutSession.count({
        where: { organizationId, livemode, ...search },
      }),
    ])
    return { data, count }
  }

  async findAllStatusOpenAndExpired() {
    return await this.prisma.client.checkoutSession.findMany({
      where: {
        status: CheckoutSessionStatus.OPEN,
        expiresAt: {
          lte: new Date(),
        },
      },
    })
  }

  async update(
    id: string,
    updateCheckoutSessionDto: UpdateCheckoutSessionDto,
    updatedBy: string = SYSTEM
  ) {
    let paymentGroup: PaymentGroup | null = null
    if (updateCheckoutSessionDto.paymentGroupShareId) {
      paymentGroup = await this.paymentGroupsService.findOne(
        updateCheckoutSessionDto.paymentGroupShareId
      )
    }

    return await this.prisma.client.checkoutSession.update({
      where: { id },
      data: {
        ...updateCheckoutSessionDto,
        lineItems: undefined, // TODO: update lineItems correctly
        paymentGroupShareId: paymentGroup ? paymentGroup.shareId : null,
        updatedBy,
      },
    })
  }

  async sendApplicationFeesAmount(id: string) {
    const checkoutSession = (await this.findOne(id, {
      expand: ['paymentIntent'],
    })) as Prisma.CheckoutSessionGetPayload<{
      include: {
        paymentIntent: true
      }
    }>

    if (!checkoutSession) {
      throw new NotFoundException(`Checkout session ${id} not found.`)
    }
    if (checkoutSession.status !== CheckoutSessionStatus.OPEN) {
      throw new BadRequestException(
        `Checkout session ${id} is not open. Current status is ${checkoutSession.status}`
      )
    }
    if (!checkoutSession.paymentIntent) {
      throw new BadRequestException(
        `Checkout session ${id} does not have a payment intent.`
      )
    }

    return await this.paymentIntentsService.deprecatedSendApplicationFeeAmount(
      checkoutSession.paymentIntent,
      checkoutSession.paymentGroupShareId !== null
    )
  }

  async expire(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    const checkoutSession = (await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode,
      {
        expand: ['paymentIntent'],
      }
    )) as Prisma.CheckoutSessionGetPayload<{
      include: {
        paymentIntent: true
      }
    }>

    if (!checkoutSession) {
      throw new NotFoundException(`Checkout session ${id} not found.`)
    }
    if (checkoutSession.status !== CheckoutSessionStatus.OPEN) {
      throw new BadRequestException(
        `Checkout session ${id} is not open. Current status is ${checkoutSession.status}`
      )
    }

    const checkoutSessionUpdated =
      await this.prisma.client.checkoutSession.update({
        where: {
          id,
          organizationId,
          livemode,
        },
        data: {
          expiresAt: new Date(),
          status: CheckoutSessionStatus.EXPIRED,
          updatedBy,
        },
      })

    return checkoutSessionUpdated
  }

  async complete(id: string, organizationId: string, livemode: boolean) {
    const checkoutSession = (await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode,
      {
        expand: ['paymentIntent', 'paymentGroup'],
      }
    )) as Prisma.CheckoutSessionGetPayload<{
      include: {
        paymentIntent: true
      }
    }>

    if (!checkoutSession) {
      throw new NotFoundException(`Checkout session ${id} not found.`)
    }

    let paymentGroup: PaymentGroup | null = null
    if (checkoutSession.paymentGroupShareId) {
      paymentGroup =
        await this.paymentGroupsService.findOneByOrganizationIdAndLivemode(
          checkoutSession.paymentGroupShareId,
          organizationId,
          livemode
        )

      if (!paymentGroup) {
        throw new NotFoundException(
          `Payment group ${checkoutSession.paymentGroupShareId} not found.`
        )
      }

      if (!checkoutSession.paymentIntent) {
        throw new BadRequestException(
          `Checkout session ${id} does not have a payment intent.`
        )
      }

      await this.paymentIntentsService.update(
        checkoutSession.paymentIntent.id,
        checkoutSession.organizationId,
        checkoutSession.livemode,
        {
          paymentGroupId: paymentGroup ? paymentGroup.id : null,
        }
      )
    }

    if (
      checkoutSession.status !== CheckoutSessionStatus.OPEN &&
      checkoutSession.status !== CheckoutSessionStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Checkout session ${id} is not open. Current status is ${checkoutSession.status}`
      )
    }

    return await this.prisma.client.checkoutSession.update({
      where: {
        id,
        organizationId,
        livemode,
      },
      data: {
        completedAt: new Date(),
        status: CheckoutSessionStatus.COMPLETED,
        customerId: checkoutSession.paymentIntent?.customerId,
        updatedBy: checkoutSession.paymentIntent?.customerId || SYSTEM,
      },
    })
  }

  async validate(id: string) {
    const checkoutSession = await this.findOne(id)

    if (!checkoutSession) {
      throw new NotFoundException(
        `Checkout session ${id} not found.`,
        CheckoutSessionValidationErrors.NOT_FOUND
      )
    }
    if (checkoutSession.status !== CheckoutSessionStatus.OPEN) {
      throw new BadRequestException(
        `Checkout session ${id} is not open.`,
        CheckoutSessionValidationErrors.WRONG_STATUS
      )
    }
    if (checkoutSession.paymentGroupShareId && checkoutSession.customerEmail) {
      this.paymentGroupsService.validate(checkoutSession.paymentGroupShareId, {
        customerEmail: checkoutSession.customerEmail,
      })
    }

    if (checkoutSession.customerId || checkoutSession.customerEmail) {
      await this.customersService.validate(
        checkoutSession.customerEmail,
        checkoutSession.customerId,
        checkoutSession.organizationId,
        checkoutSession.livemode
      )
    }
    return checkoutSession
  }
}
