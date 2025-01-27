import { faker } from '@faker-js/faker'
import { Ambassador } from '@prisma/client'

import { CreateAmbassadorDto } from '../../src/ambassador/dto/create-ambassador.dto'
import {
  AMBASSADOR_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'

export const createAmbassador = (params?: CreateAmbassadorDto) => {
  const idsService = new IdsService()

  const defaultValues: Ambassador = {
    id: idsService.createId(AMBASSADOR_DATABASE_PREFIX),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    referralCode: faker.string.alphanumeric(8).toUpperCase(),
    metadata: null,
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    deletedAt: null,
  }

  return { ...defaultValues, ...params }
}
