import { faker } from '@faker-js/faker'
import { Webhook } from '@prisma/client'

import {
  ORGANIZATION_DATABASE_PREFIX,
  USER_DATABASE_PREFIX,
  WEBHOOK_DATABASE_PREFIX,
} from '../../src/common/constants/database-prefixes.constants'
import { KohortPayEvent } from '../../src/common/enums/kohortpay-events.enum'
import { IdsService } from '../../src/common/ids/ids.service'
import { CreateWebhookDto } from '../../src/webhooks/dto/create-webhook.dto'

export const createWebhook = (params?: CreateWebhookDto) => {
  const idsService = new IdsService()

  const defaultValues: Webhook = {
    id: idsService.createId(WEBHOOK_DATABASE_PREFIX),
    organizationId: idsService.createId(ORGANIZATION_DATABASE_PREFIX),
    livemode: true,
    metadata: null,
    url: faker.internet.url(),
    description: faker.lorem.sentence(),
    events: [KohortPayEvent.PAYMENT_INTENT_SUCCEEDED],
    isActive: true,
    svixEndpointId: faker.string.uuid(),
    createdAt: faker.date.past(),
    createdBy: idsService.createId(USER_DATABASE_PREFIX),
    updatedAt: new Date(),
    updatedBy: idsService.createId(USER_DATABASE_PREFIX),
  }
  return { ...defaultValues, ...params }
}
