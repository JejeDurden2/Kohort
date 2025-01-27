import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { IsMasterKeyProtected } from '../common/decorators/is-master-key-protected.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { AmbassadorService } from './ambassador.service'
import { AmbassadorDto, PaginatedAmbassadorDto } from './dto/ambassador.dto'
import { CreateAmbassadorDto } from './dto/create-ambassador.dto'
import {
  UpdateAmbassadorDto,
  UpdateAmbassadorPostImageDto,
} from './dto/update-ambassador.dto'

@ApiTags('Ambassador')
@Controller('i/ambassador')
@IsMasterKeyProtected()
@ApiExcludeController()
export class AmbassadorController {
  constructor(private readonly ambassadorService: AmbassadorService) {}

  @Post()
  @ApiOperation({ summary: 'Create ambassador with phone number' })
  @ApiBody({
    type: CreateAmbassadorDto,
    description: 'Ambassador creation payload',
  })
  @ApiResponse({
    status: 201,
    description: 'Ambassador successfully created.',
    type: AmbassadorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  async create(@Body() createAmbassadorDto: CreateAmbassadorDto) {
    return await this.ambassadorService.create(createAmbassadorDto)
  }

  @Patch(':id/generate-code')
  @ApiOperation({ summary: 'Generate a new referral code for an ambassador' })
  @ApiParam({
    name: 'id',
    description: 'Ambassador ID',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateAmbassadorDto,
    description: 'Ambassador update payload',
  })
  @ApiResponse({
    status: 200,
    description: 'Ambassador successfully updated.',
    type: AmbassadorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ambassador not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAmbassadorDto: UpdateAmbassadorDto
  ) {
    return await this.ambassadorService.update(id, updateAmbassadorDto)
  }

  @Patch(':id/post-image')
  @ApiOperation({ summary: 'Update post image for an ambassador' })
  @ApiParam({
    name: 'id',
    description: 'Ambassador ID',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateAmbassadorPostImageDto,
    description: 'Ambassador post image update payload',
  })
  async updatePostImage(
    @Param('id') id: string,
    @Body() updateAmbassadorPostImageDto: UpdateAmbassadorPostImageDto
  ) {
    return await this.ambassadorService.postImage(
      id,
      updateAmbassadorPostImageDto
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an ambassador' })
  @ApiParam({
    name: 'id',
    description: 'Ambassador ID',
    type: String,
    required: true,
  })
  @ApiQuery({
    type: QueryDto,
    required: false,
    description: 'Query parameters for filtering and including relations',
  })
  @ApiResponse({
    status: 200,
    description: 'Ambassador successfully retrieved.',
    type: AmbassadorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ambassador not found.',
  })
  async findOne(@Param('id') id: string, @Query() query: QueryDto) {
    const ambassador = await this.ambassadorService.findOne(id, query)

    if (!ambassador) {
      const ambassador = await this.ambassadorService.findOneByCode(id)
      if (!ambassador)
        throw new NotFoundException(
          `Ambassador with id or code ${id} not found`
        )
      return ambassador
    }

    return ambassador
  }

  @Get()
  @ApiOperation({ summary: 'List ambassadors' })
  @ApiQuery({
    type: QueryDto,
    required: false,
    description: 'Query parameters for filtering and including relations',
  })
  @ApiResponse({
    status: 200,
    description: 'Ambassadors successfully retrieved.',
    type: PaginatedAmbassadorDto,
  })
  async findAll(@Query() query: QueryDto) {
    return await this.ambassadorService.findAll(query)
  }
}
