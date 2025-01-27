import { ApiProperty } from '@nestjs/swagger'
import { IsIBAN, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateWithdrawalDto {
  @ApiProperty({
    description:
      'The IBAN of the customer to withdraw the available balance to.',
    example: 'FR1420041010050500013402606',
    type: String,
    format: 'iban',
  })
  @IsNotEmpty()
  @IsIBAN()
  iban: string

  @ApiProperty({
    description: 'The validation token associated to the payment.',
    example: '232c67d2c7b4c123238bab539d1f0c63f8184df5a5e8e2e126c4cb30f01d0d7d',
    type: String,
    maxLength: 64,
    minLength: 64,
  })
  @IsNotEmpty()
  @IsString()
  @Length(64, 64, { message: 'Token must be exactly 64 characters long' })
  token: string
}
