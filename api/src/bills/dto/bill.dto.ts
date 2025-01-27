import { BillStatus, Currency } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator'

export class BillDto {
  @IsString()
  id: string

  @IsString()
  billId: string

  @IsOptional()
  @IsString()
  stripeId?: string

  @IsBoolean()
  livemode: boolean

  @IsInt()
  amount: number

  @IsInt()
  amountPayout: number

  @IsEnum(Currency)
  currency: Currency

  @IsString()
  organizationId: string

  @IsEnum(BillStatus)
  status: BillStatus

  @IsDate()
  createdAt: Date

  @IsDate()
  dueDate: Date

  @IsString()
  createdBy: string

  @IsDate()
  updatedAt: Date

  @IsString()
  updatedBy: string
}
