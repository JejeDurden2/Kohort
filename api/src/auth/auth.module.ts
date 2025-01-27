import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { ApiKeysModule } from '../api-keys/api-keys.module'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { BasicAuthStrategy } from './basic-auth.strategy'

@Module({
  imports: [UsersModule, ConfigModule, ApiKeysModule, PassportModule],
  providers: [AuthService, BasicAuthStrategy],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
