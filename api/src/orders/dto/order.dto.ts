import { ApiProperty } from '@nestjs/swagger'
import { Currency, Locale, OrderStatus, RiskLevel } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class OrderDto {
  @ApiProperty({
    description: 'The id of the order.',
    example: 'ord_1234567890',
    type: String,
  })
  @IsString()
  id: string

  @ApiProperty({
    description: 'Wether the order is in live mode or test mode.',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  livemode: boolean

  @ApiProperty({
    description: 'The id of the organization.',
    example: 'org_1234567890',
    type: String,
  })
  @IsString()
  organizationId: string

  @ApiProperty({
    description: 'The total amount of the order in cents.',
    example: 35000,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  amount: number

  @ApiProperty({
    description: 'The cashback amount of the order in cents.',
    example: 5000,
    type: Number,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  amountCashback?: number

  @ApiProperty({
    description: 'The fees due to Kohort for this order in cents.',
    example: 1000,
    type: Number,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  applicationFeeAmount?: number

  @ApiProperty({
    description: 'The email of the customer.',
    example: 'customer@example.com',
    type: String,
    format: 'email',
  })
  @IsOptional()
  @IsString()
  customerEmail?: string

  @ApiProperty({
    description: 'The first name of the customer.',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @IsString()
  customerFirstName?: string

  @ApiProperty({
    description: 'The last name of the customer.',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  customerLastName?: string

  @ApiProperty({
    description: 'The phone number of the customer.',
    type: String,
    example: '+1 555 555 5555',
  })
  @IsOptional()
  @IsString()
  customerPhoneNumber?: string

  @ApiProperty({
    description:
      'The shared identifier of the group. If null, it will create a group. If not null, it will join the group.',
    example: 'KHT-XXXXXXXX',
    type: String,
    format: 'string',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  paymentGroupShareId?: string

  @ApiProperty({
    description: 'The ID of the customer.',
    example: 'cus_xxxxxxxxxxxxxxxx',
    type: String,
  })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiProperty({
    description: 'The currency of the order.',
    example: Currency.EUR,
    enum: Currency,
    default: Currency.EUR,
  })
  @IsEnum(Currency)
  currency: Currency

  @ApiProperty({
    description: 'The locale of the order.',
    example: 'en_US',
    enum: Locale,
    default: Locale.fr_FR,
  })
  @IsEnum(Locale)
  locale: Locale

  @ApiProperty({
    description: 'The current status of the order.',
    example: OrderStatus.CASHBACK_SENT,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus

  @ApiProperty({
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
    description: 'The id of the associated group.',
    example: 'pg_1234567890',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  paymentGroupId?: string

  @ApiProperty({
    description: 'The id of the associated ambassador.',
    example: 'amb_1234567890',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  ambassadorId?: string

  @ApiProperty({
    description:
      'The reference id of the client. Use this field to renconcile with your system.',
    example: '1234567890',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  clientReferenceId?: string

  @IsOptional()
  @IsString()
  token?: string

  @ApiProperty({
    description: 'The risk level of the order.',
    example: RiskLevel.LOW,
    enum: RiskLevel,
  })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel

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
    description: 'The id of the user who last updated the customer.',
    nullable: true,
    example: 'usr_1234567890',
    type: String,
  })
  @IsString()
  updatedBy: string
}

export class PaginatedOrdersDto {
  @ApiProperty({ type: [OrderDto] })
  data: OrderDto[]

  @ApiProperty({ description: 'Total count of orders' })
  count: number
}
