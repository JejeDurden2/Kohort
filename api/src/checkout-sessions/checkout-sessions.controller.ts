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
import { ApiKey, Organization, User } from '@prisma/client'

import { AllowPublicKey } from '../common/decorators/allow-public-key.decorator'
import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { RequestScopedLoggerService } from '../logger/logger.service'
import { CheckoutSessionsService } from './checkout-sessions.service'
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto'

@AllowPublicKey()
@Controller('checkout-sessions')
export class CheckoutSessionsController {
  constructor(
    private readonly checkoutSessionsService: CheckoutSessionsService,
    private readonly loggerService: RequestScopedLoggerService
  ) {}

  @Post()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    const checkoutSession = await this.checkoutSessionsService.create(
      organization,
      livemode,
      createCheckoutSessionDto,
      user?.id ?? apiKey?.id
    )

    this.loggerService.log('DEPRECATED CheckoutSession created.', {
      controller: CheckoutSessionsController.name,
      function: this.create.name,
      objectId: checkoutSession.id,
    })

    return checkoutSession
  }

  @Get()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.checkoutSessionsService.findByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Get(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    const checkoutSession =
      await this.checkoutSessionsService.findOneByOrganizationIdAndLivemode(
        id,
        organization.id,
        livemode,
        query
      )
    if (!checkoutSession) {
      throw new NotFoundException(`Checkout session with id ${id} not found.`)
    }
    return checkoutSession
  }

  @Patch(':id/expire')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async expire(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    const checkoutSession = await this.checkoutSessionsService.expire(
      id,
      organization.id,
      livemode,
      user?.id ?? apiKey?.id
    )

    this.loggerService.log('CheckoutSession expired.', {
      controller: CheckoutSessionsController.name,
      function: this.create.name,
      objectId: checkoutSession.id,
    })

    return checkoutSession
  }
}
