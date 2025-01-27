import { ApiProperty } from '@nestjs/swagger'
import { Locale } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export class CustomerDto {
  @ApiProperty({
    description: 'The id of the customer.',
    example: 'cus_1234567890',
    type: String,
  })
  @IsString()
  id: string

  @ApiProperty({
    description: 'The primary email address of the customer.',
    example: 'customer@example.com',
    type: String,
    format: 'email',
    uniqueItems: true,
  })
  @IsString()
  emailAddress: string

  @ApiProperty({
    description: 'The first name of the customer.',
    example: 'John',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiProperty({
    description: 'The last name of the customer.',
    example: 'Doe',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiProperty({
    description: 'The phone number of the customer.',
    example: '+1 555 555 5555',
    nullable: true,
    type: String,
    format: 'phone',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiProperty({
    description: 'Wether the customer is in live mode or test mode.',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  livemode: boolean

  @IsEnum(Locale)
  locale: Locale

  @ApiProperty({
    description: 'Wether the customer is blocked or not.',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isBlocked: boolean

  @ApiProperty({
    description: 'The id of the organization.',
    example: 'org_1234567890',
    type: String,
  })
  @IsString()
  organizationId: string

  @IsOptional()
  @IsString()
  clientReferenceId?: string

  @ApiProperty({
    description: 'Additional metadata for the customer.',
    example: { my_system_id: '1JYLo8KerLxWZaQtys6ZQ1xS' },
    type: Object,
    nullable: true,
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date

  @ApiProperty({
    description: 'The id of the user who created the customer.',
    nullable: true,
    example: 'usr_1234567890',
    type: String,
  })
  @IsString()
  createdBy: string

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date

  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  blockedAt?: Date

  @ApiProperty({
    description: 'The id of the user who blocked the customer.',
    nullable: true,
    example: 'usr_1234567890',
    type: String,
  })
  @IsOptional()
  @IsString()
  blockedBy?: string

  @ApiProperty({
    description: 'The id of the user who last updated the customer.',
    nullable: true,
    example: 'usr_1234567890',
    type: String,
  })
  @IsString()
  updatedBy: string

  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  deletedAt?: Date
}

export class PaginatedCustomersDto {
  @ApiProperty({ type: [CustomerDto] })
  data: CustomerDto[]

  @ApiProperty({ description: 'Total count of customers' })
  count: number
}
