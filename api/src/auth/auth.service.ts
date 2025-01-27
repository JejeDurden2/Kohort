import { BadRequestException, Injectable } from '@nestjs/common'
import { ApiKey, ApiKeyType } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { Request } from 'express'

import { ApiKeysService } from '../api-keys/api-keys.service'
import {
  DATABASE_PREFIX_SEPARATOR,
  LIVEMODE_DATABASE_PREFIX,
  PUBLIC_KEY_DATABASE_PREFIX,
  SECRET_KEY_DATABASE_PREFIX,
  TESTMODE_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private apiKeysService: ApiKeysService
  ) {}

  async validateUser(clerkId: string) {
    return await this.usersService.findByClerkId(clerkId)
  }

  getBearerToken(req: Request) {
    const authHeader = req.headers['authorization'] as string

    if (!authHeader) {
      return null
    }
    const [type, token] = authHeader.split(' ')
    if (type === 'Basic') {
      return null
    } else if (type !== 'Bearer' && type !== 'Basic') {
      throw new BadRequestException(
        `Authentication type \'Bearer\' or \'Basic\'required. Found \'${type}\'`
      )
    }
    return token
  }

  getBasicToken(req: Request) {
    const authHeader = req.headers['authorization'] as string

    if (!authHeader) {
      return null
    }
    const [type, token] = authHeader.split(' ')
    if (type === 'Bearer') {
      return null
    } else if (type !== 'Basic' && type !== 'Bearer') {
      throw new BadRequestException(
        `Authentication type \'Bearer\' or \'Basic\'required. Found \'${type}\'`
      )
    }
    return Buffer.from(token, 'base64').toString().replace(':foo', '') // remove the foo password used to pass the validation from BasicStrategy
  }

  async checkSecretKeys(key: string, secretKeys: ApiKey[]) {
    for (const secretKey of secretKeys) {
      const match = await bcrypt.compare(key, secretKey.hashedKey)
      if (match) {
        return secretKey
      }
    }
    return null
  }

  async validateApiKey(key: string, allowPublicKey: boolean = false) {
    const splittedKey = key.split(DATABASE_PREFIX_SEPARATOR)

    if (splittedKey.length !== 3) {
      return null
    }

    if (
      ![SECRET_KEY_DATABASE_PREFIX, PUBLIC_KEY_DATABASE_PREFIX].includes(
        splittedKey[0]
      )
    ) {
      return null
    }

    if (
      ![LIVEMODE_DATABASE_PREFIX, TESTMODE_DATABASE_PREFIX].includes(
        splittedKey[1]
      )
    ) {
      return null
    }

    const organization = await this.apiKeysService.getOrganizationFromKey(key)
    if (!organization) {
      return null
    }

    const apiKey = await this.apiKeysService.findByKey(key)
    if (apiKey) {
      if (!allowPublicKey && apiKey.type === ApiKeyType.PUBLIC) {
        return null
      }

      if (apiKey.endDate && apiKey.endDate < new Date()) {
        return null
      }

      return apiKey
    }

    const secretKeys =
      await this.apiKeysService.findLiveSecretKeysByOrganizationId(
        organization.id
      )
    return await this.checkSecretKeys(key, secretKeys)
  }
}
