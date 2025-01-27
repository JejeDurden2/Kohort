import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNumber, IsOptional } from 'class-validator'

export class ValidatePaymentGroupDto {
  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    description:
      'The email address of the customer to be validated. This field is optional and must be a valid email format.',
    example: 'customer@gmail.com',
    type: String,
  })
  customerEmail?: string

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description:
      'The amount to be validated. This field is optional and must be a positive number.',
    example: 1000,
    type: Number,
  })
  amount?: number
}
