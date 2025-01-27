import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class HelpPaymentGroupDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The message to be sent to the support team',
    example: 'I need help with my kohort',
  })
  message?: string
}
