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
import { ApiTags } from '@nestjs/swagger'
import { ApiKey, Organization, User } from '@prisma/client'

import { BankService } from '../bank/bank.service'
import { BrandSettingsService } from '../brand-settings/brand-settings.service'
import { UpdateBrandSettingsDto } from '../brand-settings/dto/update-brand-settings.dto'
import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { UpdatePaymentGroupSettingsDto } from '../payment-group-settings/dto/update-payment-group-setting.dto'
import { PaymentGroupSettingsService } from '../payment-group-settings/payment-group-settings.service'
import { UpdateOrganizationDto } from './dto/update-organization.dto'
import { OrganizationsService } from './organizations.service'

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly paymentGroupSettingsService: PaymentGroupSettingsService,
    private readonly brandSettingsService: BrandSettingsService,
    private readonly bankService: BankService
  ) {}

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @Query() query?: QueryDto
  ) {
    const organization = await this.organizationsService.findOne(id, query)

    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }

    return organization
  }

  @Get(':id/bank-account')
  async getBankAccount(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization
  ) {
    const organization = await this.organizationsService.findOne(id)

    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }

    if (!organization.cashbackBankId) {
      throw new NotFoundException(
        `Organization id ${id} does not have a cashback bank account`
      )
    }
    return await this.bankService.getAccountDetails(organization.cashbackBankId)
  }

  @Get(':id/bank-transactions')
  async getBankTransactions(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @Query('to') to?: string
  ) {
    const organization = await this.organizationsService.findOne(id)

    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }

    if (!organization.cashbackBankId) {
      throw new NotFoundException(
        `Organization id ${id} does not have a cashback bank account`
      )
    }
    return await this.bankService.getAccountTransactions(
      organization.cashbackBankId,
      to
    )
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apikey?: ApiKey
  ) {
    if (id !== currentOrganization.id && id !== currentOrganization.clerkId) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }

    return await this.organizationsService.update(
      id,
      updateOrganizationDto,
      user?.id || apikey?.id
    )
  }

  @Get(':id/payment-group-settings')
  @UseInterceptors(LivemodePresentInterceptor)
  async findPaymentGroupSettings(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    const organization = await this.organizationsService.findOne(id)
    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }
    return await this.paymentGroupSettingsService.findOneByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Patch(':id/payment-group-settings')
  @UseInterceptors(LivemodePresentInterceptor)
  async updatePaymentGroupSettings(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() updatePaymentGroupSettingsDto: UpdatePaymentGroupSettingsDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    const organization = await this.organizationsService.findOne(id)

    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }

    const paymentGroupSettings =
      await this.paymentGroupSettingsService.findOneByOrganizationIdAndLivemode(
        organization.id,
        livemode
      )
    if (!paymentGroupSettings) {
      throw new NotFoundException(
        `Payment group settings for organization ${id} not found`
      )
    }

    return await this.paymentGroupSettingsService.update(
      paymentGroupSettings.id,
      livemode,
      updatePaymentGroupSettingsDto,
      user?.id ?? apiKey?.id
    )
  }

  @Get(':id/brand-settings')
  @UseInterceptors(LivemodePresentInterceptor)
  async findBrandSettings(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    const organization = await this.organizationsService.findOne(id)

    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }
    return await this.brandSettingsService.findOneByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Patch(':id/brand-settings')
  @UseInterceptors(LivemodePresentInterceptor)
  async updateBrandSettings(
    @Param('id') id: string,
    @CurrentOrganization() currentOrganization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() updateBrandSettingsDto: UpdateBrandSettingsDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    const organization = await this.organizationsService.findOne(id)

    if (!organization || organization.id !== currentOrganization.id) {
      throw new NotFoundException(`Organization id ${id} not found`)
    }

    const brandSettings =
      await this.brandSettingsService.findOneByOrganizationIdAndLivemode(
        organization.id,
        livemode
      )
    if (!brandSettings) {
      throw new NotFoundException(
        `Brand settings for organization ${id} not found`
      )
    }

    return await this.brandSettingsService.update(
      brandSettings.id,
      livemode,
      updateBrandSettingsDto,
      user?.id ?? apiKey?.id
    )
  }
}
