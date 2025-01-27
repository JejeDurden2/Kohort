import { StripeModule as ExternalStripeModule } from '@golevelup/nestjs-stripe'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsModule } from '../organizations/organizations.module'
import { StripeService } from './stripe.service'

@Module({
  imports: [
    ExternalStripeModule.forRootAsync(ExternalStripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_SECRET_KEY', ''),
      }),
    }),
    forwardRef(() => OrganizationsModule),
  ],
  providers: [StripeService, DefaultScopedLoggerService],
  exports: [StripeService],
})
export class StripeModule {}
