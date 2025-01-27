import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Locale } from '@prisma/client'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

import { IsNonDisposableEmail } from '../../email/validators/is-non-diposable-email.decorator'

export class CreateCustomerDto {
  @ApiProperty({
    description: 'The primary email address of the customer.',
    example: 'user@example.com',
    type: String,
    format: 'email',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsNonDisposableEmail()
  emailAddress: string

  @ApiPropertyOptional({
    description: 'The first name of the customer.',
    example: 'John',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  firstName?: string | null

  @ApiPropertyOptional({
    description: 'The last name of the customer.',
    example: 'Doe',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  lastName?: string | null

  @ApiPropertyOptional({
    description:
      'The phone number of the customer. Must include the country code.',
    example: '+1 555 555 5555',
    nullable: true,
    type: String,
    format: 'phone',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string | null

  @ApiPropertyOptional({
    description: 'Additional metadata for the customer.',
    example: { order_id: 'ord_1JYLo8KerLxWZaQtys6ZQ1xS' },
    type: Object,
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>

  @ApiPropertyOptional({
    description: 'The locale preference of the customer.',
    enum: Locale,
    example: Locale.fr_FR,
  })
  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale

  @ApiPropertyOptional({
    description:
      'Unique string of your choice to reconcile with your internal system.',
    example: 'myclientid-1234',
    type: String,
  })
  @IsOptional()
  @IsString()
  clientReferenceId?: string
}
