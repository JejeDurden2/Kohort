import { ApiKeyType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateApiKeyDto {
  @IsOptional()
  @IsString()
  @IsEnum(ApiKeyType)
  type?: ApiKeyType

  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  note?: string | null
}
