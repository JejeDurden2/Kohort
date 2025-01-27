import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { ApiKey, User } from '@prisma/client'

import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { BadRequestResponse } from '../common/dto/error.dto'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { UpdatePaymentGroupSettingsDto } from './dto/update-payment-group-setting.dto'
import { PaymentGroupSettingsService } from './payment-group-settings.service'

@ApiTags('PaymentGroupSettings')
@Controller('payment-group-settings')
export class PaymentGroupSettingsController {
  constructor(
    private readonly paymentGroupSettingsService: PaymentGroupSettingsService
  ) {}

  @Get(':id')
  @UseInterceptors(LivemodePresentInterceptor)
  @ApiOperation({
    summary: 'Retrieve payment group settings by ID.',
    operationId: 'findOneSettings',
  })
  @ApiQuery({
    required: false,
    type: QueryDto,
  })
  @ApiOkResponse({
    description: 'The payment group settings have been retrieved.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input.',
    type: BadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Payment group settings not found.',
    type: NotFoundException,
  })
  @ApiBearerAuth()
  async findOne(
    @Param('id') id: string,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.paymentGroupSettingsService.findOne(id, livemode, query)
  }

  @Patch(':id')
  @UseInterceptors(LivemodePresentInterceptor)
  @ApiOperation({
    summary: 'Update payment group settings by ID.',
    operationId: 'updateSettings',
  })
  @ApiOkResponse({
    description: 'The payment group settings have been updated.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input.',
    type: BadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Payment group settings not found.',
    type: Error,
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @CurrentLivemode() livemode: boolean,
    @Body() updatePaymentGroupSettingDto: UpdatePaymentGroupSettingsDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.paymentGroupSettingsService.update(
      id,
      livemode,
      updatePaymentGroupSettingDto,
      user?.id ?? apiKey?.id
    )
  }
}
