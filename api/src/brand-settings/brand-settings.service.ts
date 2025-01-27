import { Inject, Injectable } from '@nestjs/common'
import { CustomPrismaService } from 'nestjs-prisma'

import { BRAND_SETTINGS_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { BRAND_SETTINGS_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateBrandSettings } from './dto/create-brand-settings.dto'
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto'

@Injectable()
export class BrandSettingsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService
  ) {}

  async create(organizationId: string, livemode: boolean, createdBy: string) {
    const id = this.idsService.createId(BRAND_SETTINGS_DATABASE_PREFIX)
    return await this.prisma.client.brandSettings.create({
      data: {
        id,
        organizationId,
        livemode,
        createdBy,
        updatedBy: createdBy,
      },
    })
  }

  async createFromData(
    organizationId: string,
    data: CreateBrandSettings,
    userId: string
  ) {
    const existingBrandSettings =
      await this.prisma.client.brandSettings.findFirst({
        where: { organizationId },
      })

    if (!existingBrandSettings) {
      const id = this.idsService.createId(BRAND_SETTINGS_DATABASE_PREFIX)
      await this.prisma.client.brandSettings.create({
        data: {
          id,
          organizationId,
          livemode: data.livemode,
          logoUrl: data.logoUrl,
          color: data.color,
          backgroundUrl: data.backgroundUrl,
          modalImageUrl: data.modalImageUrl,
          websiteUrl: data.websiteUrl,
          aiPromptShareMessage: data.aiPromptShareMessage,
          createdBy: userId,
          updatedBy: userId,
          tags: data.tagIds
            ? {
                connect: data.tagIds.map((tagId) => ({ id: tagId })),
              }
            : undefined,
          postImageUrls: data.postImageUrls
            ? {
                set: data.postImageUrls,
              }
            : undefined,
        },
      })
    }
  }

  async findOneByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(BRAND_SETTINGS_RELATIONS, query?.expand)
    return await this.prisma.client.brandSettings.findFirst({
      where: {
        organizationId,
        livemode,
      },
      include,
    })
  }

  async update(
    id: string,
    livemode: boolean,
    updateBrandSettingsDto: UpdateBrandSettingsDto,
    updatedBy: string = SYSTEM
  ) {
    const { postImageUrls, tagIds, ...brandSettingsDataWithoutTags } =
      updateBrandSettingsDto

    return await this.prisma.client.brandSettings.update({
      where: {
        id,
        livemode,
      },
      data: {
        ...brandSettingsDataWithoutTags,
        updatedBy,
        tags: tagIds
          ? {
              set: tagIds.map((tagId) => ({ id: tagId })),
            }
          : undefined,
        postImageUrls: postImageUrls
          ? {
              set: postImageUrls,
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    })
  }
}
