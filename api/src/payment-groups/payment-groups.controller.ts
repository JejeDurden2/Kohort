import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApiKey, Organization, User } from '@prisma/client'

import { CodesService } from '../codes/codes.service'
import {
  AMBASSADOR_CODE_PREFIX,
  KOHORT_CODE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { AllowPublicKey } from '../common/decorators/allow-public-key.decorator'
import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { PaginatedOrdersDto } from '../orders/dto/order.dto'
import { OrdersService } from '../orders/orders.service'
import { CreatePaymentGroupDto } from './dto/create-payment-group.dto'
import {
  AmountTooLowErrorDto,
  EmailAlreadyUsedErrorDto,
  InvalidStatusErrorDto,
  MaxParticipantsErrorDto,
  NotFoundErrorDto,
} from './dto/errors.dto'
import {
  PaginatedPaymentGroupDto,
  PaymentGroupDto,
} from './dto/payment-group.dto'
import { UpdatePaymentGroupDto } from './dto/update-payment-group.dto'
import { ValidatePaymentGroupDto } from './dto/validate-payment-group.dto'
import { PaymentGroupsService } from './payment-groups.service'

@AllowPublicKey()
@ApiTags('Payment Groups')
@ApiBearerAuth()
@Controller(['payment-groups', 'groups'])
export class PaymentGroupsController {
  constructor(
    private readonly paymentGroupsService: PaymentGroupsService,
    private readonly ordersService: OrdersService,
    private readonly codesService: CodesService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a group' })
  @ApiBody({ type: CreatePaymentGroupDto })
  @ApiResponse({
    status: 201,
    description: 'Group successfully created.',
    type: PaymentGroupDto,
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createPaymentGroupDto: CreatePaymentGroupDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.paymentGroupsService.create(
      organization.id,
      livemode,
      createPaymentGroupDto,
      user?.id ?? apiKey?.id
    )
  }

  @Get()
  @ApiOperation({ summary: 'List groups' })
  @ApiResponse({
    status: 200,
    description: 'Groups successfully retrieved.',
    type: PaginatedPaymentGroupDto,
  })
  @ApiQuery({ required: false })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.paymentGroupsService.findAllByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group' })
  @ApiResponse({
    status: 200,
    description: 'Group successfully retrieved.',
    type: PaymentGroupDto,
  })
  @ApiQuery({ required: false })
  @ApiParam({ name: 'id', required: true, description: 'Unique group ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.paymentGroupsService.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode,
      query
    )
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'List all orders in a group' })
  @ApiResponse({
    status: 200,
    description: 'Orders successfully retrieved.',
    type: PaginatedOrdersDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique group ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async participants(@Param('id') id: string) {
    const orders = await this.ordersService.findAllByPaymentGroup(id)
    if (orders.count === 0) {
      return await this.paymentGroupsService.deprecatedGetParticipants(id)
    }
    return orders
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiBody({ type: UpdatePaymentGroupDto })
  @ApiResponse({
    status: 200,
    description: 'Group successfully updated.',
    type: PaymentGroupDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique group ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async update(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() updatePaymentGroupDto: UpdatePaymentGroupDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.paymentGroupsService.update(
      id,
      organization.id,
      livemode,
      updatePaymentGroupDto,
      user?.id ?? apiKey?.id
    )
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a group' })
  @ApiResponse({
    status: 200,
    description: 'Group successfully canceled.',
    type: PaymentGroupDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique group ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async cancel(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.paymentGroupsService.cancel(
      id,
      organization.id,
      livemode,
      user?.id ?? apiKey?.id
    )
  }

  @Post(':id/expire')
  @ApiOperation({ summary: 'Expire a group' })
  @ApiResponse({
    status: 200,
    description: 'Group successfully canceled.',
    type: PaymentGroupDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique group ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async expire(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.paymentGroupsService.expire(
      id,
      organization.id,
      livemode,
      user?.id ?? apiKey?.id
    )
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate a group' })
  @ApiBody({ type: CreatePaymentGroupDto })
  @ApiResponse({
    status: 200,
    description: 'Group is valid.',
    type: PaymentGroupDto,
  })
  @ApiNotFoundResponse({
    description: 'Group not found.',
    type: NotFoundErrorDto,
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
    type: InvalidStatusErrorDto,
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
    type: EmailAlreadyUsedErrorDto,
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
    type: MaxParticipantsErrorDto,
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
    type: AmountTooLowErrorDto,
    example: {
      error: {
        type: 'invalid_request_error',
        message: 'Amount 1500 is below the minimum purchase value of 3000.',
        code: 'AMOUNT_TOO_LOW',
      },
    },
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique group ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async validate(
    @Param('id') id: string,
    @Body() validatePaymentGroupDto: ValidatePaymentGroupDto
  ) {
    if (id.startsWith(AMBASSADOR_CODE_PREFIX)) {
      const ambassador = await this.codesService.validate(id)
      if (ambassador) return { current_discount_level: { value: 20 } }
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
