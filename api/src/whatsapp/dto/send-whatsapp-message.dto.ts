import { Locale } from '@prisma/client'
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator'

export interface AttachmentData {
  filename: string
  content: string
  type: string
  disposition: string
}

export class SendWhatsappMessageDto {
  @IsNotEmpty()
  @IsString()
  recipientPhoneNumber: string

  @IsNotEmpty()
  @IsString()
  templateName: string

  @IsNotEmpty()
  @IsEnum(Locale)
  locale: Locale = Locale.fr_FR

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  variables: string[]
}
