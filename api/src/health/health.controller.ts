import { Controller, Get, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisOptions, Transport } from '@nestjs/microservices'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus'
import { parseURL } from 'ioredis/built/utils'
import { CustomPrismaService } from 'nestjs-prisma'

import { IsPublic } from '../common/decorators/is-public.decorator'
import { extendedPrismaClient } from '../prisma.extension'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private configService: ConfigService,
    private microservice: MicroserviceHealthIndicator
  ) {}

  @Get()
  @IsPublic()
  @ApiOperation({ summary: 'Check API liveness', operationId: 'getLiveness' })
  @ApiResponse({ status: 200, description: 'API is alive' })
  getLiveness(): string {
    return JSON.stringify({ message: 'API is alive' })
  }

  @Get('/ready')
  @IsPublic()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API readiness', operationId: 'getReadiness' })
  @ApiResponse({ status: 200, description: 'API readiness details' })
  complexCheck() {
    const redisOption = parseURL(this.configService.get('REDIS_URL', ''))
    return this.health.check([
      async () =>
        this.http.pingCheck(
          'Basic Check',
          this.configService.get('API_BASE_URL') + '/health'
        ),
      async () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      async () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.991,
        }),
      async () => this.prismaHealth.pingCheck('prisma', this.prisma.client),
      async () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            ...redisOption,
            tls: {
              rejectUnauthorized: false, // Remove this as soon as we stop using Heroku Redis
            },
          },
        }),
    ])
  }
}
