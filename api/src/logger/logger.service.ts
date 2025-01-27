import { Inject, Injectable, Scope } from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Injectable({ scope: Scope.DEFAULT })
export class DefaultScopedLoggerService {
  private context: Record<string, unknown> = {}

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger
  ) {}

  setContext(context: Record<string, unknown>) {
    this.context = context
  }

  log(message: string, additionalContext?: Record<string, unknown>) {
    const context = { ...this.context, ...additionalContext }
    this.logger.log({ level: 'info', message, ...context })
  }

  error(
    message: string,
    trace?: string,
    additionalContext?: Record<string, unknown>
  ) {
    const context = { ...this.context, ...additionalContext }
    this.logger.error(message, { trace, ...context })
  }

  warn(message: string, additionalContext?: Record<string, unknown>) {
    const context = { ...this.context, ...additionalContext }
    this.logger.warn(message, context)
  }

  debug(message: string, additionalContext?: Record<string, unknown>) {
    const context = { ...this.context, ...additionalContext }
    this.logger.debug(message, context)
  }

  verbose(message: string, additionalContext?: Record<string, unknown>) {
    const context = { ...this.context, ...additionalContext }
    this.logger.verbose(message, context)
  }
}

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedLoggerService extends DefaultScopedLoggerService {}
