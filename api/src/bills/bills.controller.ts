import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Organization } from '@prisma/client'
import { Response } from 'express'

import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { BillsService } from './bills.service'

@ApiTags('Bills')
@Controller('bills')
@ApiBearerAuth()
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @ApiOperation({
    summary: 'Find all bills of an organization.',
    description: 'Find all bills of an organization.',
    operationId: 'findAllBills',
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  @ApiOkResponse({ description: 'List of customers.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  async findAll(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Query() query: QueryDto
  ) {
    return await this.billsService.findByOrganizationIdAndLivemode(
      organization.id,
      livemode,
      query
    )
  }

  @Get(':id/download/pdf')
  @ApiOperation({
    summary: 'Download a bill.',
    description: 'Download a bill.',
    operationId: 'downloadBill',
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  @ApiOkResponse({ description: 'Bill has been successfully downloaded.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  async download(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('id') id: string,
    @Res() response: Response
  ) {
    return await this.billsService.downloadPdf(
      id,
      organization,
      livemode,
      response
    )
  }

  @Get(':id/regenerate')
  @ApiOperation({
    summary: 'Regenerate a bill.',
    description: 'Regeneratea bill.',
    operationId: 'regenerateBill',
  })
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  @ApiOkResponse({ description: 'Bill has been successfully regenerated.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  async regenerate(
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean,
    @Param('id') id: string
  ) {
    return await this.billsService.regenerate(id, organization.id, livemode)
  }
}
