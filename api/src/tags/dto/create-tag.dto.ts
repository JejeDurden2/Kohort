import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTagDto {
  @ApiProperty({ example: 'Sports', description: 'The name of the tag' })
  @IsNotEmpty()
  @IsString()
  name: string
}
