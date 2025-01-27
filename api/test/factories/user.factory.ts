import { faker } from '@faker-js/faker'
import { Locale, User } from '@prisma/client'

import { USER_DATABASE_PREFIX } from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateUserDto } from '../../src/users/dto/create-user.dto'

export const createUser = (params?: CreateUserDto) => {
  const idsService = new IdsService()
  const defaultValues: User = {
    id: idsService.createId(USER_DATABASE_PREFIX),
    clerkId: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    primaryEmailAddress: faker.internet.email(),
    primaryPhoneNumber: faker.phone.number(),
    imageUrl: faker.image.avatar(),
    locale: Locale.fr_FR,
    lastSignInAt: new Date(),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
    deletedAt: null,
  }
  return { ...defaultValues, ...params }
}
