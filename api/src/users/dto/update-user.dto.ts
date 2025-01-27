import { PartialType } from '@nestjs/mapped-types'
import { IsDate, IsOptional } from 'class-validator'

import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsDate()
  lastSignInAt?: Date | null

  @IsOptional()
  @IsDate()
  deletedAt?: Date | null
}
