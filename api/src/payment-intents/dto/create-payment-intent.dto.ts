import { PaymentIntentStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  amount: number

  @IsNotEmpty()
  @IsString()
  checkoutSessionId: string

  @IsOptional()
  @IsString()
  customerId?: string | null

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>

  @IsOptional()
  @IsString()
  @IsEnum(PaymentIntentStatus)
  status?: PaymentIntentStatus

  @IsOptional()
  @IsString()
  paymentGroupId?: string | null

  @IsOptional()
  @IsString()
  ambassadorId?: string | null

  @IsOptional()
  @IsString()
  clientReferenceId?: string
}
