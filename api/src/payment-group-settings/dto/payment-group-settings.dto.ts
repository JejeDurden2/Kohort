import { DiscountType } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator'

export class PaymentGroupSettingsDto {
  @IsString()
  id: string

  @IsOptional()
  @IsString()
  organizationId?: string

  @IsOptional()
  @IsString()
  paymentGroupId?: string

  @IsBoolean()
  livemode: boolean

  @IsBoolean()
  whatsappCommunication: boolean

  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsInt()
  maxParticipants: number

  @IsInt()
  minutesDuration: number

  @IsInt()
  minPurchaseValue: number

  @IsDate()
  createdAt: Date

  @IsString()
  createdBy: string

  @IsDate()
  updatedAt: Date

  @IsString()
  updatedBy: string
}
