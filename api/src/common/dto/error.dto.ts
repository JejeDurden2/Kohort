import { ApiProperty } from '@nestjs/swagger'

class ErrorDetail {
  @ApiProperty({
    description: 'Type of the error.',
    example: 'invalid_request_error',
  })
  type: string

  @ApiProperty({
    description: 'Detailed error message.',
    example: 'Invalid input value.',
  })
  message: string

  @ApiProperty({ description: 'Specific error code.', example: 'Unauthorized' })
  code: string
}

export class BadRequestResponse {
  @ApiProperty({ description: 'Details of the error.', type: ErrorDetail })
  error: ErrorDetail
}
