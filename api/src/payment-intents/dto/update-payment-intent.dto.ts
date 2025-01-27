import { IsOptional, IsString } from 'class-validator'

export class UpdatePaymentIntentDto {
  @IsOptional()
  @IsString()
  paymentGroupId?: string | null

  @IsOptional()
  @IsString()
  customerEmail?: string

  @IsOptional()
  @IsString()
  clientReferenceId?: string
}
