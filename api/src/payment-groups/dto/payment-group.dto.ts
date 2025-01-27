import { ApiProperty } from '@nestjs/swagger'
import { PaymentGroupStatus, ReminderEmailSentStatus } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export class PaymentGroupDto {
  @ApiProperty({
    description: 'The id of the group.',
    example: 'ord_1234567890',
    type: String,
  })
  @IsString()
  id: string

  @ApiProperty({
    description:
      'The shared identifier of the group. If null, it will create a group. If not null, it will join the group.',
    example: 'KHT-XXXXXXXX',
    type: String,
    format: 'string',
    nullable: true,
  })
  @IsString()
  shareId: string

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
    description: 'The id of the customer.',
    example: 'cus_1234567890',
    type: String,
  })
  @IsString()
  customerId: string

  @ApiProperty({
    description: 'The email of the creator of the group.',
    example: 'customer@example.com',
    type: String,
    format: 'email',
  })
  @IsOptional()
  @IsString()
  creatorEmail?: string

  @ApiProperty({
    description: 'The status of the group.',
    example: PaymentGroupStatus.COMPLETED,
    enum: PaymentGroupStatus,
  })
  @IsEnum(PaymentGroupStatus)
  status: PaymentGroupStatus

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
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsDate()
  expiresAt: Date

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  midExpireAt?: Date

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  jMinus2ExpireAt?: Date

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  jPlus3StartAt?: Date

  @ApiProperty({
    description: 'The reminder email sent status of the group.',
    example: ReminderEmailSentStatus.NOT_SENT,
    enum: ReminderEmailSentStatus,
  })
  @IsEnum(ReminderEmailSentStatus)
  reminderEmailSent: ReminderEmailSentStatus

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

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  canceledAt?: Date

  @ApiProperty({
    type: Date,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  completedAt?: Date
}

export class PaginatedPaymentGroupDto {
  data: PaymentGroupDto[]
  count: number
}
