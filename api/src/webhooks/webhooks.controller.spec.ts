import { faker } from '@faker-js/faker/locale/af_ZA'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization, Webhook } from '@prisma/client'
import { EndpointMessageOut, MessageAttemptOut } from 'svix'

import { createOrganization } from '../../test/factories/organization.factory'
import { createWebhook } from '../../test/factories/webhook.factory'
import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { WebhooksController } from './webhooks.controller'
import { WebhooksService } from './webhooks.service'

describe('WebhooksController', () => {
  let controller: WebhooksController
  let service: WebhooksService
  let webhook: Webhook
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: createMock<WebhooksService>(),
        },
      ],
    }).compile()

    controller = module.get<WebhooksController>(WebhooksController)
    service = module.get<WebhooksService>(WebhooksService)
    webhook = createWebhook()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a webhook', async () => {
      const result = webhook
      jest.spyOn(service, 'create').mockResolvedValue(result)

      expect(
        await controller.create(organization, true, {
          url: 'https://example.com',
          events: [KohortPayEvent.PAYMENT_INTENT_SUCCEEDED],
        })
      ).toBe(result)
    })
  })

  describe('findOne', () => {
    it('should return a webhook', async () => {
      const result = webhook
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(result)

      expect(await controller.findOne(webhook.id, organization, true, {})).toBe(
        result
      )
    })
  })

  describe('findAll', () => {
    it('should return all webhooks', async () => {
      const result = { data: [webhook], count: 1 }
      jest
        .spyOn(service, 'findByOrganizationIdAndLivemode')
        .mockResolvedValue(result)

      expect(await controller.findAll(organization, true, {})).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a webhook', async () => {
      const result = webhook
      jest.spyOn(service, 'update').mockResolvedValue(result)

      expect(
        await controller.update(webhook.id, organization, true, {
          url: 'https://example.com',
          events: [KohortPayEvent.PAYMENT_INTENT_SUCCEEDED],
        })
      ).toBe(result)
    })
  })

  describe('getSecret', () => {
    it('should return a webhook secret', async () => {
      const result = { key: 'whsec_123' }
      jest.spyOn(service, 'getSecret').mockResolvedValue(result)

      expect(await controller.getSecret(webhook.id, organization, true)).toBe(
        result
      )
    })
  })

  describe('rollSecret', () => {
    it('should roll a webhook secret', async () => {
      const result = { key: 'whsec_456' }
      jest.spyOn(service, 'rollSecret').mockResolvedValue(result)

      expect(await controller.rollSecret(webhook.id, organization, true)).toBe(
        result
      )
    })
  })

  describe('delete', () => {
    it('should delete a webhook', async () => {
      const result = webhook
      jest.spyOn(service, 'hardRemove').mockResolvedValue(result)

      expect(await controller.delete(webhook.id, organization, true)).toBe(
        result
      )
    })
  })

  describe('retry', () => {
    it('should replay a webhook', async () => {
      jest.spyOn(service, 'retry').mockResolvedValue(void 0)

      expect(
        await controller.retry(webhook.id, 'msgId123', organization, true)
      ).toBe(void 0)
    })
  })

  describe('getStats', () => {
    it('should return webhook stats', async () => {
      const result = { errorRate: 92.3076923076923 }
      jest.spyOn(service, 'getStats').mockResolvedValue(result)

      expect(await controller.getStats(webhook.id, organization, true)).toBe(
        result
      )
    })
  })

  describe('findAllMessages', () => {
    it('should return all webhook messages', async () => {
      const result = [
        {
          id: 'msgId123',
          status: 0,
          timestamp: faker.date.anytime(),
          response: {},
        },
      ] as MessageAttemptOut[]

      jest.spyOn(service, 'findAllMessages').mockResolvedValue(result)

      expect(
        await controller.findAllMessages(
          webhook.id,
          organization,
          true,
          'success'
        )
      ).toBe(result)
    })
  })

  describe('getMessage', () => {
    it('should return a webhook message', async () => {
      const result = {
        id: 'msgId123',
        status: 0,
        timestamp: faker.date.anytime(),
        eventType: 'PAYMENT_INTENT_AUTHORIZED',
        payload: {},
      } as EndpointMessageOut

      jest.spyOn(service, 'findOneMessage').mockResolvedValue(result)

      expect(await controller.getMessage('msgId123', organization)).toBe(result)
    })
  })
})
