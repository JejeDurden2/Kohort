import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Organization } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

export class AmbassadorDto {
  @ApiProperty({ description: 'Unique identifier' })
  @IsString()
  id: string

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string | null

  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber()
  phoneNumber: string

  @ApiPropertyOptional({ description: 'Referral code' })
  @IsOptional()
  @IsString()
  referralCode?: string | null

  @ApiPropertyOptional({ description: 'Additional metadata', type: 'object' })
  @IsOptional()
  metadata?: Record<string, string | number | boolean | null> | null

  @ApiProperty({ description: 'Creation date' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @ApiProperty({ description: 'Created by' })
  @IsString()
  createdBy: string

  @ApiProperty({ description: 'Last update date' })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date

  @ApiProperty({ description: 'Updated by' })
  @IsString()
  updatedBy: string

  @ApiPropertyOptional({
    description: 'Associated organizations',
    isArray: true,
  })
  @IsOptional()
  organizations?: Organization[]
}

export class PaginatedAmbassadorDto {
  @ApiProperty({ type: [AmbassadorDto] })
  data: AmbassadorDto[]

  @ApiProperty({ description: 'Total count of ambassadors' })
  count: number
}
