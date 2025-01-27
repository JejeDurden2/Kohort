import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  IsArray,
  IsHexColor,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export class UpdateBrandSettingsDto {
  @ApiPropertyOptional({
    description: 'The URL of the brand logo.',
    example: 'https://example.com/logo.png',
    type: String,
    format: 'uri',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  logoUrl?: string | null

  @ApiPropertyOptional({
    description: 'The Color of the brand image.',
    example: '#FAFAFA',
    type: String,
    format: 'uri',
    nullable: true,
  })
  @IsOptional()
  @IsHexColor()
  color?: string | null

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  backgroundUrl?: string | null

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  modalImageUrl?: string | null

  @IsOptional()
  @IsString()
  aiPromptShareMessage?: string | null

  @ApiPropertyOptional({
    description: 'The Instagram page URL of the brand.',
    example: 'https://www.instagram.com/brandname',
    type: String,
    format: 'uri',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  instagramPageUrl?: string | null

  @ApiPropertyOptional({
    description: 'Array of image URLs for posts',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: 'array',
    items: {
      type: 'string',
      format: 'uri',
      nullable: true,
    },
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  postImageUrls?: string[] | null

  @ApiPropertyOptional({ description: 'Tag IDs (maximum 5)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed' })
  tagIds?: string[]

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  websiteUrl?: string | null
}
