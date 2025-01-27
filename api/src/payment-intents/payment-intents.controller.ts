import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'
import { PaymentIntentsService } from './payment-intents.service'

@AllowPublicKey()
@Controller('payment-intents')
export class PaymentIntentsController {
  constructor(private readonly paymentIntentsService: PaymentIntentsService) {}

  @Post()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.paymentIntentsService.create(
      organization,
      livemode,
      createPaymentIntentDto,
      user?.id ?? apiKey?.id
    )
  }

  @Get()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return this.paymentIntentsService.findByOrganizationIdAndLivemode(
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
    const paymentIntent =
      await this.paymentIntentsService.findOneByOrganizationIdAndLivemode(
        id,
        organization.id,
        livemode,
        query
      )

    if (!paymentIntent) {
      throw new BadRequestException(`PaymentIntent with id ${id} not found`)
    }

    return paymentIntent
  }
}
