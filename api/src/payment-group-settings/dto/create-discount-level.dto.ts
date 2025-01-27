import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsPositive, Max } from 'class-validator'

import {
  MAXIMUM_NUMBER_OF_DISCOUNT_LEVELS,
  MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP,
} from '../../common/constants/payment-group.constants'

export class CreateDiscountLevelDto {
  @ApiProperty({ description: 'The level of discount.', example: 1 })
  @IsPositive()
  @Max(MAXIMUM_NUMBER_OF_DISCOUNT_LEVELS)
  level: number

  @ApiProperty({ description: 'The value of discount.', example: 10.5 })
  @IsPositive()
  @Type(() => Number)
  value: number

  @ApiProperty({
    description:
      'The number of participants required to unlock this discount level.',
    example: 3,
  })
  @IsPositive()
  @Max(MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP)
  @Type(() => Number)
  participantsToUnlock: number
}
