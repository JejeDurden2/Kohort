import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { finalize, tap } from 'rxjs/operators'

import { RequestScopedLoggerService } from './logger/logger.service'

@Injectable({ scope: Scope.REQUEST })
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: RequestScopedLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp()
    const req = httpContext.getRequest()
    const contextData = {
      livemode: req.currentLivemode,
      organization: req.currentOrganization,
      user: req.currentUser,
    }

    // Set context for logging
    this.loggerService.setContext(contextData)

    const now = Date.now()

    return next.handle().pipe(
      tap(() =>
        this.loggerService.log(
          `Request to ${req.url} took ${Date.now() - now}ms`
        )
      ),
      finalize(() => {
        // Cleanup context after request processing
        this.loggerService.setContext({})
      })
    )
  }
}
