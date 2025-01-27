import { PartialType } from '@nestjs/mapped-types'
import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'
import { boolean } from 'joi'

import { CreateAddressDto } from '../../addresses/dto/create-address.dto'
import { CreateOrganizationDto } from './create-organization.dto'

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({
    description: 'The date the organization was deleted at.',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2023-10-10T10:10:10Z',
  })
  deletedAt?: Date | null

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description: 'The address of the organization.',
    type: CreateAddressDto,
    nullable: true,
  })
  address?: CreateAddressDto | null

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  websiteUrl?: string

  @ApiPropertyOptional({
    description: 'Name Sender',
    type: String,
    example: 'Martin Souriau',
  })
  @IsOptional()
  @IsString()
  fromEmailName?: string

  @IsOptional()
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  @ApiPropertyOptional({
    description: 'The email addresses to send billing notifications to.',
    type: 'array',
    items: {
      type: 'string',
    },
    nullable: true,
    example: [''],
  })
  billingEmails?: string[]

  @ApiPropertyOptional({
    description: 'Set true to activate ambassador mode.',
    type: boolean,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  ambassadorEnabled?: boolean
}
