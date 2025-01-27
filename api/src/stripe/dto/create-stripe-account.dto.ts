import { IsNotEmpty, IsString } from 'class-validator'

export class CreateStripeAccountDto {
  @IsNotEmpty()
  @IsString()
  organizationId: string

  @IsNotEmpty()
  @IsString()
  userId: string
}
