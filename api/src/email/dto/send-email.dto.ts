import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export interface AttachmentData {
  filename: string
  content: string
  content_type?: string
  path?: string
}

export class SendEmailDto {
  @ApiProperty({
    isArray: true,
    type: String,
    description: 'The email addresses to send the email to',
    example: 'customer123@orga.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  to: string | string[]

  @ApiProperty({
    type: String,
    description: 'The email addresses to send the email from',
    example: 'RESEND_FROM_EMAIL_CASHBACK',
  })
  @IsOptional()
  @IsEmail()
  fromEmail?: string

  @ApiPropertyOptional({
    type: String,
    description: 'The name that appear to the receipent',
    example: 'MARTIN',
  })
  @IsOptional()
  @IsString()
  fromName?: string

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    description:
      'Bcc recipient email address. For multiple addresses, send as an array of strings.',
    example: 'customer123@orga.com',
  })
  @IsOptional()
  @IsEmail({}, { each: true })
  bcc?: string | string[]

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    description:
      'Cc recipient email address. For multiple addresses, send as an array of strings.',
    example: 'customer123@orga.com',
  })
  @IsOptional()
  @IsEmail({}, { each: true })
  cc?: string | string[]

  @ApiProperty({
    type: String,
    description: 'The subject of the email',
    example: 'Email subject',
  })
  @IsNotEmpty()
  @IsString()
  subject: string

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    description:
      'Reply-to recipient email address. For multiple addresses, send as an array of strings.',
    example: 'customer123@orga.com',
  })
  @IsOptional()
  @IsEmail({}, { each: true })
  reply_to?: string | string[]

  @ApiProperty({
    type: String,
    description: 'The HTML template containing placeholders like {{name}}',
    example: '<h1>Hello {{name}}</h1>',
  })
  @IsNotEmpty()
  @IsString()
  html: string // The HTML template containing placeholders like {{name}}

  @ApiPropertyOptional({
    description: 'Additional data to pass to the dynamic template',
    example: { name: 'John Doe' },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  dynamicTemplateData?: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Attachments to be sent with the email',
    example: [
      {
        filename: 'image.png',
        content: 'image/png;base64,encodedImage',
        content_type: 'image/png',
        path: 'path/to/image.png',
      },
    ],
    isArray: true,
    type: Object,
  })
  @IsOptional()
  @IsArray()
  attachments?: AttachmentData[]

  @ApiPropertyOptional({
    type: String,
    description:
      'The date and time when the email should be sent. Must be in ISO 8601 format.',
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  scheduled_at?: string // Optional: schedule email to be sent later
}
