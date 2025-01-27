import { faker } from '@faker-js/faker'
import { BrandSettings } from '@prisma/client'

import {
  CHECKOUT_SETTINGS_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { IdsService } from '../../src/common/ids/ids.service'

export const createBrandSettings = () => {
  const idsService = new IdsService()
  const brandSettings: BrandSettings = {
    id: idsService.createId(CHECKOUT_SETTINGS_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    livemode: faker.datatype.boolean(),
    logoUrl: faker.image.avatar(),
    backgroundUrl: faker.image.avatar(),
    websiteUrl: faker.internet.url(),
    modalImageUrl: faker.image.avatar(),
    instagramPageUrl: faker.internet.url(),
    postImageUrls: [faker.internet.url(), faker.internet.url()],
    aiPromptShareMessage: faker.lorem.sentence(),
    color: faker.internet.color(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: faker.string.uuid(),
    updatedBy: faker.string.uuid(),
  }

  return brandSettings
}
