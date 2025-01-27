import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'

export class DiscountLevelDto {
  @IsString()
  id: string

  @IsOptional()
  @IsString()
  paymentGroupSettingsId?: string

  @IsInt()
  level: number

  @IsInt()
  value: number

  @IsInt()
  participantsToUnlock: number

  @IsDate()
  createdAt: Date
}
