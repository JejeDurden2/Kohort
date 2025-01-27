import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  clerkId: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  @ApiPropertyOptional({ nullable: true })
  imageUrl?: string | null

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  slug?: string | null

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  createdBy: string
}
