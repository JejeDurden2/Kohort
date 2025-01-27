import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { CustomPrismaModule } from 'nestjs-prisma'

import { extendedPrismaClient } from '../prisma.extension'
import { HealthController } from './health.controller'

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    ConfigModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
  ],
  providers: [],
  controllers: [HealthController],
})
export class HealthModule {}
