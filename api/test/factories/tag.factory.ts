import { faker } from '@faker-js/faker'
import { Tag } from '@prisma/client'

import {
  TAG_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateTagDto } from '../../src/tags/dto/create-tag.dto'

export const createTag = (params?: CreateTagDto) => {
  const idsService = new IdsService()

  const defaultValues: Tag = {
    id: idsService.createId(TAG_DATABASE_PREFIX),
    name: faker.word.noun(),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
  }

  return { ...defaultValues, ...params }
}
