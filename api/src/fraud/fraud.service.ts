import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Customer, Prisma, RiskLevel } from '@prisma/client'
import { distance } from 'fastest-levenshtein'

import { COMMON_EMAIL_DOMAIN_NAMES } from '../common/constants/email-domain-names.constants'
import {
  FRAUD_EMAIL_SIMILARITY_THRESHOLD,
  NODE_ENV_PROD,
} from '../common/constants/miscellaneous.constants'
import {
  AYMERIC_USER_ID,
  MARTIN_USER_ID,
} from '../common/constants/slack.constants'
import { sanitizeEmail } from '../common/utils/sanitize'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersService } from '../orders/orders.service'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { SlackService } from '../slack/slack.service'

@Injectable()
export class FraudService {
  constructor(
    private readonly slackService: SlackService,
    private readonly configService: ConfigService,
    private readonly paymentGroupService: PaymentGroupsService,
    private readonly loggerService: DefaultScopedLoggerService,
    private readonly ordersService: OrdersService
  ) {}

  async assess(orderId: string, organizationId: string, livemode: boolean) {
    const order = (await this.ordersService.findOneByOrganizationIdAndLivemode(
      orderId,
      organizationId,
      livemode,
      { expand: ['paymentGroup', 'customer', 'organization'] }
    )) as Prisma.OrderGetPayload<{
      include: {
        paymentGroup: true
        customer: true
        organization: true
      }
    }>

    if (!order) {
      throw new NotFoundException(
        `Payment intent with id ${orderId} not found.`
      )
    }
    if (!order.paymentGroup) {
      throw new NotFoundException(
        `Payment intent with id ${orderId} has no paymentGroup.`
      )
    }
    if (!order.customer) {
      throw new NotFoundException(
        `Payment intent with id ${orderId} has no customer.`
      )
    }

    const risk = await this.evaluateKohortPayRiskLevel(order)
    this.loggerService.log('Evaluating KohortPay risk', {
      service: FraudService.name,
      function: this.assess.name,
      objectId: order.id,
      data: risk,
    })

    await this.ordersService.updateRiskLevel(
      orderId,
      organizationId,
      livemode,
      risk
    )

    if (risk !== RiskLevel.LOW) {
      await this.sendSlack(order, risk)
    }
  }

  async evaluateKohortPayRiskLevel(
    order: Prisma.OrderGetPayload<{
      include: {
        paymentGroup: true
        customer: true
        organization: true
      }
    }>
  ) {
    // If we are not in livemode, not a real payment so no risks
    if (
      this.configService.get('NODE_ENV') === NODE_ENV_PROD &&
      order.livemode === false
    ) {
      return RiskLevel.LOW
    }

    // If paymentGroup is not defined, no risks from KohortPay
    if (!order.paymentGroup || !order.customer) {
      return RiskLevel.LOW
    }

    const paymentIntentsWithCustomer =
      await this.paymentGroupService.getCustomers(order.paymentGroup.id)

    // Retrieve the list of customers that have already paid in this paymentGroup, except the current customer
    const customers = paymentIntentsWithCustomer
      .filter(
        (payment) =>
          payment.customer?.id !== order.customer?.id &&
          payment.customerId !== null
      )
      .map((payment) => payment.customer as Customer)

    // If same names more than once, fraud is very probable
    if (await this.hasSimilarNameInGroup(order.customer, customers)) {
      return RiskLevel.HIGHEST
    }

    // If same email or same phone number more than once, fraud is probable
    if (
      (await this.hasSimilarPhoneNumberInGroup(order.customer, customers)) ||
      (await this.hasSimilarEmailInGroup(order.customer, customers))
    ) {
      return RiskLevel.HIGH
    }

    // If same domain name more than once, fraud is possible
    if (await this.hasSameDomainNameInGroup(order.customer, customers)) {
      return RiskLevel.MEDIUM
    }
    return RiskLevel.LOW
  }

  async hasSimilarNameInGroup(
    customer: Customer,
    customersInGroup: Customer[]
  ) {
    if (customer.lastName && customer.firstName) {
      const key = `${customer.firstName.toLowerCase()} ${customer.lastName.toLowerCase()}`
      return customersInGroup.some((cus) => {
        if (!cus.firstName || !cus.lastName) {
          return false
        }

        return (
          `${cus.firstName.toLowerCase()} ${cus.lastName.toLowerCase()}` === key
        )
      })
    }
    return false
  }

  async hasSimilarEmailInGroup(
    customer: Customer,
    customersInGroup: Customer[]
  ) {
    // We use the levenshtein distance to compare the similarity of the email addresses
    return customersInGroup.some((cus) => {
      return (
        distance(
          sanitizeEmail(cus.emailAddress),
          sanitizeEmail(customer.emailAddress)
        ) < FRAUD_EMAIL_SIMILARITY_THRESHOLD
      )
    })
  }

  async hasSimilarPhoneNumberInGroup(
    customer: Customer,
    customersInGroup: Customer[]
  ) {
    if (customer.phoneNumber) {
      return customersInGroup.some((cus) => {
        return cus.phoneNumber === customer.phoneNumber
      })
    }
    return false
  }

  async hasSameDomainNameInGroup(
    customer: Customer,
    customersInGroup: Customer[]
  ) {
    if (customer.emailAddress) {
      const domain = customer.emailAddress.split('@')[1]

      // If common domain name, not appplicable for fraud
      if (COMMON_EMAIL_DOMAIN_NAMES.includes(domain)) {
        return false
      }
      return customersInGroup.some((cus) => {
        if (cus.emailAddress) {
          return cus.emailAddress.split('@')[1] === domain
        }
        return false
      })
    }
    return false
  }

  async sendSlack(
    order: Prisma.OrderGetPayload<{
      include: {
        paymentGroup: true
        customer: true
        organization: true
      }
    }>,
    riskLevel: RiskLevel
  ) {
    const riskLevelEmoji =
      riskLevel === RiskLevel.HIGHEST
        ? ':rotating_light:'
        : riskLevel === RiskLevel.HIGH
          ? ':red_circle:'
          : ':large_orange_circle:'
    const text = `${riskLevelEmoji} ${this.configService.get('NODE_ENV') !== NODE_ENV_PROD ? `[${this.configService.get('NODE_ENV')}]` : `<@${MARTIN_USER_ID}> <@${AYMERIC_USER_ID}>`} 
    Order for ${order.organization.name} has been assessed as *${riskLevel}* risk level.
    Order id: \`${order.id}\`
    Payment group id: \`${order.paymentGroup?.id}\``
    return await this.slackService.enqueue({
      text,
      webhook: 'SLACK_FRAUD_WEBHOOK_URL',
    })
  }
}
