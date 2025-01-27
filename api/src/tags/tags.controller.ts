import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'

import { CurrentUser } from '../common/decorators/user.decorateur'
import { CreateTagDto } from './dto/create-tag.dto'
import { TagsService } from './tags.service'

@ApiTags('Tags')
@Controller('tags')
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  create(@Body() createTagDto: CreateTagDto, @CurrentUser() user?: User) {
    return this.tagsService.create(createTagDto, user?.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  findAll() {
    return this.tagsService.findAll()
  }
}
