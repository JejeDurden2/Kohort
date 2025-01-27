// /!\ Do not modify this file unless you know what you are doing /!\
// /!\ Also update the values in schema.prisma if you make any change here /!\
import { Prisma } from '@prisma/client'

export const DEFAULT_KOHORT_FIXED_PAYMENT_FEES = 25 // 0.25€ per transaction
export const DEFAULT_KOHORT_ACQUISITION_FEES = new Prisma.Decimal(10) // 10% of the transaction
export const DEFAULT_KOHORT_PAYMENT_FEES = new Prisma.Decimal(1.9) // 1.9% of the transaction
export const DEFAULT_KOHORT_PAYOUT_FEES = new Prisma.Decimal(0.25) // 0.25% per payout
