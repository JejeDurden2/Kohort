import { createClerkClient } from '@clerk/clerk-sdk-node'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import * as jwt from 'jsonwebtoken'

import { AuthService } from '../../auth/auth.service'
import { DefaultScopedLoggerService } from '../../logger/logger.service'
import {
  DATABASE_PREFIX_SEPARATOR,
  PUBLIC_KEY_DATABASE_PREFIX,
  SECRET_KEY_DATABASE_PREFIX,
} from '../constants/database-prefixes.constants'
import { ALLOW_PUBLIC_KEY } from '../decorators/allow-public-key.decorator'
import { IS_MASTER_KEY_PROTECTED } from '../decorators/is-master-key-protected.decorator'
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator'
import { IS_WEBHOOK_KEY } from '../decorators/is-webhook.decorator'
import { ClerkJWTClaims } from './interfaces/clerk-jwt-claim.interface'

@Injectable()
export class CustomAuthGuard extends AuthGuard('basic') implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly configService: ConfigService,
    protected readonly authService: AuthService,
    protected readonly loggerService: DefaultScopedLoggerService
  ) {
    super(authService)
  }

  verifyToken(token: string) {
    const publicKey = this.configService.get('CLERK_PEM_PUBLIC_KEY')

    try {
      jwt.verify(token, publicKey)
    } catch (error) {
      this.loggerService.error('Invalid token or api key.', error)
      throw new UnauthorizedException('Invalid token or api key.')
    }
  }

  async verifySession(sessionId: string) {
    if (!sessionId) {
      throw new UnauthorizedException('Missing sid in token claims.')
    }
    const clerk = createClerkClient({
      secretKey: this.configService.get('CLERK_SECRET_KEY'),
    })
    const session = await clerk.sessions.getSession(sessionId)
    if (session.status !== 'active')
      throw new UnauthorizedException('Inactive session.')
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const isWebhook = this.reflector.getAllAndOverride<boolean>(
      IS_WEBHOOK_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (isWebhook) {
      return true
    }

    const isMasterKeyProtected = this.reflector.getAllAndOverride<boolean>(
      IS_MASTER_KEY_PROTECTED,
      [context.getHandler(), context.getClass()]
    )
    const request = context.switchToHttp().getRequest()
    if (isMasterKeyProtected) {
      const masterKey = this.authService.getBasicToken(request)
      return masterKey === this.configService.get('MASTER_KEY')
    }

    const token = this.authService.getBearerToken(request)

    // if no token, check for basic auth
    if (!token) {
      return super.canActivate(context) as boolean
    }

    // if api key is passed as token
    if (
      token.startsWith(
        `${SECRET_KEY_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}`
      ) ||
      token.startsWith(
        `${PUBLIC_KEY_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}`
      )
    ) {
      const allowPublicKey = this.reflector.getAllAndOverride<boolean>(
        ALLOW_PUBLIC_KEY,
        [context.getHandler(), context.getClass()]
      )

      const key = await this.authService.validateApiKey(token, allowPublicKey)
      if (key) {
        return true
      } else {
        throw new UnauthorizedException('Invalid Api Key.')
      }
    }

    // Clerk jwt token
    else {
      this.verifyToken(token)
      const decodedToken = jwt.decode(token) as ClerkJWTClaims
      await this.verifySession(decodedToken.sid)
      const user = await this.authService.validateUser(decodedToken.sub)
      if (!user) throw new UnauthorizedException('User not found.')
      request.currentUser = user

      return true
    }
  }
}
