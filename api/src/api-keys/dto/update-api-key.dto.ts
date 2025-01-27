import { PartialType, PickType } from '@nestjs/mapped-types'
import { IsDate, IsOptional } from 'class-validator'

import { CreateApiKeyDto } from './create-api-key.dto'

export class UpdateApiKeyDto extends PartialType(
  PickType(CreateApiKeyDto, ['name', 'note'])
) {
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date
}
