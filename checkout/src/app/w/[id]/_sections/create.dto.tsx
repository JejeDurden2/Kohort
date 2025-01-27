import { IsIBAN, IsNotEmpty } from 'class-validator'

export default class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsIBAN()
  iban: string
}
