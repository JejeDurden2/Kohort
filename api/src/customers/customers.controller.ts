import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
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

import { AllowPublicKey } from '../common/decorators/allow-public-key.decorator'
import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { CustomerDto, PaginatedCustomersDto } from './dto/customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@AllowPublicKey()
@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully created.',
    type: CustomerDto,
  })
  @ApiBody({ type: CreateCustomerDto })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.customersService.create(
      organization.id,
      livemode,
      createCustomerDto,
      user?.id ?? apiKey?.id
    )
  }

  @Get()
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({
    status: 200,
    description: 'Customers successfully retrieved.',
    type: PaginatedCustomersDto,
  })
  @ApiQuery({ required: false })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.customersService.findByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer successfully retrieved.',
    type: CustomerDto,
  })
  @ApiQuery({ required: false })
  @ApiParam({ name: 'id', required: true, description: 'Unique customer ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    const customer =
      await this.customersService.findOneByOrganizationIdAndLivemode(
        id,
        organization.id,
        livemode,
        query
      )
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`)
    }
    return customer
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update customer',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully updated.',
    type: CustomerDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique customer ID' })
  @ApiBody({
    type: UpdateCustomerDto,
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async update(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.customersService.update(
      id,
      organization.id,
      livemode,
      updateCustomerDto,
      user?.id ?? apiKey?.id
    )
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully blocked.',
    type: CustomerDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique customer ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async block(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.customersService.block(
      id,
      organization.id,
      livemode,
      user?.id ?? apiKey?.id
    )
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Unblock customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully unblocked.',
    type: CustomerDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique customer ID' })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async unblock(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.customersService.unblock(
      id,
      organization.id,
      livemode,
      user?.id ?? apiKey?.id
    )
  }

  @Delete(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully deleted.',
    type: CustomerDto,
  })
  @ApiParam({ name: 'id', required: true, description: 'Unique customer ID' })
  async remove(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.customersService.remove(
      id,
      organization.id,
      livemode,
      user?.id ?? apiKey?.id
    )
  }
}
