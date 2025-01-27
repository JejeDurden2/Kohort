import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export class TestTransactionalEmailDto {
  @ApiProperty({
    description: 'The email address where the test email will be sent.',
    example: 'aymeric@kohort.eu',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'The subject of the test email.',
    example: 'Test email subject',
    type: String,
  })
  @IsOptional()
  @IsString()
  subject?: string

  @ApiProperty({
    description:
      'The preheader text of the email. If not provided, use the default from the database.',
    example: 'Welcome to our platform!',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  preheaderText?: string

  @ApiProperty({
    description: 'The body of the test email.',
    example: 'Test email body',
    type: String,
  })
  @IsOptional()
  @IsString()
  body?: string

  @ApiProperty({
    description:
      'The variables used to dynamically replace placeholders in the template.',
    example: { name: 'John Doe', address: { city: 'New York', state: 'NY' } },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, Record<string, unknown>>
}
