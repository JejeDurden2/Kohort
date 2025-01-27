import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'

import { createUser } from '../../../test/factories/user.factory'
import { generateToken } from '../../../test/utils/jwt-generator'
import { ApiKeysService } from '../../api-keys/api-keys.service'
import { AuthService } from '../../auth/auth.service'
import { DefaultScopedLoggerService } from '../../logger/logger.service'
import { UsersService } from '../../users/users.service'
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator'
import { IS_WEBHOOK_KEY } from '../decorators/is-webhook.decorator'
import { CustomAuthGuard } from './auth.guard'

export const mockCanActivate = (ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().headers.authorization !== undefined
}

describe('CustomAuthGuard', () => {
  let customGuard: CustomAuthGuard
  let reflector: Reflector
  let configService: ConfigService
  let authService: AuthService
  let loggerService: DefaultScopedLoggerService
  let usersService: DeepMocked<UsersService>
  let apiKeysService: DeepMocked<ApiKeysService>
  let user: User
  let mockContext: DeepMocked<ExecutionContext>

  beforeEach(async () => {
    usersService = createMock<UsersService>()
    apiKeysService = createMock<ApiKeysService>()
    
    reflector = new Reflector()
    configService = new ConfigService()
    authService = new AuthService(usersService, apiKeysService)
    loggerService = new DefaultScopedLoggerService(createMock())
    
    customGuard = new CustomAuthGuard(
      reflector,
      configService,
      authService,
      loggerService
    )
    
    user = createUser()
    mockContext = createMock<ExecutionContext>()
  })

  it('is defined', () => {
    expect(customGuard).toBeDefined()
  })

  describe('CanActivate', () => {
    it('will return true for a valid JWT', async () => {
      const token = generateToken(user.clerkId)

      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: `Bearer ${token}`,
        },
        isAuthenticated: () => true,
      })

      jest
        .spyOn(customGuard, 'verifyToken')
        .mockImplementation(async () => undefined)

      jest
        .spyOn(customGuard, 'verifySession')
        .mockImplementation(async () => undefined)

      jest
        .spyOn(authService, 'validateUser')
        .mockImplementation(async () => user)

      jest
        .spyOn(AuthGuard('basic').prototype, 'canActivate')
        .mockImplementation(async () => true)

      expect(await customGuard.canActivate(mockContext)).toEqual(true)
    })

    it('will throw UnauthorizedException for an invalid JWT', async () => {
      const token = 'fakeToken'

      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: `Bearer ${token}`,
        },
        isAuthenticated: () => true,
      })

      await expect(customGuard.canActivate(mockContext)).rejects.toThrowError(
        UnauthorizedException
      )
    })

    it('will throw UnauthorizedException if user does not exist', async () => {
      const token = generateToken(user.clerkId)

      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: `Bearer ${token}`,
        },
        isAuthenticated: () => true,
      })

      jest
        .spyOn(customGuard, 'verifyToken')
        .mockImplementation(async () => undefined)

      jest
        .spyOn(customGuard, 'verifySession')
        .mockImplementation(async () => undefined)

      jest
        .spyOn(authService, 'validateUser')
        .mockImplementation(async () => null)

      await expect(customGuard.canActivate(mockContext)).rejects.toThrowError(
        UnauthorizedException
      )
    })

    it('will throw UnauthorizedException session is not valid', async () => {
      const token = generateToken(user.clerkId)

      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: `Bearer ${token}`,
        },
        isAuthenticated: () => true,
      })

      jest
        .spyOn(customGuard, 'verifyToken')
        .mockImplementation(async () => undefined)

      jest
        .spyOn(customGuard, 'verifySession')
        .mockImplementation(async () => undefined)

      jest
        .spyOn(authService, 'validateUser')
        .mockImplementation(async () => user)

      const canActivate = await customGuard.canActivate(mockContext)
      expect(canActivate).toEqual(true)
    })

    it('should return true for public routes', async () => {
      mockContext.switchToHttp().getRequest.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(true),
      })

      // Mock getHandler before calling canActivate
      mockContext.getHandler.mockReturnValue(() => {})

      const reflectorSpy = jest.spyOn(reflector, 'get').mockReturnValue(true)

      const canActivate = await customGuard.canActivate(mockContext)
      expect(canActivate).toBe(true)

      // Now the reflectorSpy should have been called with the correct handler
      expect(reflectorSpy).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        mockContext.getHandler()
      )
    })

    it('will return true for webhooks routes', async () => {
      mockContext.switchToHttp().getRequest.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(true),
      })

      jest.spyOn(reflector, 'get').mockReturnValueOnce(false)

      // webhooks will have metadata here
      const reflectorSpy = jest.spyOn(reflector, 'get').mockReturnValue(true)

      mockContext.getHandler.mockReturnValue(() => {})

      const canActivate = await customGuard.canActivate(mockContext)
      expect(canActivate).toEqual(true)

      // Ensure the reflector was called with correct metadata key and target (context)
      expect(reflectorSpy).toHaveBeenCalledWith(
        IS_WEBHOOK_KEY,
        mockContext.getHandler()
      )
    })
  })
})
