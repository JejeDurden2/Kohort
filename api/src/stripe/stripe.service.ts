import { InjectStripeClient } from '@golevelup/nestjs-stripe'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { Address, Bill, BillStatus, Organization, User } from '@prisma/client'
import Stripe from 'stripe'

import { FRENCH_VAT_RATE_ID_STAGING } from '../common/constants/stripe.constants'
import { translation } from '../common/locales/locale'
import { replaceUnderscoreWithHyphen } from '../common/utils/replace-undescore-with-hyphen'
import { OrganizationsService } from '../organizations/organizations.service'

@Injectable()
export class StripeService {
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationsService: OrganizationsService
  ) {}

  //#region Invoice
  async createInvoice(bill: Bill) {
    const organization = await this.organizationsService.findOne(
      bill.organizationId
    )
    if (!organization) {
      throw new NotFoundException(
        `Organization ${bill.organizationId} does not exist.`
      )
    }

    if (!organization.stripeCustomerId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a stripeCustomerId.`
      )
    }

    // We need a customer id to create an invoice
    const customer = await this.stripeClient.customers.retrieve(
      organization.stripeCustomerId
    )

    const invoice = await this.stripeClient.invoices.create({
      auto_advance: true,
      currency: bill.currency.toLowerCase(),
      collection_method: 'send_invoice',
      customer: customer.id,
      due_date: Date.parse(bill.dueDate.toDateString()) / 1000,
    })

    await this.stripeClient.invoiceItems.create({
      amount: bill.amount,
      description:
        translation(
          // @ts-expect-error 2339 - type missing from stripe-node
          customer.preferred_locales[0],
          'invoice',
          'description'
        ).toString() || '',
      currency: invoice.currency,
      customer: customer.id,
      invoice: invoice.id,
    })

    const finalizedInvoice = await this.stripeClient.invoices.finalizeInvoice(
      invoice.id
    )

    return finalizedInvoice
  }

  async regenerateInvoice(bill: Bill, organization: Organization) {
    if (!organization.stripeCustomerId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a stripeCustomerId.`
      )
    }

    if (!bill.stripeId) {
      throw new BadRequestException(
        `Bill ${bill.id} does not have a Stripe invoiceId.`
      )
    }

    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException(
        `Bill ${bill.id} has already been paid. Cannot regenerate invoice.`
      )
    }

    const invoice = await this.stripeClient.invoices.retrieve(bill.stripeId)

    const invoiceItems = invoice.lines

    const newInvoice = await this.stripeClient.invoices.create({
      auto_advance: true,
      currency: bill.currency.toLowerCase(),
      collection_method: 'send_invoice',
      customer: organization.stripeCustomerId,
      default_tax_rates: [
        bill.livemode ? FRENCH_VAT_RATE_ID_STAGING : FRENCH_VAT_RATE_ID_STAGING,
      ],
      due_date: Date.parse(bill.dueDate.toDateString()) / 1000,
    })

    for (const item of invoiceItems.data) {
      await this.stripeClient.invoiceItems.create({
        customer: organization.stripeCustomerId,
        invoice: newInvoice.id,
        amount: item.amount,
        currency: item.currency,
        description: item.description || '',
      })
    }

    await this.stripeClient.invoices.voidInvoice(bill.stripeId)

    return await this.stripeClient.invoices.finalizeInvoice(newInvoice.id)
  }

  async getInvoicePdf(invoiceId: string) {
    const invoice = await this.stripeClient.invoices.retrieve(invoiceId)
    if (invoice.invoice_pdf) {
      return invoice.invoice_pdf
    }
    throw new NotFoundException(`Invoice ${invoiceId} has no PDF.`)
  }

  //#endregion Invoice

  //#region Customer
  async createCustomer(organization: Organization, user: User) {
    return await this.stripeClient.customers.create({
      email: user.primaryEmailAddress,
      name: organization.name,
      preferred_locales: [replaceUnderscoreWithHyphen(user.locale)],
    })
  }

  async updateCustomer(
    organization: Organization,
    address?: Partial<Address> | null,
    billingEmail?: string
  ) {
    if (!organization.stripeCustomerId) {
      throw new BadRequestException(
        `Organization ${organization.id} does not have a stripeCustomerId.`
      )
    }

    const updateData: {
      address?: {
        line1?: string
        line2?: string
        city?: string
        postal_code?: string
        state?: string
        country?: string
      }
      email?: string
    } = {}
    if (address) {
      updateData.address = {
        line1: address.addressLine1 as string,
        line2: address.addressLine2 as string,
        city: address.city as string,
        postal_code: address.postalCode as string,
        state: address.state as string,
        country: address.country as string,
      }
    }
    if (billingEmail) {
      updateData.email = billingEmail
    }

    // Update the customer in Stripe
    return await this.stripeClient.customers.update(
      organization.stripeCustomerId,
      updateData
    )
  }
}
