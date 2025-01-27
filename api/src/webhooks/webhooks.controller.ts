import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { ApiKey, Organization, User } from '@prisma/client'

import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { CreateWebhookDto } from './dto/create-webhook.dto'
import { UpdateWebhookDto } from './dto/update-webhook.dto'
import { WebhooksService } from './webhooks.service'

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}
  @Post()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createWebhookDto: CreateWebhookDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.webhooksService.create(
      organization,
      livemode,
      createWebhookDto,
      user?.id ?? apiKey?.id
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
    return await this.webhooksService.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode,
      query
    )
  }

  @Get()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.webhooksService.findByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Patch(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async update(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() updateWebhookDto: UpdateWebhookDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.webhooksService.update(
      id,
      organization,
      livemode,
      updateWebhookDto,
      user?.id ?? apiKey?.id
    )
  }

  @Get(':id/secret')
  async getSecret(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.webhooksService.getSecret(id, organization, livemode)
  }

  @Post(':id/roll')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async rollSecret(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.webhooksService.rollSecret(id, organization, livemode)
  }

  @Get(':id/stats')
  async getStats(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.webhooksService.getStats(id, organization, livemode)
  }

  @Post(':id/messages/:messageId/retry')
  async retry(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.webhooksService.retry(
      id,
      messageId,
      organization,
      livemode
    )
  }

  @Get(':id/messages/:filter?')
  async findAllMessages(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('filter') filter?: 'success' | 'error'
  ) {
    return await this.webhooksService.findAllMessages(
      id,
      organization,
      livemode,
      filter
    )
  }

  @Get('messages/:messageId')
  async getMessage(
    @Param('messageId') messageId: string,
    @CurrentOrganization() organization: Organization
  ) {
    return await this.webhooksService.findOneMessage(messageId, organization)
  }

  @Delete(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async delete(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.webhooksService.hardRemove(id, organization, livemode)
  }
}
