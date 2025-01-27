import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApiKey, Organization, User } from '@prisma/client'

import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { RequestScopedLoggerService } from '../logger/logger.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { OrderDto, PaginatedOrdersDto } from './dto/order.dto'
import { OrdersService } from './orders.service'

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly loggerService: RequestScopedLoggerService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created.',
    type: OrderDto,
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    const order = await this.ordersService.create(
      organization,
      livemode,
      createOrderDto,
      user?.id ?? apiKey?.id
    )

    this.loggerService.log('Order created.', {
      controller: OrdersController.name,
      function: this.create.name,
      objectId: order.id,
    })

    return order
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order' })
  @ApiResponse({
    status: 200,
    description: 'Order successfully retrieved.',
    type: OrderDto,
  })
  @ApiQuery({ required: false })
  @ApiParam({ name: 'id', required: true, description: 'Unique order ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    const order = await this.ordersService.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode,
      query
    )
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found.`)
    }
    return order
  }

  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiResponse({
    status: 200,
    description: 'Orders successfully retrieved.',
    type: PaginatedOrdersDto,
  })
  @ApiQuery({ required: false })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.ordersService.findByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }
}
