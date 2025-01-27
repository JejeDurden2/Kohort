import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import * as Joi from 'joi'
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston'
import { CustomPrismaModule } from 'nestjs-prisma'
import * as winston from 'winston'

import { AmbassadorModule } from './ambassador/ambassador.module'
import { ApiKeysModule } from './api-keys/api-keys.module'
import { ApiLogsMiddleware } from './api-logs.middleware'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { BankModule } from './bank/bank.module'
import { BillsModule } from './bills/bills.module'
import { BrandSettingsModule } from './brand-settings/brand-settings.module'
import { CheckoutSessionsModule } from './checkout-sessions/checkout-sessions.module'
import { CustomAuthGuard } from './common/guards/auth.guard'
import { IdsModule } from './common/ids/ids.module'
import { ContextInterceptor } from './context.interceptor'
import { CustomersModule } from './customers/customers.module'
import { EmailsModule } from './email/emails.module'
import { GetStreamModule } from './getstream/getstream.module'
import { HealthModule } from './health/health.module'
import { HubspotModule } from './hubspot/hubspot.module'
import {
  DefaultScopedLoggerService,
  RequestScopedLoggerService,
} from './logger/logger.service'
import { LoggingInterceptor } from './logging.interceptor'
import { OrdersModule } from './orders/orders.module'
import { OrganizationInvitationsModule } from './organizations/organization-invitations/organization-invitations.module'
import { OrganizationMembershipsModule } from './organizations/organization-memberships/organization-memberships.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { PaymentGroupSettingsModule } from './payment-group-settings/payment-group-settings.module'
import { PaymentGroupsModule } from './payment-groups/payment-groups.module'
import { PaymentIntentsModule } from './payment-intents/payment-intents.module'
import { extendedPrismaClient } from './prisma.extension'
import { StaticFilesModule } from './static-files/static-files.module'
import { StripeModule } from './stripe/stripe.module'
import { TagsModule } from './tags/tags.module'
import { TasksModule } from './tasks/tasks.module'
import { TransactionalEmailsModule } from './transactional-emails/transactional-emails.module'
import { UsersModule } from './users/users.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'
import { CodesModule } from './codes/codes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.required(),
        OPENAPI_FILE_SECRET_KEY: Joi.string().required(),
        DATABASE_URL: Joi.required(),
        DATABASE_URL_SSL: Joi.required(),
        WHATSAPP_TOKEN: Joi.required(),
        PHONE_NUMBER_ID: Joi.required(),
        API_BASE_URL: Joi.required(),
        CHECKOUT_APP_URL: Joi.required(),
        MASTER_KEY: Joi.required(),
        CLERK_SECRET_KEY: Joi.required(),
        CLERK_PEM_PUBLIC_KEY: Joi.string().required(),
        CLERK_FRONTEND_API_URL: Joi.string().required(),
        CLERK_WEBHOOK_CREATE_USER_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_UPDATE_USER_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_DELETE_USER_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_CREATE_ORGANIZATION_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_UPDATE_ORGANIZATION_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_DELETE_ORGANIZATION_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_SESSION_CREATED_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_CREATE_INVITATION_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_UPDATE_INVITATION_API_KEY: Joi.string().required(),
        CLERK_WEBHOOK_CREATE_ORGANIZATION_MEMBERSHIP_API_KEY:
          Joi.string().required(),
        CLERK_WEBHOOK_UPDATE_ORGANIZATION_MEMBERSHIP_API_KEY:
          Joi.string().required(),
        CLERK_WEBHOOK_DELETE_ORGANIZATION_MEMBERSHIP_API_KEY:
          Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        BETTERSTACK_CRON_HEARTBEAT: Joi.string().required(),
        RESEND_API_KEY: Joi.string().required(),
        RESEND_FROM_EMAIL: Joi.string().required(),
        RESEND_FROM_NAME: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        STREAM_API_KEY: Joi.string().required(),
        STREAM_API_SECRET: Joi.string().required(),
        BULL_UI_USER: Joi.string().required(),
        BULL_UI_PASSWORD: Joi.string().required(),
        SVIX_SECRET_KEY: Joi.string().required(),
        HUBSPOT_API_KEY: Joi.string().required(),
        SLACK_FRAUD_WEBHOOK_URL: Joi.string().required(),
        SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL: Joi.string().required(),
        REVOLUT_REFRESH_TOKEN: Joi.string().required(),
        REVOLUT_CLIENT_ASSERTION_TOKEN: Joi.string().required(),
        REVOLUT_API_URL: Joi.string().required(),
      }),
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json(),
            winston.format.simple(),
            nestWinstonModuleUtilities.format.nestLike('KohortAPI', {
              colors: process.env.NODE_ENV === 'dev' ? true : false,
              prettyPrint: false,
            })
          ),
        }),
      ],
    }),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis:
          configService.get('NODE_ENV') === 'dev'
            ? configService.get('REDIS_URL')
            : {
                url: configService.get('REDIS_URL'),
                tls: {
                  rejectUnauthorized: false, // Remove this as soon as we stop using Heroku Redis
                  requestCert: true,
                },
              },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    HealthModule,
    OrganizationsModule,
    IdsModule,
    OrdersModule,
    AuthModule,
    UsersModule,
    WebhooksModule,
    OrganizationInvitationsModule,
    OrganizationMembershipsModule,
    CustomersModule,
    StripeModule,
    ApiKeysModule,
    CheckoutSessionsModule,
    PaymentIntentsModule,
    PaymentGroupsModule,
    TasksModule,
    EmailsModule,
    PaymentGroupSettingsModule,
    GetStreamModule,
    BrandSettingsModule,
    HttpModule,
    StaticFilesModule,
    HubspotModule,
    BillsModule,
    WhatsappModule,
    BankModule,
    TransactionalEmailsModule,
    TagsModule,
    AmbassadorModule,
    CodesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    RequestScopedLoggerService,
    DefaultScopedLoggerService,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLogsMiddleware).forRoutes('*')
  }
}
