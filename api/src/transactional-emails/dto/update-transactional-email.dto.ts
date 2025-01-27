import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class UpdateTransactionalEmailDto {
  @ApiProperty({
    description: 'The subject of the email.',
    example: 'Hello, {{name}}!',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  subject: string

  @ApiProperty({
    description: 'The preheader text of the email.',
    example: 'Welcome to our platform!',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  preheaderText: string

  @ApiProperty({
    description: 'The body of the email.',
    example: '<h1>Hello, {{name}}!</h1><p>Welcome to our platform!</p>',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  body: string

  @ApiProperty({
    description: 'The variables of the email.',
    example: { name: 'John Doe' },
    type: Object,
  })
  @IsNotEmpty()
  @IsObject()
  variables: Record<string, string>
}
