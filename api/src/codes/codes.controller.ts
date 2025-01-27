import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import {
  AMBASSADOR_CODE_PREFIX,
  KOHORT_CODE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { AllowPublicKey } from '../common/decorators/allow-public-key.decorator'
import { PaymentGroupValidationErrors } from '../common/enums/errors'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { CreatePaymentGroupDto } from '../payment-groups/dto/create-payment-group.dto'
import { PaymentGroupDto } from '../payment-groups/dto/payment-group.dto'
import { ValidatePaymentGroupDto } from '../payment-groups/dto/validate-payment-group.dto'
import { PaymentGroupsService } from '../payment-groups/payment-groups.service'
import { CodesService } from './codes.service'

@AllowPublicKey()
@ApiTags('Payment Groups')
@ApiBearerAuth()
@Controller('codes')
export class CodesController {
  constructor(
    private readonly codesService: CodesService,
    private readonly paymentGroupsService: PaymentGroupsService
  ) {}

  @Post(':code/validate')
  @ApiOperation({ summary: 'Validate a group' })
  @ApiBody({ type: CreatePaymentGroupDto })
  @ApiResponse({
    status: 200,
    description: 'Group is valid.',
    type: PaymentGroupDto,
  })
  @ApiNotFoundResponse({
    description: 'Group not found.',
    type: PaymentGroupValidationErrors.NOT_FOUND,
    example: {
      error: {
        type: 'not_found_error',
        message: 'Group KHT-12345 not found.',
        code: 'NOT_FOUND',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Group status is not valid.',
    type: PaymentGroupValidationErrors.COMPLETED_EXPIRED_CANCELED,
    example: {
      error: {
        type: 'invalid_request_error',
        message: 'Group KHT-12345 is already canceled, expired or completed.',
        code: 'COMPLETED_EXPIRED_CANCELED',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Email is already used in this group.',
    type: PaymentGroupValidationErrors.EMAIL_ALREADY_USED,
    example: {
      error: {
        type: 'invalid_request_error',
        message: 'Customer customer@example.com is already in group KHT-12345.',
        code: 'EMAIL_ALREADY_USED',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Maximum number of participants reached.',
    type: PaymentGroupValidationErrors.MAX_PARTICIPANTS_REACHED,
    example: {
      error: {
        type: 'invalid_request_error',
        message: 'Maximum number of participants reached.',
        code: 'MAX_PARTICIPANTS_REACHED',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Amount is less than the minimum amount.',
    type: PaymentGroupValidationErrors.AMOUNT_TOO_LOW,
    example: {
      error: {
        type: 'invalid_request_error',
        message: 'Amount 1500 is below the minimum purchase value of 3000.',
        code: 'AMOUNT_TOO_LOW',
      },
    },
  })
  @ApiParam({
    name: 'code',
    required: true,
    description: 'Code Kohort starting with KHT',
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async validate(
    @Param('code') id: string,
    @Body() validatePaymentGroupDto: ValidatePaymentGroupDto
  ) {
    if (id.startsWith(AMBASSADOR_CODE_PREFIX)) {
      return await this.codesService.validate(id)
    } else if (id.startsWith(KOHORT_CODE_PREFIX)) {
      return await this.paymentGroupsService.validate(
        id,
        validatePaymentGroupDto
      )
    } else {
      throw new NotFoundException('Code not found.')
    }
  }
}
