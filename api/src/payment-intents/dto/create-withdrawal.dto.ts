import { IsIBAN, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsIBAN()
  iban: string

  @IsNotEmpty()
  @IsString()
  @Length(64, 64, { message: 'Token must be exactly 64 characters long' })
  token: string
}
