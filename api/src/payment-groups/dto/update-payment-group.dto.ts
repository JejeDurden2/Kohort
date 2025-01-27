import { PickType } from '@nestjs/mapped-types'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

import { CreatePaymentGroupDto } from './create-payment-group.dto'

export class UpdatePaymentGroupDto extends PickType(CreatePaymentGroupDto, [
  'metadata',
] as const) {
  @ApiProperty({
    description:
      'Additional metadata for the payment group update. This can include any additional information needed to update the payment group.',
    example: { order_id: 'ord_1JYLo8KerLxWZaQtys6ZQ1xT' },
    type: Object,
    additionalProperties: { type: 'string' },
  })
  metadata?: Record<string, string>

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Email of the creator of the payment group. This field is optional and should be a valid email address.',
    example: 'email@example.com',
    type: String,
  })
  creatorEmail?: string
}
