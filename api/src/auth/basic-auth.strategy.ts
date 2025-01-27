import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as express from 'express'
import { BasicStrategy } from 'passport-http'

import { AuthService } from './auth.service'

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  authenticate(req: express.Request) {
    const authorization = req.headers.authorization

    if (!authorization) {
      throw new UnauthorizedException(
        'Invalid Authorization header. Expected: [Basic|Bearer] <credentials>'
      )
    }

    const [scheme, credentials] = authorization.split(' ')
    if (scheme !== 'Basic' || !credentials || credentials === undefined) {
      throw new UnauthorizedException(
        'Invalid Authorization header. Expected: [Basic|Bearer] <credentials>'
      )
    }

    // User is not expected to give a password, but passport-http will reject the request without a password.
    // We manually add foo as a password to pass the validation from BasciStrategy.
    const decodedCredentials = Buffer.from(credentials, 'base64').toString()
    const newCredentials = `${decodedCredentials}foo`
    req.headers.authorization = `${scheme} ${Buffer.from(
      newCredentials
    ).toString('base64')}`
    return super.authenticate(req)
  }

  async validate(key: string) {
    const checkKey = await this.authService.validateApiKey(key)
    if (!checkKey) {
      throw new UnauthorizedException('Api Key is not valid')
    }
    return true
  }
}
