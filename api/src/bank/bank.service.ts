import { HttpService } from '@nestjs/axios'
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
  Customer,
  OrderStatus,
  PaymentIntentStatus,
  Prisma,
} from '@prisma/client'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrderCashbackSentEvent } from '../orders/events/order-cashback-sent.event'
import { OrdersService } from '../orders/orders.service'
import { CreateWithdrawalDto } from '../payment-intents/dto/create-withdrawal.dto'
import { PaymentIntentCashbackSentEvent } from '../payment-intents/events/payment-intent-cashback-sent.event'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'

@Injectable()
export class BankService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loggerService: DefaultScopedLoggerService,
    private readonly idsService: IdsService,
    @Inject(forwardRef(() => PaymentIntentsService))
    private readonly paymentIntentsService: PaymentIntentsService,
    private eventEmitter: EventEmitter2,
    private ordersService: OrdersService
  ) {}

  async refreshAccessToken() {
    const requestBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.configService.get<string>(
        'REVOLUT_REFRESH_TOKEN',
        ''
      ),
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: this.configService.get<string>(
        'REVOLUT_CLIENT_ASSERTION_TOKEN',
        ''
      ),
    })

    const response = await firstValueFrom(
      this.httpService
        .post(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/auth/token`,
          requestBody,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error refreshing access token: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.refreshAccessToken.name,
              }
            )

            throw new BadRequestException(
              `Error refreshing access token: ${error.message}`
            )
          })
        )
    )

    return response.data.access_token
  }

  async createPayoutLink(paymentIntentId: string) {
    const paymentIntent = (await this.paymentIntentsService.findOne(
      paymentIntentId,
      { expand: ['customer', 'organization'] }
    )) as Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: true
      }
    }>

    if (!paymentIntent) {
      throw new NotFoundException(
        `Payment intent with ID ${paymentIntentId} not found.`
      )
    }

    if (!paymentIntent.organization.cashbackBankId) {
      throw new NotFoundException(
        `No cashback bank account found for organization with ID ${paymentIntent.organizationId}.`
      )
    }

    if (!paymentIntent.amountCashback) {
      throw new BadRequestException(
        `No cashback amount found for payment intent with ID ${paymentIntentId}.`
      )
    }

    const payload = JSON.stringify({
      counterparty_name: `${paymentIntent.customer?.firstName} ${paymentIntent.customer?.lastName}`,
      request_id: this.idsService.createId('plink'),
      account_id: paymentIntent.organization.cashbackBankId,
      amount: paymentIntent.amountCashback / 100,
      currency: paymentIntent.currency,
      reference: `Cashback KohortPay ${paymentIntent.id}`,
    })

    this.loggerService.log('Creating payout link', {
      controller: BankService.name,
      function: this.createPayoutLink.name,
      object: paymentIntent.id,
    })

    const accessToken = await this.refreshAccessToken()

    const response = await firstValueFrom(
      this.httpService
        .post(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/payout-links`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error creating payout link: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.createPayoutLink.name,
                object: paymentIntent.id,
              }
            )
            throw new Error(`Error creating payout link: ${error.message}`)
          })
        )
    )

    this.loggerService.log('Successfully created payout link', {
      controller: BankService.name,
      function: this.createPayoutLink.name,
      paymentLinkId: response.data.id,
      object: paymentIntent.id,
    })

    return response.data.url
  }

  async sendCashback(id: string, createWithdrawalDto: CreateWithdrawalDto) {
    const order = (await this.ordersService.findOne(id, {
      expand: ['customer', 'organization'],
    })) as Prisma.OrderGetPayload<{
      include: {
        customer: true
        organization: true
      }
    }>

    const paymentIntent = (await this.paymentIntentsService.findOne(id, {
      expand: ['customer', 'organization'],
    })) as Prisma.PaymentIntentGetPayload<{
      include: {
        customer: true
        organization: true
      }
    }>

    if (!order && !paymentIntent) {
      throw new NotFoundException(
        `Order or Payment intent with ID ${id} not found.`
      )
    }

    const customer = order?.customer ?? paymentIntent.customer
    if (!customer) {
      throw new BadRequestException(
        `Order or Payment intent with ID ${id} has no customers.`
      )
    }

    if (paymentIntent.livemode === true) {
      // We do not interact with the bank in test mode
      const counterparty = await this.createCounterparty(
        customer,
        createWithdrawalDto.iban,
        order?.currency ?? paymentIntent.currency
      )

      await this.sendBankTransfer(
        order?.id ?? paymentIntent.id,
        order?.amountCashback ?? paymentIntent.amountCashback ?? 0,
        order?.organization.cashbackBankId ??
          paymentIntent.organization.cashbackBankId,
        counterparty.id,
        order?.currency ?? paymentIntent.currency
      )
      await this.deleteCounterparty(counterparty.id)
    }

    if (order) {
      const orderUpdated = await this.ordersService.updateOrderStatus(
        order.id,
        OrderStatus.CASHBACK_SENT,
        order.organizationId,
        order.livemode
      )

      this.eventEmitter.emit(
        KohortPayEvent.ORDER_CASHBACK_SENT,
        new OrderCashbackSentEvent(orderUpdated)
      )

      this.loggerService.log(`Order ${id} cashback withdrawn successfully.`, {
        service: PaymentIntentsService.name,
        function: this.sendCashback.name,
        objectId: orderUpdated.id,
      })
    } else if (paymentIntent) {
      const paymentIntentUpdated =
        await this.paymentIntentsService.updatePaymentIntentStatus(
          paymentIntent.id,
          PaymentIntentStatus.CASHBACK_SENT,
          paymentIntent.organizationId,
          paymentIntent.livemode
        )

      this.eventEmitter.emit(
        KohortPayEvent.PAYMENT_INTENT_CASHBACK_SENT,
        new PaymentIntentCashbackSentEvent(paymentIntentUpdated)
      )

      this.loggerService.log(
        `PaymentIntent ${id} cashback withdrawn successfully (KOHORT_REF).`,
        {
          service: PaymentIntentsService.name,
          function: this.sendCashback.name,
          objectId: paymentIntentUpdated.id,
        }
      )
    } else {
      throw new NotFoundException(
        `Order or Payment intent with ID ${id} not found.`
      )
    }
  }

  async createCounterparty(
    customer: Customer,
    iban: string,
    currency: Currency
  ) {
    const accessToken = await this.refreshAccessToken()

    const payload = JSON.stringify({
      individual_name: {
        first_name: customer.firstName,
        last_name: customer.lastName,
      },
      iban,
      currency,
      bank_country: iban.slice(0, 2).toUpperCase(),
    })

    const response = await firstValueFrom(
      this.httpService
        .post(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/counterparty`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error)
            this.loggerService.error(
              `Error creating counterparty: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.createCounterparty.name,
                object: customer.id,
              }
            )
            throw new Error(`Error creating counterparty: ${error.message}`)
          })
        )
    )

    return response.data
  }

  async sendBankTransfer(
    paymentIntentId: string,
    amountCashback: number,
    cashbackBankId: string | null,
    counterpartyId: string,
    currency: Currency
  ) {
    const accessToken = await this.refreshAccessToken()

    const payload = JSON.stringify({
      request_id: this.idsService.createId('transfer'),
      account_id: cashbackBankId,
      amount: amountCashback / 100,
      reference: `Cashback KohortPay ${paymentIntentId}`,
      receiver: {
        counterparty_id: counterpartyId,
      },
      currency,
    })

    const response = await firstValueFrom(
      this.httpService
        .post(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/pay`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error sending bank transfer: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.sendBankTransfer.name,
                object: counterpartyId,
              }
            )
            throw new Error(`Error sending bank transfer: ${error.message}`)
          })
        )
    )

    return response.data
  }

  async deleteCounterparty(counterpartyId: string) {
    const accessToken = await this.refreshAccessToken()

    const response = await firstValueFrom(
      this.httpService
        .delete(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/counterparty/${counterpartyId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error deleting counterparty: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.createCounterparty.name,
                object: counterpartyId,
              }
            )
            throw new Error(`Error deleting counterparty: ${error.message}`)
          })
        )
    )

    return response.data
  }

  async getAccountDetails(accountId: string) {
    const accessToken = await this.refreshAccessToken()

    let response = await firstValueFrom(
      this.httpService
        .get(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/accounts/${accountId}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error retrieving bank account for account ID ${accountId}: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.getAccountDetails.name,
                object: accountId,
              }
            )
            throw new Error(
              `Error retrieving bank account for account ID ${accountId}: ${error.message}`
            )
          })
        )
    )

    const bankAccountData = response.data

    response = await firstValueFrom(
      this.httpService
        .get(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/accounts/${accountId}/bank-details`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error retrieving bank account details for account ID ${accountId}: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.getAccountDetails.name,
                object: accountId,
              }
            )
            throw new Error(
              `Error retrieving bank account details for account ID ${accountId}: ${error.message}`
            )
          })
        )
    )

    return Object.assign(bankAccountData, ...response.data)
  }

  async getAccountTransactions(accountId: string, to: string | undefined) {
    const accessToken = await this.refreshAccessToken()

    to = to ? `&to=${to}` : ''

    const response = await firstValueFrom(
      this.httpService
        .get(
          `${this.configService.get<string>('REVOLUT_API_URL', '')}/transactions?account=${accountId}&count=10${to}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.loggerService.error(
              `Error retrieving bank transactions for account ID ${accountId}: ${error.message}`,
              error.stack,
              {
                service: BankService.name,
                function: this.getAccountDetails.name,
                object: accountId,
              }
            )
            throw new Error(
              `Error retrieving bank transactions for account ID ${accountId}: ${error.message}`
            )
          })
        )
    )

    return response.data
  }
}
