import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import * as humps from 'humps'
import { map } from 'rxjs/operators'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    if (request.body) {
      request.body = this.convertKeysToCamelCase(request.body)
    }
    if (request.query) {
      request.query = this.convertKeysToCamelCase(request.query)
    }
    return next.handle().pipe(map((data) => this.convertKeysToSnakeCase(data)))
  }

  private convertKeysToSnakeCase(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertKeysToSnakeCase(item))
    } else if (
      data !== null &&
      typeof data === 'object' &&
      data.constructor === Object
    ) {
      return Object.keys(data).reduce((result, key) => {
        const value = data[key]
        // If the key is 'metadata', skip the conversion for its value.
        if (key === 'metadata') {
          result[key] = value
        } else {
          result[humps.decamelize(key, { separator: '_' })] =
            this.convertKeysToSnakeCase(value)
        }
        return result
      }, {})
    }
    return data
  }

  private convertKeysToCamelCase(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertKeysToCamelCase(item))
    } else if (
      data !== null &&
      typeof data === 'object' &&
      data.constructor === Object
    ) {
      return Object.keys(data).reduce((result, key) => {
        const value = data[key]
        // If the key is 'metadata', skip the conversion for its value.
        if (key === 'metadata') {
          result[key] = value
        } else {
          result[humps.camelize(key)] = this.convertKeysToCamelCase(value)
        }
        return result
      }, {})
    }
    return data
  }
}
