import { ApiProperty } from '@nestjs/swagger'

// Base error structure for all validation errors
export class ValidationErrorDto {
  @ApiProperty({ example: 'invalid_request_error' })
  type: string

  @ApiProperty({ example: 'Description of the specific error message.' })
  message: string

  @ApiProperty({ example: 'ERROR_CODE' })
  code: string
}

// DTO for Not Found Error
export class NotFoundErrorDto {
  @ApiProperty({ example: 'not_found_error' })
  type: string

  @ApiProperty({ example: 'Group KHT-12345 not found.' })
  message: string

  @ApiProperty({ example: 'NOT_FOUND' })
  code: string
}

// DTO for "Group status is not valid" error
export class InvalidStatusErrorDto extends ValidationErrorDto {
  @ApiProperty({
    example: 'Group KHT-12345 is already canceled, expired or completed.',
  })
  message: string

  @ApiProperty({ example: 'COMPLETED_EXPIRED_CANCELED' })
  code: string
}

// DTO for "Email is already used" error
export class EmailAlreadyUsedErrorDto extends ValidationErrorDto {
  @ApiProperty({
    example: 'Customer customer@example.com is already in group KHT-12345.',
  })
  message: string

  @ApiProperty({ example: 'EMAIL_ALREADY_USED' })
  code: string
}

// DTO for "Maximum number of participants reached" error
export class MaxParticipantsErrorDto extends ValidationErrorDto {
  @ApiProperty({
    example: 'Maximum number of participants reached.',
  })
  message: string

  @ApiProperty({ example: 'MAX_PARTICIPANTS_REACHED' })
  code: string
}

// DTO for "Amount too low" error
export class AmountTooLowErrorDto extends ValidationErrorDto {
  @ApiProperty({
    example: 'Amount 1500 is below the minimum purchase value of 3000.',
  })
  message: string

  @ApiProperty({ example: 'AMOUNT_TOO_LOW' })
  code: string
}
