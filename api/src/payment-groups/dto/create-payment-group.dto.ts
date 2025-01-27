import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxDate,
  MinDate,
  ValidateIf,
} from 'class-validator'

import {
  MAXIMUM_PAYMENT_GROUP_DURATION_IN_MS,
  MINIMUM_PAYMENT_GROUP_DURATION_IN_MS,
} from '../../common/constants/payment-group.constants'

export class CreatePaymentGroupDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description:
      'The ID of the customer. This field is required and must be a valid customer ID.',
    example: 'cus_IzkjlvAhdjzjht3',
    type: String,
  })
  customerId: string

  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'The ID of the payment intent associated with this payment group. This field is required and must be a valid payment intent ID.',
    example: 'pi_1JYLo8KerLxWZaQtys6ZQ1xR',
    type: String,
  })
  paymentIntentId?: string

  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'The ID of the payment intent associated with this payment group. This field is required and must be a valid payment intent ID.',
    example: 'pi_1JYLo8KerLxWZaQtys6ZQ1xR',
    type: String,
  })
  orderId?: string

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description:
      'Additional metadata for the payment group. This can include any additional information needed to process the payment group.',
    example: { order_id: 'ord_1JYLo8KerLxWZaQtys6ZQ1xS' },
    type: Object,
    additionalProperties: { type: 'string' },
  })
  metadata?: Record<string, string>

  @IsOptional()
  @IsDate()
  @MinDate(new Date(Date.now() + MINIMUM_PAYMENT_GROUP_DURATION_IN_MS))
  @MaxDate(new Date(Date.now() + MAXIMUM_PAYMENT_GROUP_DURATION_IN_MS))
  @Type(() => Date)
  @ApiPropertyOptional({
    description:
      'The expiration date and time of the payment group. Must be between the minimum and maximum payment group duration.',
    example: new Date(Date.now() + 5000).toISOString(),
    type: Date,
  })
  expiresAt?: Date

  @IsOptional()
  @ValidateIf((o) => o.expiresAt != null)
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional({
    description:
      'The midpoint date and time of the payment group for reminder purposes. Must be before the expiration date.',
    example: new Date(Date.now() + 2500).toISOString(),
    type: 'string',
  })
  midExpireAt?: Date
}
