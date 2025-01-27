import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator'

export class BrandSettingsDto {
  @IsString()
  id: string

  @IsString()
  organizationId: string

  @IsBoolean()
  livemode: boolean

  @IsOptional()
  @IsString()
  logoUrl?: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsString()
  backgroundUrl?: string

  @IsOptional()
  @IsString()
  modalImageUrl?: string

  @IsOptional()
  @IsString()
  aiPromptShareMessage?: string

  @IsOptional()
  @IsString({ each: true })
  postImageUrls?: string[]

  @IsOptional()
  @IsString()
  instagramPageUrl?: string

  @IsDate()
  createdAt: Date

  @IsString()
  createdBy: string

  @IsDate()
  updatedAt: Date

  @IsString()
  updatedBy: string
}
