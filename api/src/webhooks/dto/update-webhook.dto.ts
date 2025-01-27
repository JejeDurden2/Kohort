import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsOptional } from 'class-validator'

import { ToBoolean } from '../../common/utils/to-boolean-validator'
import { CreateWebhookDto } from './create-webhook.dto'

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean
}
