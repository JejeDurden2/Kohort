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
  Query,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
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
import { isKohortInternalEmail } from '../common/utils/is-kohort-internal-email'
import { GetTransactionalEmailDto } from './dto/get-transactional-email.dto'
import { TestTransactionalEmailDto } from './dto/test-transactional-email.dto'
import { UpdateTransactionalEmailDto } from './dto/update-transactional-email.dto'
import { TransactionalEmailsService } from './transactional-emails.service'

@AllowPublicKey()
@ApiTags('Transactional Emails')
@Controller('transactional-emails')
@ApiBearerAuth()
export class TransactionalEmailsController {
  constructor(
    private readonly transactionalEmailsService: TransactionalEmailsService
  ) {}

  @Post(':id/test')
  @ApiOperation({
    summary: 'Test transactional email',
    description:
      'Compile the custom email template and send it to a specified address using Resend.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the transactional email to test',
    type: String,
  })
  async testTransactionalEmail(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() testTransactionalEmailDto: TestTransactionalEmailDto
  ) {
    return await this.transactionalEmailsService.sendTransactionalEmail(
      id,
      organization,
      livemode,
      testTransactionalEmailDto
    )
  }

  @Post(':id')
  @ApiOperation({
    summary: 'Create transactional email',
    description:
      'Create a new transactional email for the specified organization and livemode from a default (system) transactional email.',
    operationId: 'createTransactionalEmail',
  })
  @ApiOkResponse({
    description: 'Transactional email has been successfully created.',
    type: GetTransactionalEmailDto,
  })
  @ApiBadRequestResponse({
    description:
      'You can not create a new custom transactional email from a non-default (system) transactional email.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. The provided API key is invalid or missing.',
  })
  @ApiNotFoundResponse({
    description:
      'The default (system) transactional email with the ID ${EmailSystemId} does not exist.',
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    description:
      'Unique identifier of the default (system) transactional email to override',
    type: String,
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async create(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.transactionalEmailsService.create(
      organization.id,
      livemode,
      id,
      user?.id ?? apiKey?.id
    )
  }

  @Get()
  @ApiOperation({
    summary: 'List transactional emails',
    description:
      'Retrieves a list of all transactional emails for the specified organization and livemode. Supports filtering, sorting, and pagination.',
    operationId: 'findAllTransactionalEmails',
  })
  @ApiOkResponse({
    description: 'List of transactional emails retrieved successfully.',
    type: [GetTransactionalEmailDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters provided.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. The provided API key is invalid or missing.',
  })
  @ApiQuery({
    required: false,
    description: 'Query parameters for filtering, sorting, and pagination.',
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto,
    @CurrentUser() user?: User
  ) {
    const isInternalUser = isKohortInternalEmail(user?.primaryEmailAddress)
    const isInternal = isInternalUser ? undefined : false
    return await this.transactionalEmailsService.findByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query,
      isInternal
    )
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve transactional email',
    description: 'Retrieves the details of a specific transactional email.',
    operationId: 'findOneTransactionalEmail',
  })
  @ApiOkResponse({
    description: 'Transactional email details retrieved successfully.',
    type: GetTransactionalEmailDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. The provided API key is invalid or missing.',
    type: UnauthorizedException,
  })
  @ApiNotFoundResponse({
    description: 'Transactional email with id ${id} not found',
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the transactional email to fetch',
    type: String,
  })
  @ApiQuery({
    required: false,
    description:
      'Query parameters for additional filtering, sorting, and expansion.',
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto,
    @CurrentUser() user?: User
  ) {
    const isInternalUser = isKohortInternalEmail(user?.primaryEmailAddress)

    // If the user is external, set isInternal to false to filter out internal emails
    const isInternal = isInternalUser ? undefined : false
    const transactionalEmail =
      await this.transactionalEmailsService.findOneByOrganizationIdAndLivemode(
        id,
        organization.id,
        livemode,
        query,
        isInternal
      )
    if (!transactionalEmail) {
      throw new NotFoundException(`Transactional email with id ${id} not found`)
    }
    return transactionalEmail
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update transactional email',
    description: 'Updates the details of an existing transactional email.',
    operationId: 'updateTransactionalEmail',
  })
  @ApiOkResponse({
    description: 'Transactional email has been successfully updated.',
    type: GetTransactionalEmailDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Check the provided fields for correctness.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. The provided API key is invalid or missing.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the transactional email to update',
    type: String,
  })
  @ApiBody({
    description: 'The data required to update an existing transactional email.',
    type: UpdateTransactionalEmailDto,
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async update(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Body() UpdateTransactionalEmailDto: UpdateTransactionalEmailDto,
    @CurrentUser() user?: User,
    @CurrentApiKey() apiKey?: ApiKey
  ) {
    return await this.transactionalEmailsService.update(
      id,
      livemode,
      UpdateTransactionalEmailDto,
      user?.id ?? apiKey?.id
    )
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete transactional email',
    description:
      'Deletes a custom transactional email by their unique identifier. This action is irreversible.',
    operationId: 'deleteTransactionalEmail',
  })
  @ApiOkResponse({
    description: 'Transaction email has been successfully deleted.',
    type: GetTransactionalEmailDto,
  })
  @ApiBadRequestResponse({
    description: 'You can not remove a default (system) transactional email.',
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. The provided API key is invalid or missing.',
    type: UnauthorizedException,
  })
  @ApiNotFoundResponse({
    description: 'Transactional email with id ${id} not found',
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the transactional email to delete',
    type: String,
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async remove(
    @Param('id') id: string,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.transactionalEmailsService.remove(
      id,
      organization.id,
      livemode
    )
  }
}
