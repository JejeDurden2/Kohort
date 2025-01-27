import { Injectable } from '@nestjs/common'
import axios from 'axios'
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator'

import { NODE_ENV_PROD } from '../../common/constants/miscellaneous.constants'
import { DefaultScopedLoggerService } from '../../logger/logger.service'

@Injectable()
@ValidatorConstraint({ async: true })
export class IsNonDisposableEmailConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly loggerService: DefaultScopedLoggerService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(email: string, _args: ValidationArguments) {
    if (process.env.NODE_ENV !== NODE_ENV_PROD) {
      return true
    }
    const url =
      'https://disposable.github.io/disposable-email-domains/domains.json'
    try {
      const response = await axios.get<string[]>(url)
      const domain = email.split('@')[1]
      return !response.data.includes(domain)
    } catch (error) {
      this.loggerService.error(
        'Error checking if the email is disposable.',
        error,
        {
          service: IsNonDisposableEmailConstraint.name,
          function: this.validate.name,
          object: email,
        }
      )
      return false
    }
  }

  defaultMessage() {
    return 'Disposable emails are not allowed.'
  }
}

export function IsNonDisposableEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNonDisposableEmailConstraint,
    })
  }
}
