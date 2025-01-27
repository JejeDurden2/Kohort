import { STRIPE_CLIENT_TOKEN } from '@golevelup/nestjs-stripe'
import { createMock } from '@golevelup/ts-jest'
import { HttpService } from '@nestjs/axios'
import { getQueueToken } from '@nestjs/bull'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization, Webhook } from '@prisma/client'
import { Queue } from 'bull'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'
import { EndpointOut, Svix, WebhookRequiredHeaders } from 'svix'

import { createOrganization } from '../../test/factories/organization.factory'
import { createWebhook } from '../../test/factories/webhook.factory'
import { paginated } from '../../test/utils/paginated-format'
import { KohortPayEvent } from '../common/enums/kohortpay-events.enum'
import { QueueName } from '../common/enums/queue-names.enum'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { extendedPrismaClient } from '../prisma.extension'
import { WebhooksService } from './webhooks.service'

describe('WebhooksService', () => {
  let service: WebhooksService
  let webhook: Webhook
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let svix: DeepMockProxy<Svix>
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: STRIPE_CLIENT_TOKEN, useValue: {} },
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: getQueueToken(QueueName.WEBHOOK),
          useValue: createMock<Queue>(),
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
      ],
    }).compile()

    service = module.get<WebhooksService>(WebhooksService)
    svix = new Svix('test') as DeepMockProxy<Svix>
    service['svix'] = svix
    prisma = module.get('PrismaService')
    webhook = createWebhook()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a webhook', async () => {
      const result = webhook
      jest.spyOn(svix.endpoint, 'create').mockResolvedValue({
        id: 'endpointId',
      } as EndpointOut)
      prisma.client.webhook.create.mockResolvedValue(result)
      expect(
        await service.create(organization, true, {
          url: 'https://example.com',
          events: [KohortPayEvent.PAYMENT_INTENT_SUCCEEDED],
        })
      ).toEqual(result)
    })
  })

  describe('findOneByOrganizationIdAndLivemode', () => {
    it('should find a webhook', async () => {
      const result = webhook
      prisma.client.webhook.findUnique.mockResolvedValue(result)
      expect(
        await service.findOneByOrganizationIdAndLivemode(
          webhook.id,
          webhook.organizationId,
          true
        )
      ).toEqual(result)
    })
  })

  describe('findByOrganizationIdAndLivemode', () => {
    it('should find all webhooks', async () => {
      const result = paginated([webhook])
      prisma.client.$transaction.mockResolvedValueOnce([
        result.data,
        result.count,
      ])
      expect(
        await service.findByOrganizationIdAndLivemode(
          webhook.organizationId,
          true
        )
      ).toMatchObject(result)
    })
  })

  describe('update', () => {
    it('should update a webhook', async () => {
      const result = webhook
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(webhook)
      jest.spyOn(svix.endpoint, 'patch').mockResolvedValue({
        id: 'endpointId',
      } as EndpointOut)
      prisma.client.webhook.update.mockResolvedValue(result)

      expect(
        await service.update(
          webhook.id,
          organization,
          true,
          {
            url: 'https://example.com',
            events: [KohortPayEvent.PAYMENT_INTENT_SUCCEEDED],
          },
          'userId'
        )
      ).toEqual(result)
    })
  })

  describe('getSecret', () => {
    it('should return the webhook secret', async () => {
      const result = { key: 'secret' }
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(webhook)

      jest.spyOn(svix.endpoint, 'getSecret').mockResolvedValue(result)
      expect(await service.getSecret(webhook.id, organization, true)).toEqual(
        result
      )
    })
  })

  describe('rollSecret', () => {
    it('should return a new webhook secret', async () => {
      const result = { key: 'secret' }
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(webhook)

      jest.spyOn(svix.endpoint, 'rotateSecret').mockResolvedValue(void 0)
      jest.spyOn(svix.endpoint, 'getSecret').mockResolvedValue(result)
      expect(await service.rollSecret(webhook.id, organization, true)).toEqual(
        result
      )
    })
  })

  describe('verifyClerkRequest', () => {
    it('should throw BadRequestException if secretKey is missing', () => {
      expect(() =>
        service.verifyClerkRequest(
          new Headers() as unknown as WebhookRequiredHeaders,
          'payload',
          undefined
        )
      ).toThrow(BadRequestException)
    })

    it('should throw BadRequestException if payload is missing', () => {
      expect(() =>
        service.verifyClerkRequest(
          new Headers() as unknown as WebhookRequiredHeaders,
          undefined,
          'secretKey'
        )
      ).toThrow(BadRequestException)
    })

    it('should throw BadRequestException if payload and headers are not valid', async () => {
      expect(() =>
        service.verifyClerkRequest(
          new Headers() as unknown as WebhookRequiredHeaders,
          'payload',
          'secretKey'
        )
      ).toThrow(BadRequestException)
    })
  })

  describe('hardRemove', () => {
    it('should delete a webhook', async () => {
      const result = webhook
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockResolvedValue(webhook)
      jest.spyOn(svix.endpoint, 'delete').mockResolvedValue(void 0)

      prisma.client.webhook.delete.mockResolvedValue(result)
      expect(await service.hardRemove(webhook.id, organization, true)).toEqual(
        result
      )
    })
  })
})
