import { Inject, Injectable } from '@nestjs/common'
import { CustomPrismaService } from 'nestjs-prisma'

import { TAG_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateTagDto } from './dto/create-tag.dto'

@Injectable()
export class TagsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService
  ) {}

  async create(createTagDto: CreateTagDto, createdBy: string = 'system') {
    const id = this.idsService.createId(TAG_DATABASE_PREFIX)
    return await this.prisma.client.tag.create({
      data: {
        id,
        ...createTagDto,
        createdBy,
      },
    })
  }

  async findAll() {
    return await this.prisma.client.tag.findMany()
  }
}
