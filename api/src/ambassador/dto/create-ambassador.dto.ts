import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator'

export class CreateAmbassadorDto {
  @ApiProperty()
  @IsPhoneNumber()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string
}
