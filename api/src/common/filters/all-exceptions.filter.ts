import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

import { RequestScopedLoggerService } from '../../logger/logger.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const message = exception.message

    response.status(status).json({
      error: {
        type: 'api_error',
        message,
      },
    })
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly loggerService: RequestScopedLoggerService
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const errorContextToLog = {
      headers: ctx.getRequest().headers,
      body: ctx.getRequest().body,
    }
    const responseBody = { error: {} }
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      const response = exception.getResponse()
      if (typeof response === 'string') {
        this.loggerService.error(response, exception.stack, errorContextToLog)
        responseBody.error = {
          type: 'invalid_request_error',
          message: response,
        }
      } else {
        this.loggerService.error(
          response['message'],
          exception.stack,
          errorContextToLog
        )
        responseBody.error = {
          type: 'invalid_request_error',
          message: response['message'],
          code: response['error'],
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.loggerService.error(
        exception.message.replace(/\n/g, ''),
        exception.stack,
        errorContextToLog
      )

      switch (exception.code) {
        case 'P2000': {
          httpStatus = HttpStatus.BAD_REQUEST
          responseBody.error = {
            type: 'invalid_request_error',
            message: 'Bad Request ' + JSON.stringify(exception.meta),
          }
          break
        }
        case 'P2002': {
          httpStatus = HttpStatus.CONFLICT
          responseBody.error = {
            type: 'invalid_request_error',
            message:
              'Unique constraint failed:' + JSON.stringify(exception.meta),
          }
          break
        }
        case 'P2025': {
          httpStatus = HttpStatus.NOT_FOUND
          responseBody.error = {
            type: 'invalid_request_error',
            message: 'Object not found',
          }
          break
        }
        default:
          responseBody.error = {
            type: 'api_error',
            message: 'Error Type: ' + exception.code,
          }
      }
    } else {
      this.loggerService.error(exception as string, '', errorContextToLog)
      responseBody.error = {
        type: 'api_error',
        message: 'Internal Server Error',
      }
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
