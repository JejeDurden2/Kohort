import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { EmailType, Locale } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator'

import { UpdateTransactionalEmailDto } from './update-transactional-email.dto'

export class GetTransactionalEmailDto extends PartialType(
  UpdateTransactionalEmailDto
) {
  @ApiProperty({
    description: 'The ID of the transactional email.',
    example: 'email_a61cffef34474c',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  id: string

  @ApiProperty({
    description: 'The type of the email.',
    enum: EmailType,
    example: EmailType.NEW_GROUP,
  })
  @IsNotEmpty()
  @IsEnum(EmailType)
  type: string

  @ApiProperty({
    description: 'The livemode of the transactional email.',
    example: true,
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  livemode: boolean

  @ApiProperty({
    description: 'The locale of the transactional email.',
    enum: Locale,
    example: Locale.fr_FR,
  })
  @IsNotEmpty()
  @IsEnum(Locale)
  locale: string

  @ApiProperty({
    description: 'The organization ID of the transactional email.',
    type: String,
  })
  @IsString()
  organizationId: string | null

  @ApiProperty({
    description: 'The created date of the transactional email.',
    example: '2021-09-15T00:00:00.000Z',
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  createdAt: Date

  @ApiProperty({
    description: 'The user who created the transactional email.',
    example: 'user_a61cffef34474c',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  createdBy: string

  @ApiProperty({
    description: 'The updated date of the transactional email.',
    example: '2021-09-15T00:00:00.000Z',
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date

  @ApiProperty({
    description: 'The user who updated the transactional email.',
    example: 'user_a61cffef34474c',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  updatedBy: string
}
