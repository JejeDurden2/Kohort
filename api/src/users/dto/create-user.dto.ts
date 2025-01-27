import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Locale } from '@prisma/client'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'The primary email address of the user.',
    example: 'user@example.com',
    type: String,
  })
  primaryEmailAddress: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The Clerk ID of the user.',
    example: 'clerk12345',
    type: String,
  })
  clerkId: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The first name of the user.',
    example: 'John',
    type: String,
    nullable: true,
  })
  firstName?: string | null

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The last name of the user.',
    example: 'Doe',
    type: String,
    nullable: true,
  })
  lastName?: string | null

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  @ApiPropertyOptional({
    description: "The URL of the user's image.",
    example: 'https://example.com/image.jpg',
    type: String,
  })
  imageUrl: string

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  @ApiPropertyOptional({
    description: 'The primary phone number of the user.',
    example: '+1234567890',
    type: String,
    nullable: true,
  })
  primaryPhoneNumber?: string | null

  @IsOptional()
  @IsString()
  @IsEnum(Locale)
  locale?: Locale
}
