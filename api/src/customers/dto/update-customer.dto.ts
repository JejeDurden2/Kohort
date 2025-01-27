import { PartialType } from '@nestjs/mapped-types'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDate, IsOptional } from 'class-validator'

import { CreateCustomerDto } from './create-customer.dto'

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({
    nullable: true,
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  deletedAt?: Date | null
}
