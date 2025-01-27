import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Locale } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

import { IsNonDisposableEmail } from '../../email/validators/is-non-diposable-email.decorator'

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'The email of the customer.',
    example: 'customer@example.com',
    type: String,
    format: 'email',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNonDisposableEmail()
  customerEmail?: string

  @ApiPropertyOptional({
    description: 'The phone number of the customer.',
    type: String,
    example: '+1 555 555 5555',
  })
  @IsOptional()
  @IsString()
  customerPhoneNumber?: string | null

  @ApiPropertyOptional({
    description: 'The first name of the customer.',
    example: 'John',
    type: String,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  customerFirstName?: string

  @ApiPropertyOptional({
    description: 'The last name of the customer.',
    example: 'Doe',
    type: String,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  customerLastName?: string

  @ApiPropertyOptional({
    description: 'The ID of the customer.',
    example: 'cus_xxxxxxxxxxxxxxxx',
    type: String,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiPropertyOptional({
    description: 'Additional metadata for the order.',
    example: { basket_id: '1JYLo8KerLxWZaQtys6ZQ1xS' },
    type: Object,
    additionalProperties: {
      type: 'string',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>

  @ApiProperty({
    description: 'The total amount of the order in cents.',
    example: 35000,
    type: Number,
    minimum: 0,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number

  @ApiPropertyOptional({
    description: 'The locale of the order',
    example: 'en_US',
    enum: Locale,
    default: Locale.fr_FR,
  })
  @IsOptional()
  @IsString()
  @IsEnum(Locale)
  locale?: Locale

  @ApiPropertyOptional({
    description:
      'Unique string of your choice to reconcile with your internal system',
    example: 'myclientid-1234',
    type: String,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  clientReferenceId?: string

  @ApiPropertyOptional({
    description:
      'The shared identifier of the payment group. If null, it will create a group. If not null, it will join the group.',
    example: 'KHTPAY-XXXXXXXX',
    type: String,
    format: 'string',
    nullable: true,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  paymentGroupShareId?: string | null
}
