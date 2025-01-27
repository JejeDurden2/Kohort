import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common'
import { Organization } from '@prisma/client'

import { IsPublic } from '../common/decorators/is-public.decorator'
import { CurrentLivemode } from '../common/decorators/livemode.decorator'
import { CurrentOrganization } from '../common/decorators/organization.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { LivemodePresentInterceptor } from '../common/guards/livemode-present.interceptor'
import { OrganizationPresentInterceptor } from '../common/guards/organization-present.interceptor'
import { GetStreamService } from './getstream.service'

@Controller('getstream')
export class GetStreamController {
  constructor(private readonly getstreamService: GetStreamService) {}

  @Get(':feedName/:feedId')
  @IsPublic()
  @UseInterceptors(OrganizationPresentInterceptor, LivemodePresentInterceptor)
  async getFeed(
    @Param('feedName') feedName: string,
    @Param('feedId') feedId: string,
    @Query() query: QueryDto,
    @CurrentOrganization() organization: Organization,
    @CurrentLivemode() livemode: boolean
  ) {
    return await this.getstreamService.getActivitiesFromFeed(
      feedName,
      feedId,
      query,
      organization,
      livemode
    )
  }
}
