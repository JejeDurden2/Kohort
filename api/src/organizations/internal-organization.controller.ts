import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { IsMasterKeyProtected } from '../common/decorators/is-master-key-protected.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { OrganizationsService } from './organizations.service'

@Controller('i/organization')
export class InternalOrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(':id')
  @IsMasterKeyProtected()
  async findOne(@Param('id') id: string, @Query() query: QueryDto) {
    const organization = await this.organizationsService.findOne(id, query)
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found.`)
    }
    return organization
  }

  @Get('brands/list')
  @ApiOperation({ summary: 'List all organizations with their brand settings' })
  @ApiResponse({
    status: 200,
    description: 'Organizations with brand settings successfully retrieved.',
  })
  @IsMasterKeyProtected()
  async listBrands(@Query() query: QueryDto) {
    return await this.organizationsService.listOrganizationsWithBrands(query)
  }
}
