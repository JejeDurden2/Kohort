import { Locale } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxDate,
  MinDate,
} from 'class-validator'

import { IsNonDisposableEmail } from '../../email/validators/is-non-diposable-email.decorator'
import { CreateLineItemDto } from './create-line-item.dto'

export class CreateCheckoutSessionDto {
  @IsOptional()
  @IsString()
  successUrl?: string

  @IsOptional()
  @IsString()
  cancelUrl?: string

  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNonDisposableEmail()
  customerEmail?: string

  @IsOptional()
  @IsString()
  customerPhoneNumber?: string | null

  @IsOptional()
  @IsString()
  customerFirstName?: string

  @IsOptional()
  @IsString()
  customerLastName?: string

  @IsOptional()
  @IsString()
  customerId?: string

  @IsOptional()
  @IsDate()
  @MinDate(new Date(Date.now() + 30 * 60 * 1000)) // 30min
  @MaxDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24hrs
  @Type(() => Date)
  expiresAt?: Date

  @IsOptional()
  @IsArray()
  @Type(() => CreateLineItemDto)
  lineItems?: CreateLineItemDto[]

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amountTotal: number

  @IsOptional()
  @IsString()
  @IsEnum(Locale)
  locale?: Locale

  @IsOptional()
  @IsString()
  clientReferenceId?: string

  @IsOptional()
  @IsString()
  paymentClientReferenceId?: string

  @IsOptional()
  @IsString()
  paymentGroupShareId?: string | null
}
