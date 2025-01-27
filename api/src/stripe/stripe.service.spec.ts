import { STRIPE_CLIENT_TOKEN } from '@golevelup/nestjs-stripe'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import Stripe from 'stripe'

import { BillsService } from '../bills/bills.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { PaymentIntentsService } from '../payment-intents/payment-intents.service'
import { StripeService } from './stripe.service'

describe('StripeService', () => {
  let service: StripeService
  let stripeClient: DeepMocked<Stripe>

  beforeEach(async () => {
    stripeClient = createMock<Stripe>({
      customers: createMock<Stripe.CustomersResource>(),
      invoices: createMock<Stripe.InvoicesResource>(),
      invoiceItems: createMock<Stripe.InvoiceItemsResource>()
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: 'InjectStripeClient',
          useValue: stripeClient
        },
        {
          provide: STRIPE_CLIENT_TOKEN,
          useValue: stripeClient
        },
        {
          provide: PaymentIntentsService,
          useValue: createMock<PaymentIntentsService>()
        },
        {
          provide: OrganizationsService,
          useValue: createMock<OrganizationsService>()
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>()
        },
        {
          provide: BillsService,
          useValue: createMock<BillsService>()
        },
        {
          provide: DefaultScopedLoggerService,
          useValue: createMock<DefaultScopedLoggerService>()
        }
      ]
    }).compile()

    service = module.get<StripeService>(StripeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
