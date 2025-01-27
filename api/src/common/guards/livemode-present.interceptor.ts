import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class LivemodePresentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    if (request.currentLivemode === undefined) {
      throw new NotFoundException(
        'Livemode not found. Please check your api key'
      )
    }
    return next.handle()
  }
}
