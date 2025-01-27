import { ApiPropertyOptional } from '@nestjs/swagger'
import { DiscountType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

import {
  MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP,
  MAXIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES,
  MINIMUM_PARTICIPANTS_PER_PAYMENT_GROUP,
  MINIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES,
  MINIMUM_PURCHASE_VALUE,
} from '../../common/constants/payment-group.constants'
import { CreateDiscountLevelDto } from './create-discount-level.dto'

export class UpdatePaymentGroupSettingsDto {
  @ApiPropertyOptional({
    description: 'The type of discount.',
    enum: DiscountType,
    example: 'PERCENTAGE',
  })
  @IsOptional()
  @IsString()
  @IsEnum(DiscountType)
  discountType?: DiscountType

  @ApiPropertyOptional({
    description: 'An array of discount levels.',
    type: [CreateDiscountLevelDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CreateDiscountLevelDto)
  discountLevels?: CreateDiscountLevelDto[]

  @ApiPropertyOptional({
    description: 'Maximum number of participants.',
    minimum: MINIMUM_PARTICIPANTS_PER_PAYMENT_GROUP,
    maximum: MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP,
    example: 10,
  })
  @IsOptional()
  @Min(MINIMUM_PARTICIPANTS_PER_PAYMENT_GROUP)
  @Max(MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP)
  @Type(() => Number)
  maxParticipants?: number

  @ApiPropertyOptional({
    description: 'Duration in minutes.',
    minimum: MINIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES,
    maximum: MAXIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES,
    example: 60,
  })
  @IsOptional()
  @Min(MINIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES)
  @Max(MAXIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES)
  @Type(() => Number)
  minutesDuration?: number

  @ApiPropertyOptional({
    description: 'Minimum purchase value.',
    minimum: MINIMUM_PURCHASE_VALUE,
    example: 100,
  })
  @IsOptional()
  @Min(MINIMUM_PURCHASE_VALUE)
  @Type(() => Number)
  minPurchaseValue?: number

  @ApiPropertyOptional({
    description: 'Whether or not the whatsapp communication is enabled.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  whatsappCommunication?: boolean
}
