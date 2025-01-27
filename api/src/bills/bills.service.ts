import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { BillStatus, Currency, Organization, Prisma } from '@prisma/client'
import axios from 'axios'
import { Response } from 'express'
import { CustomPrismaService } from 'nestjs-prisma'
import { Readable } from 'stream'
import Stripe from 'stripe'

import { BILL_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { BILL_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { extendedPrismaClient } from '../prisma.extension'
import { StripeService } from '../stripe/stripe.service'

@Injectable()
export class BillsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly loggerService: DefaultScopedLoggerService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationsService: OrganizationsService,
    @Inject(forwardRef(() => PaymentIntentsService))
    private paymentIntentsService: PaymentIntentsService
  ) {}

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(BILL_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(Prisma.BillScalarFieldEnum, query?.orderBy)
    const search = formatSearch(Prisma.BillScalarFieldEnum, query?.search)
    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.bill.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: { organizationId, livemode, ...search },
      }),
      this.prisma.client.bill.count({
        where: { organizationId, livemode, ...search },
      }),
    ])
    return { data, count }
  }

  async create(
    organizationId: string,
    livemode: boolean,
    amount: number,
    currency: Currency,
    createdBy: string = SYSTEM
  ) {
    const id = this.idsService.createId(BILL_DATABASE_PREFIX)
    const lastBillNumber =
      await this.findNumberOfBillsByOrganizationIdAndLivemode(
        organizationId,
        livemode
      )
    const billId = this.idsService.createBillId(
      lastBillNumber,
      organizationId,
      livemode
    )

    const in30Days = new Date()
    in30Days.setDate(in30Days.getDate() + 30)

    const bill = await this.prisma.client.bill.create({
      data: {
        id,
        billId,
        amount,
        currency,
        organization: { connect: { id: organizationId } },
        createdBy,
        createdAt: new Date(),
        dueDate: in30Days,
        updatedBy: createdBy,
      },
    })
    return bill
  }

  async findLastBillByOrganizationId(organizationId: string) {
    return await this.prisma.client.bill.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string, livemode: boolean) {
    const bill = await this.prisma.client.bill.findUnique({
      where: { id, organizationId, livemode },
    })
    return bill
  }

  async downloadPdf(
    id: string,
    organization: Organization,
    livemode: boolean = false,
    response: Response
  ) {
    const bill = await this.findOne(id, organization.id, livemode)
    if (!bill) {
      throw new NotFoundException(`Bill with id ${id} not found`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attachment: any | Readable | null = null

    if (bill.stripeId) {
      const pdf = await this.stripeService.getInvoicePdf(bill.stripeId)
      attachment = (
        await axios.get(pdf, {
          responseType: 'stream',
        })
      ).data
    }

    this.loggerService.log(`Downloading bill ${id}`, {
      service: BillsService.name,
      method: this.downloadPdf.name,
      object: bill.id,
    })

    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${bill.billId}.pdf`
    )
    response.setHeader('Content-Type', 'application/pdf')
    attachment.pipe(response)

    return { message: 'Bill downloaded successfully.' }
  }

  async regenerate(id: string, organizationId: string, livemode: boolean) {
    const bill = await this.findOne(id, organizationId, livemode)
    if (!bill) {
      throw new NotFoundException(`Bill with id ${id} not found.`)
    }
    if (!bill.stripeId) {
      throw new BadRequestException(`Bill with id ${id} has no stripe id.`)
    }

    const organization = await this.organizationsService.findOne(organizationId)
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`
      )
    }
    if (!organization.stripeCustomerId) {
      throw new BadRequestException(
        `Organization with id ${organizationId} has no Stripe account`
      )
    }

    const stripeInvoice = await this.stripeService.regenerateInvoice(
      bill,
      organization
    )
    if (!stripeInvoice) {
      throw new InternalServerErrorException(
        `Error regenerating invoice for bill ${id}.`
      )
    }
    await this.prisma.client.bill.update({
      where: { id, livemode, organizationId: organization.id },
      data: { stripeId: stripeInvoice.id },
    })

    return { message: 'Bill regenerated successfully.' }
  }

  async findNumberOfBillsByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean
  ) {
    const organization = await this.organizationsService.findOne(organizationId)
    if (!organization) {
      throw new BadRequestException(
        `Organization with id ${organizationId} not found`
      )
    }
    return await this.prisma.client.bill.count({
      where: { organizationId, livemode },
    })
  }

  async sendKohortReferralBill(organization: Organization) {
    const lastBill = await this.findLastBillByOrganizationId(organization.id)

    const payments =
      await this.paymentIntentsService.findAllSucceededByOrganizationIdSinceDate(
        organization.id,
        lastBill ? lastBill.createdAt : organization.createdAt,
        true
      )

    const amount = payments.reduce(
      (acc, payment) => acc + (payment.applicationFeeAmount || 0),
      0
    )

    this.loggerService.log(`amount for org ${organization.id} payments`, {
      amount,
    })

    if (amount === 0) {
      // If amount is 0, no need to create a bill
      return
    }

    const bill = await this.create(organization.id, true, amount, Currency.EUR)
    this.loggerService.log('Kohort referral bill created', {
      service: BillsService.name,
      function: this.sendKohortReferralBill.name,
      object: bill.id,
    })

    const stripeInvoice = await this.stripeService.createInvoice(bill)
    this.loggerService.log('Stripe invoice created', {
      service: BillsService.name,
      function: this.sendKohortReferralBill.name,
      object: stripeInvoice.id,
    })

    const updatedBill = await this.prisma.client.bill.update({
      where: { id: bill.id },
      data: { stripeId: stripeInvoice.id },
    })

    return updatedBill
  }

  async updateBillStatus(stripeInvoice: Stripe.Invoice, status: BillStatus) {
    const bill = await this.prisma.client.bill.findUnique({
      where: { stripeId: stripeInvoice.id },
    })
    if (!bill) {
      throw new NotFoundException(
        `Bill with stripe id ${stripeInvoice.id} not found.`
      )
    }

    const updatedBill = await this.prisma.client.bill.update({
      where: { id: bill.id },
      data: { status },
    })

    return updatedBill
  }
}
