import { faker } from '@faker-js/faker'
import {
  EmailType,
  FromEmailType,
  Locale,
  TransactionalEmail,
} from '@prisma/client'

import {
  ORGANIZATION_DATABASE_PREFIX,
  TRANSACTIONAL_EMAIL_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'
import { UpdateTransactionalEmailDto } from '../../src/transactional-emails/dto/update-transactional-email.dto'

export const createTransactionalEmail = (
  params?: UpdateTransactionalEmailDto
) => {
  const idsService = new IdsService()

  const defaultValues: TransactionalEmail = {
    id: idsService.createId(TRANSACTIONAL_EMAIL_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    type: EmailType.NEW_GROUP,
    subject: faker.lorem.sentence(),
    preheaderText: faker.lorem.sentence(),
    locale: Locale.fr_FR,
    fromEmail: FromEmailType.RESEND_FROM_EMAIL_SHARE,
    isInternal: false,
    body: faker.lorem.paragraph(),
    variables: [],
    livemode: false,
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
  }

  return { ...defaultValues, ...params }
}
