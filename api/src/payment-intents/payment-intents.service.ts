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
  Organization,
  PaymentGroup,
  PaymentIntent,
  PaymentIntentStatus,
  Prisma,
} from '@prisma/client'
import { Queue } from 'bull'
import { randomBytes } from 'crypto'
import { CustomPrismaService } from 'nestjs-prisma'

import { CheckoutSessionsService } from '../checkout-sessions/checkout-sessions.service'
import { VAT_RATE } from '../common/constants/bill-pdf.constants'
import { PRIMARY_COLOR } from '../common/constants/colors.constants'
import { PAYMENT_INTENT_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { PAYMENT_INTENT_RELATIONS } from '../common/constants/database-relation-fields.constants'
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
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { extendedPrismaClient } from '../prisma.extension'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto'
import { UpdatePaymentIntentDto } from './dto/update-payment-intent.dto'
import { PaymentIntentCashbackAvailableEvent } from './events/payment-intent-cashback-available.event'
import { PaymentIntentSucceededEvent } from './events/payment-intent-succeeded.event'

@Injectable()
export class PaymentIntentsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => PaymentGroupsService))
    private readonly paymentGroupsService: PaymentGroupsService,
    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationService: OrganizationsService,
    @Inject(forwardRef(() => CheckoutSessionsService))
    private readonly checkoutSessionsService: CheckoutSessionsService,
    private readonly customersService: CustomersService,
    private readonly emailsService: EmailsService,
    private readonly whatsappService: WhatsappService,
    @InjectQueue(QueueName.SEND_CASHBACK)
    private sendCashbackPaymentIntentQueue: Queue,
    @InjectQueue(QueueName.WITHDRAW_CASHBACK)
    private withdrawCashbackQueue: Queue,
    private readonly loggerService: DefaultScopedLoggerService,
    private eventEmitter: EventEmitter2,
    private readonly transactionalEmailsService: TransactionalEmailsService
  ) {}

  async create(
    organization: Organization,
    livemode: boolean,
    createPaymentIntentDto: CreatePaymentIntentDto,
    createdBy: string = SYSTEM
  ) {
    let customer: Customer | null = null
    if (createPaymentIntentDto.customerId) {
      customer = await this.customersService.findOneByOrganizationIdAndLivemode(
        createPaymentIntentDto.customerId,
        organization.id,
        livemode
      )
      if (!customer) {
        throw new NotFoundException(
          `Customer with id ${createPaymentIntentDto.customerId} not found.`
        )
      }
    } else {
      customer = await this.deprecatedCreateCustomer(
        createPaymentIntentDto.checkoutSessionId,
        organization.id,
        livemode
      )

      if (!customer) {
        throw new Error(`Customer creation failed.`)
      }
    }

    const paymentIntent = await this.prisma.client.paymentIntent.create({
      data: {
        id: this.idsService.createId(PAYMENT_INTENT_DATABASE_PREFIX),
        ...createPaymentIntentDto,
        organizationId: organization.id,
        livemode,
        status: PaymentIntentStatus.SUCCEEDED,
        customerEmail: customer.emailAddress,
        customerId: customer.id,
        createdBy,
        updatedBy: createdBy,
      },
    })

    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_INTENT_SUCCEEDED,
      new PaymentIntentSucceededEvent(paymentIntent)
    )

    this.loggerService.log(`PaymentIntent ${paymentIntent.id} created`, {
      service: PaymentIntentsService.name,
      function: this.create.name,
      objectId: paymentIntent.id,
    })

    return paymentIntent
  }

  async update(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatePaymentIntentDto: UpdatePaymentIntentDto,
    updatedBy: string = SYSTEM
  ) {
    const paymentIntent = await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode
    )
    if (!paymentIntent) {
      throw new NotFoundException(`PaymentIntent with id ${id} not found.`)
    }

    let paymentGroup: PaymentGroup | null = null
    if (updatePaymentIntentDto.paymentGroupId) {
      paymentGroup =
        await this.paymentGroupsService.findOneByOrganizationIdAndLivemode(
          updatePaymentIntentDto.paymentGroupId,
          organizationId,
          livemode
        )
    }

    return await this.prisma.client.paymentIntent.update({
      where: {
        id,
        organizationId,
        livemode,
      },
      data: {
        paymentGroupId: paymentGroup ? paymentGroup.id : null,
        ...updatePaymentIntentDto,
        updatedBy,
      },
    })
  }

  async updatePaymentIntentStatus(
    id: string,
    status: PaymentIntentStatus,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.paymentIntent.update({
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

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(PAYMENT_INTENT_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.PaymentIntentScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(
      Prisma.PaymentIntentScalarFieldEnum,
      query?.search
    )

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.paymentIntent.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: { organizationId, livemode, ...search },
      }),
      this.prisma.client.paymentIntent.count({
        where: { organizationId, livemode, ...search },
      }),
    ])
    return { data, count }
  }

  async findAll(query?: QueryDto) {
    const include = formatExpand(PAYMENT_INTENT_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.PaymentIntentScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(
      Prisma.PaymentIntentScalarFieldEnum,
      query?.search
    )

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.paymentIntent.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: { ...search },
      }),
      this.prisma.client.paymentIntent.count({
        where: { ...search },
      }),
    ])
    return { data, count }
  }

  async findAllSucceededByOrganizationIdSinceDate(
    organizationId: string,
    date: Date,
    livemode: boolean
  ) {
    return await this.prisma.client.paymentIntent.findMany({
      where: {
        organizationId,
        livemode,
        status:
          PaymentIntentStatus.CASHBACK_SENT ||
          PaymentIntentStatus.CASHBACK_AVAILABLE ||
          PaymentIntentStatus.CASHBACK_PROCESSING,
        createdAt: {
          gte: date,
        },
      },
    })
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(PAYMENT_INTENT_RELATIONS, query?.expand)
    return await this.prisma.client.paymentIntent.findUnique({
      where: {
        id,
        organizationId,
        livemode,
      },
      include,
    })
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(PAYMENT_INTENT_RELATIONS, query?.expand)
    return await this.prisma.client.paymentIntent.findUnique({
      where: { id },
      include,
    })
  }

  async findOneByClientReferenceId(
    clientReferenceId: string,
    query?: QueryDto
  ) {
    const include = formatExpand(PAYMENT_INTENT_RELATIONS, query?.expand)
    return await this.prisma.client.paymentIntent.findFirst({
      where: { clientReferenceId },
      orderBy: { createdAt: 'desc' },
      include,
    })
  }

  async findOneByClientReferenceIdOrganizationIdAndLivemode(
    clientReferenceId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const paymentIntent = await this.prisma.client.paymentIntent.findFirst({
      where: {
        clientReferenceId,
        organizationId,
        livemode,
      },
      orderBy: { createdAt: 'desc' },
    })
    return paymentIntent
  }

  async findWithAmbassador30DaysAgo() {
    const thirtyDaysAgo = new Date()
    if (this.configService.get<string>('NODE_ENV') === NODE_ENV_PROD) {
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    } else {
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 1)
    }

    return await this.prisma.client.paymentIntent.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
          lt: new Date(thirtyDaysAgo.getTime() + 24 * 60 * 60 * 1000),
        },
        ambassadorId: { not: null },
      },
    })
  }

  async findAllByPaymentGroup(paymentGroupId: string, query?: QueryDto) {
    const include = formatExpand(PAYMENT_INTENT_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.PaymentIntentScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(
      Prisma.PaymentIntentScalarFieldEnum,
      query?.search
    )

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.paymentIntent.findMany({
        where: {
          paymentGroupId,
          ...search,
        },
        include,
        orderBy,
        skip: query?.skip,
        take: query?.take,
      }),
      this.prisma.client.paymentIntent.count({
        where: { paymentGroupId, ...search },
      }),
    ])

    return { data, count }
  }

  async sendCashbackGroup(
    paymentIntentIds: string[],
    discountValue: number,
    discountType: DiscountType
  ) {
    const results = await Promise.allSettled(
      paymentIntentIds.map(async (paymentIntentId) => {
        try {
          return await this.deprecatedSendCashback(
            paymentIntentId,
            discountValue,
            discountType
          )
        } catch (error) {
          this.loggerService.error(
            `Error during payment intent refund: ${paymentIntentId}`,
            error.stack,
            {
              service: PaymentIntentsService.name,
              method: this.sendCashbackGroup.name,
              object: { paymentIntentId, discountValue, discountType },
            }
          )
          return Promise.reject({
            message: `Error during payment intent refund: ${paymentIntentId}.`,
            stack: error.stack,
            paymentIntentId,
          })
        }
      })
    )

    // Process and log the results
    const summary = {
      resolved: [] as PaymentIntent[],
      rejected: [] as string[],
    }

    results.forEach((result) => {
      if (result.status === 'rejected') {
        this.loggerService.error('Promise rejected', result.reason, {
          service: PaymentIntentsService.name,
          method: 'sendCashbackGroup',
          reason: result.reason,
        })
        summary.rejected.push(result.reason)
      } else {
        this.loggerService.log('Promise resolved', {
          service: PaymentIntentsService.name,
          method: 'sendCashbackGroup',
          reason: result.value,
        })
        summary.resolved.push(result.value)
      }
    })

    // Return the summary object
    return summary
  }

  async deprecatedWithdrawCashback(
    id: string,
    createWithdrawalDto: CreateWithdrawalDto
  ) {
    const paymentIntent = (await this.findOne(id, {
      expand: ['organization'],
    })) as Prisma.PaymentIntentGetPayload<{
      include: {
        organization: true
      }
    }>

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent ${id} not found.`)
    }

    if (!paymentIntent.organization) {
      throw new NotFoundException(
        `Organization of payment id ${id}  not found.`
      )
    }

    if (paymentIntent.token !== createWithdrawalDto.token) {
      throw new BadRequestException(`Invalid token.`)
    }

    if (!paymentIntent.organization.cashbackBankId) {
      throw new BadRequestException(
        `Organization ${paymentIntent.organization.id} has no cashback bank account.`
      )
    }

    if (paymentIntent.status !== PaymentIntentStatus.CASHBACK_AVAILABLE) {
      throw new BadRequestException(
        `Cashback cannot be withdrawn from Payment intent ${id} because it is not in the correct state.`
      )
    }

    if (!paymentIntent.customerId) {
      throw new BadRequestException(`Payment intent ${id} has no customer.`)
    }

    if (!paymentIntent.amountCashback || paymentIntent.amountCashback <= 0) {
      throw new BadRequestException(
        `Payment intent ${id} has no cashback amount.`
      )
    }

    await this.updatePaymentIntentStatus(
      paymentIntent.id,
      PaymentIntentStatus.CASHBACK_PROCESSING,
      paymentIntent.organizationId,
      paymentIntent.livemode
    )

    await this.prisma.client.paymentIntent.update({
      where: {
        id,
        organizationId: paymentIntent.organizationId,
        livemode: paymentIntent.livemode,
      },
      data: {
        token: null,
      },
    })

    return await this.enqueueCashback(paymentIntent.id, createWithdrawalDto)
  }

  async deprecatedSendCashbackWithdrawalEmail(paymentIntentId: string) {
    const paymentIntent = (await this.findOne(paymentIntentId, {
      expand: ['customer', 'organization.brandSettings', 'paymentGroup'],
    })) as Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        checkoutSession: {
          include: {
            lineItems: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!paymentIntent) {
      throw new NotFoundException(
        `Payment intent ${paymentIntentId} not found.`
      )
    }

    if (!paymentIntent.customer) {
      throw new Error('PaymentIntent has no customer.')
    }

    const currentBrandSettings =
      paymentIntent.organization?.brandSettings?.find(
        (brandSetting) => brandSetting.livemode === paymentIntent.livemode
      )
    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )

    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        paymentIntent.organizationId,
        paymentIntent.livemode,
        EmailType.CASHBACK_WITHDRAWN,
        paymentIntent.customer.locale
      )

    await this.emailsService.enqueue({
      html: transactionalEmail?.body || '',
      fromEmail: transactionalEmail?.fromEmail || '',
      fromName: paymentIntent.organization.fromEmailName || undefined,
      subject: transactionalEmail?.subject || '',
      to: paymentIntent.customer.emailAddress,
      dynamicTemplateData: {
        subject:
          translation(
            paymentIntent.customer.locale || Locale.fr_FR,
            'paymentGroupCashbackWithdrawn',
            'subject'
          ).toString() || '',
        colors: currentBrandSettings?.color ? colors : null,
        paymentIntent: {
          id: paymentIntent.id,
          amount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format(paymentIntent.amount / 100),
          amountCashback: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format(
            paymentIntent.amountCashback
              ? paymentIntent.amountCashback / 100
              : 0
          ),
          createdAt: paymentIntent.createdAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              month: '2-digit',
              day: '2-digit',
            }
          ),
        },
        paymentGroup: {
          ...paymentIntent.paymentGroup,
          shareUrl: `${this.configService.get<string>(
            'MY_KOHORT_APP_URL',
            ''
          )}/${paymentIntent.customer.locale || Locale.fr_FR}/pg/${paymentIntent.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_KOHORT_REF_PAYMENT_CASHBACK_WITHDRAWN}&utm_content=cta_share_button`,
        },
        customer: {
          firstName: paymentIntent.customer.firstName,
        },
        organization: {
          name: paymentIntent.organization.name,
          imageUrl: paymentIntent.organization.imageUrl,
          websiteUrl: formatWebsiteUrl(
            paymentIntent.organization.websiteUrl || ''
          ),
        },
        staticData: translation(
          paymentIntent.customer.locale || Locale.fr_FR,
          'paymentGroupCashbackWithdrawn'
        ),
      },
    })
    this.loggerService.log(
      `Cashback withdrawal email passed to the queue successfully. (KOHORT_REF)`,
      {
        service: PaymentIntentsService.name,
        function: this.deprecatedSendCashbackWithdrawalEmail.name,
        objectId: paymentIntent.id,
      }
    )
  }

  async deprecatedSendCashback(
    id: string,
    discountValue: number,
    discountType: DiscountType,
    updatedBy: string = SYSTEM
  ) {
    const paymentIntent = (await this.findOne(id, {
      expand: [
        'customer',
        'organization',
        'checkoutSession.lineItems',
        'paymentGroup',
      ],
    })) as Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: true
        checkoutSession: {
          include: {
            lineItems: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent ${id} not found.`)
    }

    if (!(paymentIntent.status === PaymentIntentStatus.SUCCEEDED)) {
      throw new BadRequestException(
        `Cashback cannot be sent to Payment intent ${id} because it is not in the correct state.`
      )
    }

    if (!paymentIntent.customer) {
      throw new BadRequestException(`Payment intent ${id} has no customer.`)
    }

    const amountCashback = this.deprecatedComputeCashbackAmount(
      paymentIntent.amount,
      discountValue,
      discountType
    )

    const paymentIntentUpdated = await this.prisma.client.paymentIntent.update({
      where: {
        id,
        organizationId: paymentIntent.organizationId,
        livemode: paymentIntent.livemode,
      },
      data: {
        status: PaymentIntentStatus.CASHBACK_AVAILABLE,
        amountCaptured: paymentIntent.amount - amountCashback,
        amountCashback,
        updatedBy,
        token: randomBytes(32).toString('hex'),
      },
    })
    this.eventEmitter.emit(
      KohortPayEvent.PAYMENT_INTENT_CASHBACK_AVAILABLE,
      new PaymentIntentCashbackAvailableEvent(
        paymentIntentUpdated,
        discountType,
        discountValue
      )
    )

    this.loggerService.log(
      `PaymentIntent ${id} cashback status updated to AVAILABLE successfully.`,
      {
        service: PaymentIntentsService.name,
        function: this.deprecatedSendCashback.name,
        objectId: paymentIntentUpdated.id,
      }
    )

    return paymentIntentUpdated
  }

  // TODO: clean the things that you won't use
  async deprecatedSendCashbackReadyEmail(
    paymentIntentId: string,
    discountType: DiscountType,
    discountValue: number
  ) {
    const paymentIntent = (await this.findOne(paymentIntentId, {
      expand: [
        'customer',
        'organization.brandSettings',
        'checkoutSession.lineItems',
        'paymentGroup',
      ],
    })) as Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        checkoutSession: {
          include: {
            lineItems: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!paymentIntent) {
      throw new NotFoundException(
        `Payment intent ${paymentIntentId} not found.`
      )
    }

    if (!paymentIntent.customer) {
      throw new Error('PaymentIntent has no customer.')
    }

    if (discountValue > 0) {
      const currentBrandSettings =
        paymentIntent.organization?.brandSettings?.find(
          (brandSetting) => brandSetting.livemode === paymentIntent.livemode
        )
      const colors = getColorVariants(
        currentBrandSettings?.color || PRIMARY_COLOR
      )

      const transactionalEmail =
        await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
          paymentIntent.organizationId,
          paymentIntent.livemode,
          EmailType.CASHBACK_AVAILABLE,
          paymentIntent.customer.locale
        )
      await this.emailsService.enqueue({
        subject: transactionalEmail?.subject || '',
        html: transactionalEmail?.body || '',
        to: paymentIntent.customer.emailAddress,
        fromEmail: transactionalEmail?.fromEmail || '',
        fromName: paymentIntent.organization.fromEmailName || undefined,
        dynamicTemplateData: {
          subject:
            translation(
              paymentIntent.customer.locale || Locale.fr_FR,
              'paymentGroupIBANRequest',
              'subject'
            ).toString() || '',
          colors: currentBrandSettings?.color ? colors : null,
          paymentIntent: {
            id: paymentIntent.id,
            amount: new Intl.NumberFormat(
              replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
              {
                style: 'currency',
                currency: paymentIntent.currency,
              }
            ).format(paymentIntent.amount / 100),
            createdAt: paymentIntent.createdAt.toLocaleDateString(
              replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
              {
                month: '2-digit',
                day: '2-digit',
              }
            ),
          },
          paymentGroup: {
            ...paymentIntent.paymentGroup,
            shareUrl: `${this.configService.get<string>(
              'MY_KOHORT_APP_URL',
              ''
            )}/${paymentIntent.customer.locale || Locale.fr_FR}/pg/${paymentIntent.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_KOHORT_REF_PAYMENT_IBAN_REQUEST}&utm_content=cta_share_button`,
          },
          customer: {
            firstName: paymentIntent.customer.firstName,
          },
          organization: {
            name: paymentIntent.organization.name,
            imageUrl: paymentIntent.organization.imageUrl,
            websiteUrl: formatWebsiteUrl(
              paymentIntent.organization.websiteUrl || ''
            ),
          },
          url: `${this.configService.get<string>(
            'CHECKOUT_APP_URL',
            ''
          )}/w/${paymentIntent.id}?token=${paymentIntent.token}`,
          cashbackAmount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format(
            paymentIntent.amountCashback
              ? paymentIntent.amountCashback / 100
              : 0
          ),
          discount: formatDiscount(
            discountValue,
            discountType,
            paymentIntent.customer.locale,
            paymentIntent.currency
          ),
          discountType: discountType == 'PERCENTAGE' ? discountType : null, // to verify in sendgrid
          staticData: translation(
            paymentIntent.customer.locale || Locale.fr_FR,
            'paymentGroupIBANRequest'
          ),
        },
      })
    }
  }

  async deprecatedSendCashbackSentEmail(
    paymentIntentId: string,
    discountValue: number,
    lineItems: object[],
    orderDetails: object[],
    discountType: DiscountType
  ) {
    const paymentIntent = (await this.findOne(paymentIntentId, {
      expand: [
        'customer',
        'organization.brandSettings',
        'checkoutSession.lineItems',
        'paymentGroup',
      ],
    })) as Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: {
          include: {
            brandSettings: true
          }
        }
        checkoutSession: {
          include: {
            lineItems: true
          }
        }
        paymentGroup: true
      }
    }>

    if (!paymentIntent) {
      throw new NotFoundException(
        `Payment intent ${paymentIntentId} not found.`
      )
    }
    if (!paymentIntent.customer) {
      throw new Error('PaymentIntent has no customer.')
    }
    if (discountValue > 0) {
      const currentBrandSettings =
        paymentIntent.organization?.brandSettings?.find(
          (brandSetting) => brandSetting.livemode === paymentIntent.livemode
        )
      const colors = getColorVariants(
        currentBrandSettings?.color || PRIMARY_COLOR
      )

      const transactionalEmail =
        await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
          paymentIntent.organizationId,
          paymentIntent.livemode,
          EmailType.CASHBACK_SENT,
          paymentIntent.customer.locale
        )

      await this.emailsService.enqueue({
        subject: transactionalEmail?.subject || '',
        html: transactionalEmail?.body || '',
        to: paymentIntent.customer.emailAddress,
        fromEmail: transactionalEmail?.fromEmail || '',
        fromName: paymentIntent.organization.fromEmailName || undefined,
        dynamicTemplateData: {
          subject:
            translation(
              paymentIntent.customer.locale || Locale.fr_FR,
              'paymentgroupCashbackSuccess',
              'subject'
            ).toString() || '',
          colors: currentBrandSettings?.color ? colors : null,
          paymentIntent: {
            id: paymentIntent.id,
            amount: new Intl.NumberFormat(
              replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
              {
                style: 'currency',
                currency: paymentIntent.currency,
              }
            ).format(paymentIntent.amount / 100),
            updatedAt: paymentIntent.updatedAt.toLocaleDateString(
              replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
            ),
            createdAt: paymentIntent.createdAt.toLocaleDateString(
              replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
            ),
          },
          paymentGroup: {
            ...paymentIntent.paymentGroup,
            shareUrl: `${this.configService.get<string>(
              'MY_KOHORT_APP_URL',
              ''
            )}/${paymentIntent.customer.locale || Locale.fr_FR}/pg/${paymentIntent.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_DISCOUNT_SUCCESS}&utm_content=cta_share_button`,
          },
          customer: {
            firstName: paymentIntent.customer.firstName,
          },
          organization: {
            name: paymentIntent.organization.name,
            imageUrl: paymentIntent.organization.imageUrl,
            websiteUrl: formatWebsiteUrl(
              paymentIntent.organization.websiteUrl || ''
            ),
          },
          lineItems,
          orderDetails: orderDetails.length > 0 ? orderDetails : null,
          discountAmount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format(
            paymentIntent.amountCashback
              ? paymentIntent.amountCashback / 100
              : 0
          ),
          discount: formatDiscount(
            discountValue,
            discountType,
            paymentIntent.customer.locale,
            paymentIntent.currency
          ),
          discountType: discountType == 'PERCENTAGE' ? discountType : null, // to verify in sendgrid
          staticData: translation(
            paymentIntent.customer.locale || Locale.fr_FR,
            'paymentgroupCashbackSuccess'
          ),
        },
      })
    }
  }

  async deprecatedNoCashbackSentEmail(paymentIntentId: string) {
    const paymentIntent = (await this.findOne(paymentIntentId, {
      expand: ['customer', 'organization.brandSettings', 'paymentGroup'],
    })) as Prisma.PaymentIntentGetPayload<{
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

    if (!paymentIntent) {
      throw new NotFoundException(
        `Payment intent ${paymentIntentId} not found.`
      )
    }
    if (!paymentIntent.customer) {
      throw new Error('PaymentIntent has no customer.')
    }
    const currentBrandSettings = paymentIntent.organization.brandSettings.find(
      (brandSetting) => brandSetting.livemode === paymentIntent.livemode
    )

    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )
    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        paymentIntent.organizationId,
        paymentIntent.livemode,
        EmailType.GROUP_EXPIRED,
        paymentIntent.customer.locale
      )
    await this.emailsService.enqueue({
      subject: transactionalEmail?.subject || '',
      fromEmail: transactionalEmail?.fromEmail || '',
      fromName: paymentIntent.organization.fromEmailName || undefined,
      html: transactionalEmail?.body || '',
      to: paymentIntent.customer.emailAddress,
      dynamicTemplateData: {
        subject:
          translation(
            paymentIntent.customer.locale || Locale.fr_FR,
            'paymentgroupNoCashback',
            'subject'
          ).toString() || '',
        colors: currentBrandSettings?.color ? colors : null,
        paymentIntent: {
          id: paymentIntent.id,
          amount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format(paymentIntent.amount / 100),
          updatedAt: paymentIntent.updatedAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
          ),
          createdAt: paymentIntent.createdAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
          ),
        },
        paymentGroup: {
          ...paymentIntent.paymentGroup,
          shareUrl: `${this.configService.get<string>(
            'MY_KOHORT_APP_URL',
            ''
          )}/${paymentIntent.customer.locale || Locale.fr_FR}/pg/${paymentIntent.paymentGroup?.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_PAYMENT_CAPTURED_NO_DISCOUNT}&utm_content=cta_share_button`,
        },
        customer: {
          firstName: paymentIntent.customer.firstName,
        },
        organization: {
          name: paymentIntent.organization.name,
          formatedWebsiteUrl: formatWebsiteUrl(
            paymentIntent.organization.websiteUrl || ''
          ),
          websiteUrl: paymentIntent.organization.websiteUrl || '',
          imageUrl: paymentIntent.organization.imageUrl,
        },
        staticData: translation(
          paymentIntent.customer.locale || Locale.fr_FR,
          'paymentgroupNoCashback'
        ),
      },
    })
  }

  async deprecatedCreateOrJoinGroup(
    paymentIntentId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const paymentIntent = await this.findOneByOrganizationIdAndLivemode(
      paymentIntentId,
      organizationId,
      livemode
    )

    if (!paymentIntent) {
      throw new NotFoundException(
        `PaymentIntent with id ${paymentIntentId} not found.`
      )
    }

    if (paymentIntent.ambassadorId) {
      return
    }

    if (paymentIntent.customerId && !paymentIntent.paymentGroupId) {
      return await this.paymentGroupsService.create(
        organizationId,
        livemode,
        {
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customerId,
        },
        paymentIntent.customerId
      )
    } else if (paymentIntent.paymentGroupId) {
      return await this.paymentGroupsService.deprecatedJoin(
        paymentIntent.paymentGroupId,
        paymentIntent.id
      )
    }

    this.loggerService.error('Cannot create or join group', undefined, {
      service: PaymentIntentsService.name,
      method: this.deprecatedCreateOrJoinGroup.name,
      object: paymentIntent.id,
    })
    throw new Error('Cannot create or join group.')
  }

  async updateAmountCaptured(id: string, amountCaptured: number) {
    return await this.prisma.client.paymentIntent.update({
      where: { id },
      data: { amountCaptured },
    })
  }

  async deprecatedSendConfirmationEmail(
    paymentIntentId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const paymentIntent = (await this.findOneByOrganizationIdAndLivemode(
      paymentIntentId,
      organizationId,
      livemode,
      {
        expand: ['paymentGroup', 'customer', 'organization.brandSettings'],
      }
    )) as Prisma.PaymentIntentGetPayload<{
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
    if (!paymentIntent) {
      throw new NotFoundException(
        `PaymentIntent with id ${paymentIntentId} not found.`
      )
    }

    if (!paymentIntent.paymentGroupId) {
      throw new Error(
        `PaymentIntent with id ${paymentIntentId} has no paymentGroup.`
      )
    }

    if (!paymentIntent.customer) {
      throw new Error(
        `PaymentIntent with id ${paymentIntentId} has no customer.`
      )
    }

    const paymentGroup = (await this.paymentGroupsService.findOne(
      paymentIntent.paymentGroupId,
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
        `PaymentGroup with id ${paymentIntent.paymentGroupId} not found`
      )
    }

    const participantCount = (
      await this.paymentGroupsService.deprecatedGetParticipants(paymentGroup.id)
    ).count

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

    const maxDiscountAmount = this.deprecatedComputeCashbackAmount(
      paymentIntent.amount,
      maxDiscountValue,
      paymentGroup.paymentGroupSettings?.discountType || 'PERCENTAGE'
    )
    const startingTime = paymentIntent.createdAt.toLocaleDateString(
      replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
    )

    const timeLeft = calculateRemainingTime(paymentGroup.expiresAt)

    const dateToSend = paymentGroup.expiresAt.toLocaleDateString(
      replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
    )
    const discountAmount = this.deprecatedComputeCashbackAmount(
      paymentIntent.amount,
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
      paymentIntent.customer.locale,
      paymentIntent.currency
    )

    const currentDiscountAmount = new Intl.NumberFormat(
      replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
      {
        style: 'currency',
        currency: paymentIntent.currency,
      }
    ).format(discountAmount / 100)

    const currentDiscount = formatDiscount(
      discountValue,
      paymentGroup.paymentGroupSettings?.discountType,
      paymentIntent.customer?.locale,
      paymentIntent.currency
    )

    const currentBrandSettings = paymentIntent.organization.brandSettings.find(
      (brandSetting) => brandSetting.livemode === paymentGroup.livemode
    )
    const colors = getColorVariants(
      currentBrandSettings?.color || PRIMARY_COLOR
    )
    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        paymentIntent.organizationId,
        paymentIntent.livemode,
        participantCount > 1 ? EmailType.JOIN_GROUP : EmailType.NEW_GROUP,
        paymentIntent.customer.locale
      )
    await this.emailsService.enqueue({
      subject: transactionalEmail?.subject || '',
      fromName: paymentIntent.organization.fromEmailName || undefined,
      fromEmail: transactionalEmail?.fromEmail || '',
      html: transactionalEmail?.body || '',
      to: paymentIntent.customer.emailAddress,
      dynamicTemplateData: {
        subject:
          participantCount > 1
            ? `${translation(
                paymentIntent.customer.locale || Locale.fr_FR,
                'paymentProcessedSuccessKohortRef',
                'subjectJoinedKohort'
              ).toString()} ${currentDiscountAmount} ${translation(
                paymentIntent.customer.locale || Locale.fr_FR,
                'paymentProcessedSuccessKohortRef',
                'cashback'
              ).toString()}`
            : `${translation(
                paymentIntent.customer.locale || Locale.fr_FR,
                'paymentProcessedSuccessKohortRef',
                'subjectCreatedKohort'
              ).toString()} ${paymentIntent.organization.name} 🔥`,
        colors: currentBrandSettings?.color ? colors : null,
        paymentIntent: {
          id: paymentIntent.id,
          amount: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format((paymentIntent.amount - discountAmount) / 100),
          updatedAt: paymentIntent.updatedAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
          ),
          createdAt: paymentIntent.createdAt.toLocaleDateString(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale)
          ),
          amountCashback: currentDiscountAmount,
          amountCurrentlyCaptured: new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          ).format(paymentIntent.amount / 100),
        },
        currentDiscount:
          paymentGroup.paymentGroupSettings?.discountType ===
          DiscountType.PERCENTAGE
            ? currentDiscount
            : null, // to not show it if they are the same
        organization: paymentIntent.organization,
        maxCashbackAmount: new Intl.NumberFormat(
          replaceUnderscoreWithHyphen(paymentIntent.customer.locale),
          {
            style: 'currency',
            currency: paymentIntent.currency,
          }
        ).format(maxDiscountAmount / 100),
        nextDiscountLevel,
        paymentGroup: {
          ...paymentGroup,
          shareUrl: `${this.configService.get<string>(
            'MY_KOHORT_APP_URL',
            ''
          )}/${paymentIntent.customer.locale || Locale.fr_FR}/pg/${paymentGroup.shareId}?utm_source=${EMAIL_PROVIDER}&utm_medium=email&utm_campaign=${TEMPLATE_KOHORT_REF_PAYMENT_SUCCESS}&utm_content=cta_share_button`,
        },
        customer: {
          firstName: paymentIntent.customer.firstName,
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
          paymentIntent.customer.locale || Locale.fr_FR,
          'paymentProcessedSuccessKohortRef'
        ),
      },
    })
    if (
      paymentIntent.customer.phoneNumber &&
      paymentGroup.paymentGroupSettings?.whatsappCommunication
    ) {
      if (
        paymentIntent.customer.phoneNumber &&
        paymentGroup.paymentGroupSettings?.whatsappCommunication
      ) {
        if (participantCount <= 1) {
          const isProduction =
            this.configService.get('NODE_ENV') === NODE_ENV_PROD
          const locale = paymentIntent.customer.locale || Locale.fr_FR
          const customerFirstName = paymentIntent.customer.firstName || ''
          const organizationName = paymentIntent.organization.name || ''
          const currencyFormatter = new Intl.NumberFormat(
            replaceUnderscoreWithHyphen(locale),
            {
              style: 'currency',
              currency: paymentIntent.currency,
            }
          )
          const formattedDiscount = currencyFormatter.format(
            maxDiscountAmount / 100
          )
          const recipientPhoneNumber = formatPhoneNumber(
            paymentIntent.customer.phoneNumber
          )
          const appUrl = this.configService.get<string>('MY_KOHORT_APP_URL', '')

          const shortUrl = `${appUrl}/r/${encodeUrlParams(locale, paymentGroup.shareId, true)}`

          this.loggerService.log(
            `Sending WhatsApp messages to customer with ID: ${paymentIntent.id}`,
            {
              service: PaymentIntentsService.name,
              method: this.deprecatedSendConfirmationEmail.name,
              object: paymentIntent.id,
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
              formatLink(paymentIntent.organization.websiteUrl || ''),
              formattedDiscount,
              `${shortUrl}`,
            ],
          })

          this.loggerService.log(
            `Successfully sent WhatsApp messages to customer with ID: ${paymentIntent.id}`,
            {
              service: PaymentIntentsService.name,
              method: this.deprecatedSendConfirmationEmail.name,
              object: paymentIntent.id,
            }
          )
        }
      } else {
        this.loggerService.log(
          `No WhatsApp message was sent due to either a missing phone number or disabled WhatsApp communication setting for the customer associated with the PaymentIntent with id: ${paymentIntent.id}`,
          {
            service: PaymentIntentsService.name,
            method: this.deprecatedSendConfirmationEmail.name,
            object: paymentIntent.id,
          }
        )
      }
    }
  }

  async deprecatedCreateCustomer(
    checkoutSessionId: string,
    organizationId: string,
    livemode: boolean
  ) {
    const checkoutSession =
      await this.checkoutSessionsService.findOneByOrganizationIdAndLivemode(
        checkoutSessionId,
        organizationId,
        livemode
      )
    if (!checkoutSession) {
      throw new NotFoundException(
        `CheckoutSession with id ${checkoutSessionId} not found.`
      )
    }
    if (
      !checkoutSession.customerEmail ||
      !checkoutSession.customerFirstName ||
      !checkoutSession.customerLastName
    ) {
      throw new Error(
        `CheckoutSession with id ${checkoutSessionId} is missing customer information. Cannot find or create new Customer.`
      )
    }
    const customer =
      await this.customersService.findOneByEmailAndOrganizationIdAndLivemodeWithDeleted(
        checkoutSession.customerEmail,
        organizationId,
        livemode
      )
    if (customer) {
      if (customer.deletedAt) {
        await this.customersService.update(
          customer.id,
          customer.organizationId,
          customer.livemode,
          { deletedAt: null }
        )
      }
      if (
        checkoutSession.customerPhoneNumber &&
        checkoutSession.customerPhoneNumber !== customer.phoneNumber
      ) {
        return await this.customersService.update(
          customer.id,
          customer.organizationId,
          customer.livemode,
          {
            phoneNumber: checkoutSession.customerPhoneNumber,
          }
        )
      }
      return customer
    }

    return await this.customersService.create(organizationId, livemode, {
      emailAddress: checkoutSession.customerEmail,
      firstName: checkoutSession.customerFirstName,
      lastName: checkoutSession.customerLastName,
      phoneNumber: checkoutSession.customerPhoneNumber,
      locale: checkoutSession.locale,
    })
  }

  async deprecatedSendApplicationFeeAmount(
    paymentIntent: PaymentIntent,
    joinPaymentGroup: boolean
  ) {
    const applicationFeeAmount =
      await this.deprecatedComputeApplicationFeeAmount(
        paymentIntent,
        joinPaymentGroup
      )

    return this.prisma.client.paymentIntent.update({
      where: {
        id: paymentIntent.id,
        organizationId: paymentIntent.organizationId,
        livemode: paymentIntent.livemode,
      },
      data: {
        applicationFeeAmount,
      },
    })
  }

  async deprecatedComputeApplicationFeeAmount(
    paymentIntent: PaymentIntent,
    joinPaymentGroup: boolean
  ) {
    // This method is used to compute the applicationFeeAmount of a paymentIntent.
    // It is highly critical and changes should be made with extreme caution.
    // Several things to keep in mind:
    // The return value is in cents
    // Math.round is used to avoid javascript decimal issues

    const organization = await this.organizationService.findOne(
      paymentIntent.organizationId
    )
    if (!organization) {
      throw new Error(
        `Organization with id ${paymentIntent.organizationId} not found`
      )
    }

    // If the payment intent is joining a payment group, we take kohortAcquisitionFees
    if (joinPaymentGroup) {
      return this.calculateFeesWithVAT(
        Math.round(
          (organization.kohortAcquisitionFees.toNumber() *
            paymentIntent.amount) /
            100
        )
      )
    }

    return 0
  }

  async calculateFeesWithVAT(feesWithoutVAT: number) {
    const vatAmount = Math.round(feesWithoutVAT * VAT_RATE)
    return feesWithoutVAT + vatAmount
  }

  deprecatedComputeCashbackAmount(
    amount: number,
    discountValue: number,
    discountType: DiscountType
  ) {
    // This method is used to compute the discountAmount of a paymentIntent.
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

  async enqueueCashback(id: string, createWithdrawalDto: CreateWithdrawalDto) {
    await this.withdrawCashbackQueue.add(QueueName.WITHDRAW_CASHBACK, {
      id,
      createWithdrawalDto,
    })
  }

  async enqueueCashbacks(
    paymentIntentIds: string[],
    discountValue: number,
    discountType: DiscountType
  ) {
    await this.sendCashbackPaymentIntentQueue.add(QueueName.SEND_CASHBACK, {
      paymentIntentIds,
      discountValue,
      discountType,
    })
  }
}
