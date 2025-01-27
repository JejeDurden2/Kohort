import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiKey, ApiKeyType, Organization, User } from '@prisma/client'

import { CurrentApiKey } from '../common/decorators/api-key.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { CurrentUser } from '../common/decorators/user.decorateur'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { RequestScopedLoggerService } from '../logger/logger.service'
import { ApiKeysService } from './api-keys.service'
import { CreateApiKeyDto } from './dto/create-api-key.dto'
import { UpdateApiKeyDto } from './dto/update-api-key.dto'

@Controller('api-keys')
export class ApiKeysController {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly loggerService: RequestScopedLoggerService
  ) {}

  @Post()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() createApiKeyDto: CreateApiKeyDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    if (livemode === false) {
      this.loggerService.error('Cannot create an api key in test mode.', '', {
        controller: ApiKeysController.name,
        function: this.create.name,
        dto: createApiKeyDto,
      })
      throw new BadRequestException('Cannot create an api key in test mode.')
    } else {
      createApiKeyDto.type = ApiKeyType.SECRET // Can only create secret keys in live mode
      const apiKeyCreated = await this.apiKeysService.create(
        organization.id,
        livemode,
        createApiKeyDto,
        user?.id ?? apiKey?.id
      )

      this.loggerService.log('Api Key created', {
        controller: ApiKeysController.name,
        function: this.create.name,
      })

      return apiKeyCreated
    }
  }

  @Get(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findOne(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('id') id: string
  ) {
    const apiKey = await this.apiKeysService.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )
    if (!apiKey || apiKey.organizationId !== organization.id) {
      throw new NotFoundException(`Api key with id ${id} not found.`)
    }
    return apiKey
  }

  @Get()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.apiKeysService.findByOrganizationId(
      organization.id,
      livemode
    )
  }

  @Post(':id/roll')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async roll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('id') id: string,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    const apiKeyToRoll =
      await this.apiKeysService.findOneByOrganizationIdAndLivemode(
        id,
        organization.id,
        livemode
      )
    if (!apiKeyToRoll || apiKeyToRoll.organizationId !== organization.id) {
      this.loggerService.error('ApiKey not found', '', {
        controller: ApiKeysController.name,
        function: this.roll.name,
      })
      throw new NotFoundException(`Api key with id ${id} not found.`)
    }
    return await this.apiKeysService.roll(
      apiKeyToRoll.id,
      apiKeyToRoll.organizationId,
      apiKeyToRoll.livemode,
      { type: apiKeyToRoll.type, name: apiKeyToRoll.name },
      user?.id ?? apiKey?.id
    )
  }

  @Patch(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async update(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    if (livemode === false) {
      throw new BadRequestException('Cannot update an api key in test mode.')
    }
    const apiKeytoUpdate =
      await this.apiKeysService.findOneByOrganizationIdAndLivemode(
        id,
        organization.id,
        livemode
      )

    if (!apiKeytoUpdate || apiKeytoUpdate.organizationId !== organization.id) {
      throw new NotFoundException(`Api key with id ${id} not found.`)
    }

    if (
      apiKeytoUpdate.type === ApiKeyType.SECRET &&
      apiKeytoUpdate.livemode === true
    ) {
      throw new BadRequestException('Cannot edit a live secret key.')
    }

    const updatedApiKey = await this.apiKeysService.update(
      id,
      updateApiKeyDto,
      user?.id ?? apiKey?.id
    )

    this.loggerService.log('api Key updated', {
      controller: ApiKeysController.name,
      function: this.update.name,
      objectId: updatedApiKey.id,
      dto: updateApiKeyDto,
    })

    return updatedApiKey
  }

  @Delete(':id')
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async remove(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('id') id: string
  ) {
    if (livemode === false) {
      throw new BadRequestException('Cannot delete an api key in test mode.')
    }
    const apiKey = await this.apiKeysService.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )

    if (!apiKey || apiKey.organizationId !== organization.id) {
      throw new NotFoundException(`Api key with id ${id} not found.`)
    }

    if (apiKey.livemode !== true || apiKey.type !== ApiKeyType.SECRET) {
      throw new BadRequestException('Only live secret keys can be deleted.')
    }

    const deletedApiKey = await this.apiKeysService.hardRemove(
      id,
      organization.id,
      livemode
    )

    this.loggerService.log('api Key updated', {
      controller: ApiKeysController.name,
      function: this.remove.name,
      objectId: apiKey.id,
    })

    return deletedApiKey
  }
}
