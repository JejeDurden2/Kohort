import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export class CreateBrandSettings {
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
  @IsOptional()
  @IsString({ each: true })
  postImageUrls?: string[] | null

  @ApiProperty({
    description: 'The live mode of the brand settings.',
    example: true,
    type: Boolean,
    nullable: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  livemode: boolean

  @IsOptional()
  @ApiPropertyOptional({ description: 'Tag IDs (maximum 5)' })
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed' })
  @IsString({ each: true })
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
