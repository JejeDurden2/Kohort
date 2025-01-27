import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'

import { LIVEMODE_DATABASE_PREFIX } from './common/constants/database-prefixes.constants'
import { OrganizationsService } from './organizations/organizations.service'

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private organizationsService: OrganizationsService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest()
    if (request['x-organization-id'])
      request.currentOrganization = await this.organizationsService.findOne(
        request['x-organization-id']
      )
    if (request['x-livemode'])
      request.currentLivemode =
        request['x-livemode'] === LIVEMODE_DATABASE_PREFIX

    return handler.handle()
  }
}
