import { Process, Processor } from '@nestjs/bull'
import { DiscountType } from '@prisma/client'
import { Job } from 'bull'

import { BankService } from '../bank/bank.service'
import { QueueName } from '../common/enums/queue-names.enum'
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto'
import { PaymentIntentsService } from './payment-intents.service'

type paymentIntentSendCashbackJobData = {
  paymentIntentIds: string[]
  discountValue: number
  discountType: DiscountType
}

type withdrawCashbackJobData = {
  id: string
  createWithdrawalDto: CreateWithdrawalDto
}

@Processor(QueueName.SEND_CASHBACK)
export class PaymentIntentSendCashbackConsumer {
  constructor(private readonly paymentIntentsService: PaymentIntentsService) {}

  @Process(QueueName.SEND_CASHBACK)
  async sendCashbackPaymentIntentGroup(
    paymentIntentSendCashbackJob: Job<paymentIntentSendCashbackJobData>
  ) {
    return await this.paymentIntentsService.sendCashbackGroup(
      paymentIntentSendCashbackJob.data.paymentIntentIds,
      paymentIntentSendCashbackJob.data.discountValue,
      paymentIntentSendCashbackJob.data.discountType
    )
  }
}

@Processor(QueueName.WITHDRAW_CASHBACK)
export class WithdrawCashbackConsumer {
  constructor(private readonly bankService: BankService) {}

  @Process(QueueName.WITHDRAW_CASHBACK)
  async withdrawCashback(
    withdrawCashbackJobData: Job<withdrawCashbackJobData>
  ) {
    return await this.bankService.sendCashback(
      withdrawCashbackJobData.data.id,
      withdrawCashbackJobData.data.createWithdrawalDto
    )
  }
}
