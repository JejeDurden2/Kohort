import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class OrganizationPresentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    if (!request.currentOrganization) {
      throw new NotFoundException(
        'Organization not found. Please check your api key'
      )
    }
    return next.handle()
  }
}
