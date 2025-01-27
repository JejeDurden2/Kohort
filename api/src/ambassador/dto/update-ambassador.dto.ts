import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export class UpdateAmbassadorDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  organizationIds: string[]
}

export class UpdateAmbassadorPostImageDto {
  @ApiProperty()
  @IsString()
  organizationId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  postedImageUrl?: string
}
