import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

import { KohortPayEvent } from '../../common/enums/kohortpay-events.enum'

export class CreateWebhookDto {
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  url: string

  @IsString()
  @IsOptional()
  description?: string

  @ArrayNotEmpty()
  @IsString({ each: true })
  events: KohortPayEvent[]

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>
}
