import { faker } from '@faker-js/faker'
import { ApiKey, ApiKeyType } from '@prisma/client'
import { uid } from 'uid'

import { CreateApiKeyDto } from '../../src/api-keys/dto/create-api-key.dto'
import {
  API_KEY_DATABASE_PREFIX,
  DATABASE_PREFIX_SEPARATOR,
  ORGANIZATION_DATABASE_PREFIX,
  SECRET_KEY_DATABASE_PREFIX,
  TESTMODE_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { API_KEY_RANDOM_PART_LENGTH } from '../../src/common/constants/encryption'
import { IdsService } from '../../src/common/ids/ids.service'

export const createApiKey = (params?: CreateApiKeyDto) => {
  const idsService = new IdsService()

  const defaultValues: ApiKey = {
    id: idsService.createId(API_KEY_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    type: ApiKeyType.SECRET,
    key: `${SECRET_KEY_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}${TESTMODE_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}${uid(
      API_KEY_RANDOM_PART_LENGTH
    )}`,
    name: faker.word.noun(),
    note: 'null',
    hashedKey: uid(API_KEY_RANDOM_PART_LENGTH),
    livemode: false,
    lastUsedAt: faker.date.past(),
    endDate: faker.date.future(),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
  }
  return { ...defaultValues, ...params }
}
