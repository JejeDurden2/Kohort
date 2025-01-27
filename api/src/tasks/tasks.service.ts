import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AxiosError } from '@nestjs/terminus/dist/errors/axios.error'
import { DiscountType, ReminderEmailSentStatus } from '@prisma/client'
import { catchError, firstValueFrom } from 'rxjs'

import { BillsService } from '../bills/bills.service'
import { NODE_ENV_PROD } from '../common/constants/miscellaneous.constants'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrdersService } from '../orders/orders.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'

@Injectable()
export class TasksService {
  constructor(
    private httpService: HttpService,
    private readonly logger: DefaultScopedLoggerService,
    private configService: ConfigService,
    private paymentGroupsService: PaymentGroupsService,
    private organizationsService: OrganizationsService,
    private billsService: BillsService,
    private ordersService: OrdersService,
    private paymentIntentsService: PaymentIntentsService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'betterStackHeartbeat',
  })
  async betterStackHeartbeat() {
    if (process.env.NODE_ENV === NODE_ENV_PROD) {
      this.logger.log('Sending heartbeat to BetterStack')
      const betterStackUrl = this.configService.get(
        'BETTERSTACK_CRON_HEARTBEAT',
        ''
      )
      if (betterStackUrl) {
        await firstValueFrom(
          this.httpService.post(betterStackUrl).pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                'Heartbeat sent to BetterStack',
                error.response.data,
                {
                  service: TasksService.name,
                  function: this.betterStackHeartbeat.name,
                }
              )
              throw new Error(`Error sending heartbeat to BetterStack`)
            })
          )
        )
        this.logger.log('Heartbeat sent to BetterStack', {
          service: TasksService.name,
          function: this.betterStackHeartbeat.name,
        })
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'reminderEmailsMid',
  })
  async reminderEmails() {
    this.logger.log('Cron reminderEmails: task starting...', {
      service: TasksService.name,
      function: this.reminderEmails.name,
    })
    let successCount = 0
    let errorCount = 0
    const midwayPaymentGroups =
      await this.paymentGroupsService.findAllMidWayAndNotNotified()
    for (const paymentGroup of midwayPaymentGroups) {
      try {
        await this.paymentGroupsService.sendReminderEmail(paymentGroup.id)
        this.logger.log(
          `Midway Reminder email sent for PaymentGroup ID: ${paymentGroup.id}`
        )
        successCount++
      } catch (error) {
        this.logger.error(
          `Error sending midway reminder email for PaymentGroup ID: ${paymentGroup.id}`,
          error.stack,
          {
            service: TasksService.name,
            function: this.reminderEmails.name,
            objectId: paymentGroup.id,
          }
        )
        errorCount++
      }
    }
    // Process J+3 Emails
    const threeDaysAfterStartPaymentGroups =
      await this.paymentGroupsService.findAllThreeDaysAfterStartAndNotNotified()
    for (const paymentGroup of threeDaysAfterStartPaymentGroups) {
      try {
        await this.paymentGroupsService.sendReminderEmail(
          paymentGroup.id,
          ReminderEmailSentStatus.DAY3_SENT
        )
        this.logger.log(
          `J+7 reminder email sent for PaymentGroup ID: ${paymentGroup.id}`
        )
        successCount++
      } catch (error) {
        this.logger.error(
          `Error sending J+7 reminder email for PaymentGroup ID: ${paymentGroup.id}`,
          error.stack,
          {
            service: TasksService.name,
            function: this.reminderEmails.name,
            objectId: paymentGroup.id,
          }
        )
        errorCount++
      }
    }

    // Process J-2 Emails
    const twoDaysBeforeEndPaymentGroups =
      await this.paymentGroupsService.findAllTwoDaysBeforeEndAndNotNotified()
    for (const paymentGroup of twoDaysBeforeEndPaymentGroups) {
      try {
        await this.paymentGroupsService.sendReminderEmail(
          paymentGroup.id,
          ReminderEmailSentStatus.DAY2_BEFORE_END_SENT
        )
        this.logger.log(
          `J-5 reminder email sent for PaymentGroup ID: ${paymentGroup.id}`
        )
        successCount++
      } catch (error) {
        this.logger.error(
          `Error sending J-5 reminder email for PaymentGroup ID: ${paymentGroup.id}`,
          error.stack,
          {
            service: TasksService.name,
            function: this.reminderEmails.name,
            objectId: paymentGroup.id,
          }
        )
        errorCount++
      }
    }
    this.logger.log(
      `Cron reminderEmails: task finished. ${successCount} reminder emails sent. ${errorCount} errors.`,
      {
        service: TasksService.name,
        function: this.reminderEmails.name,
        objectIds: [
          ...twoDaysBeforeEndPaymentGroups,
          ...threeDaysAfterStartPaymentGroups,
          ...midwayPaymentGroups,
        ].map((paymentGroup) => paymentGroup.id),
      }
    )
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'sendCashback',
  })
  async sendCashback() {
    this.logger.log('Cron sendCashback: task starting...', {
      service: TasksService.name,
      function: this.sendCashback.name,
    })
    const paymentGroups =
      await this.paymentGroupsService.findAllStatusOpenAndExpired()
    let count = 0
    for (const paymentGroup of paymentGroups) {
      try {
        await this.paymentGroupsService.enqueueCashbacks(paymentGroup.id)
        this.logger.log(`Payment Group ${paymentGroup.id} sent to queue.`, {
          service: TasksService.name,
          function: this.sendCashback.name,
          object: paymentGroup.id,
        })
        count += 1
      } catch (error) {
        this.logger.error(
          'Error during enqueuing of payment group',
          error.stack,
          {
            service: TasksService.name,
            function: this.sendCashback.name,
            object: paymentGroup.id,
          }
        )
      }
    }
    this.logger.log(
      `Cron sendCashback: task finished. ${count} Payment Groups sent to queue.`,
      {
        service: TasksService.name,
        function: this.sendCashback.name,
        object: paymentGroups.map((paymentGroup) => paymentGroup.id),
      }
    )
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'sendBills',
  })
  async sendBills() {
    this.logger.log('Cron sendKohortReferralBills: task starting...', {
      service: TasksService.name,
      function: this.sendBills.name,
    })
    let count = 0
    const organizations = await this.organizationsService.findAll()
    for (const organization of organizations) {
      try {
        const bill =
          await this.billsService.sendKohortReferralBill(organization)
        if (bill) {
          this.logger.log(
            `Kohort Referral bill sent for Organization ID: ${organization.id}`,
            {
              service: TasksService.name,
              function: this.sendBills.name,
              objectId: bill.id,
            }
          )
          count += 1
        }
      } catch (error) {
        this.logger.error(
          `Error sending Kohort referral bill for Organization ID: ${organization.id}`,
          error.stack,
          {
            service: TasksService.name,
            function: this.sendBills.name,
            objectId: organization.id,
          }
        )
      }
    }

    this.logger.log(
      `Cron sendKohortReferralBills: task finished. ${count} bills sent.`,
      {
        service: TasksService.name,
        function: this.sendBills.name,
      }
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleAmbassadorOrdersCashback() {
    this.logger.log(
      'Running scheduled task for sending cashback emails to orders linked to an ambassador from 30 days ago'
    )
    try {
      // Fetch orders from exactly 30 days ago
      const orders = await this.ordersService.findWithAmbassador30DaysAgo()

      for (const order of orders) {
        // Hardcoded cashback percentage for now
        await this.ordersService.sendCashbackReadyEmail(
          order.id,
          DiscountType.PERCENTAGE,
          20
        )
      }
    } catch (error) {
      this.logger.error(
        `Failed to process orders: ${error.message}`,
        error.stack,
        {
          service: TasksService.name,
          function: this.handleAmbassadorOrdersCashback.name,
        }
      )
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleAmbassadorPaymentsCashback() {
    this.logger.log(
      'Running scheduled task for sending cashback emails to payments linked to an ambassador from 30 days ago'
    )
    try {
      // Fetch payments from exactly 30 days ago
      const paymentIntents =
        await this.paymentIntentsService.findWithAmbassador30DaysAgo()

      for (const payment of paymentIntents) {
        // Hardcoded cashback percentage for now
        await this.paymentIntentsService.deprecatedSendCashbackReadyEmail(
          payment.id,
          DiscountType.PERCENTAGE,
          20
        )
      }
    } catch (error) {
      this.logger.error(
        `Failed to process payments: ${error.message}`,
        error.stack,
        {
          service: TasksService.name,
          function: this.handleAmbassadorPaymentsCashback.name,
        }
      )
    }
  }
}
