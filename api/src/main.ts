import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { getQueueToken } from '@nestjs/bull'
import { ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as expressBasicAuth from 'express-basic-auth'
import * as fs from 'fs'
import {
  WINSTON_MODULE_NEST_PROVIDER,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston'
import * as path from 'path'
import * as winston from 'winston'

import { AppModule } from './app.module'
import { bullQueues } from './common/constants/queues.constants'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { CustomersModule } from './customers/customers.module'
import { RequestScopedLoggerService } from './logger/logger.service'
import { OrdersModule } from './orders/orders.module'
import { PaymentGroupsModule } from './payment-groups/payment-groups.module'
import { TransformInterceptor } from './transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
    bodyParser: true,
    cors: true,
  })
  // Read the description from description.txt
  const description = fs.readFileSync(
    path.join(process.cwd(), 'src/collection-description.md'),
    'utf8'
  )

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('kohortPay')
    .setDescription(description)
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer'
    ) // Bearer Auth Security Scheme
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basic') // Basic Auth Security Scheme
    .addExtension('x-speakeasy-name-override', [
      // this is a custom extension to override the method name in sdk generation
      {
        operationId: '^findOne.*',
        methodNameOverride: 'findOne',
      },
      {
        operationId: '^findAll.*',
        methodNameOverride: 'findAll',
      },
      {
        operationId: '^cancel.*',
        methodNameOverride: 'cancel',
      },
      {
        operationId: '^expire.*',
        methodNameOverride: 'expire',
      },
      {
        operationId: '^delete.*',
        methodNameOverride: 'delete',
      },
      {
        operationId: '^create.*',
        methodNameOverride: 'create',
      },
    ])
    .addServer('https://api.kohortpay.com', 'Production')
    .build()
  const document = SwaggerModule.createDocument(app, config, {
    include: [PaymentGroupsModule, CustomersModule, OrdersModule], // Include only public modules in Swagger
  })
  SwaggerModule.setup('api', app, document)

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')
  const queues = bullQueues.map((queue) => app.get(getQueueToken(queue.name)))
  createBullBoard({
    queues: queues.map((queue) => new BullAdapter(queue)),
    serverAdapter,
  })

  app.use(
    '/admin/queues',
    expressBasicAuth({
      authorizer: (user: string, password: string) =>
        user == process.env.BULL_UI_USER &&
        password == process.env.BULL_UI_PASSWORD,
      challenge: true,
    }),
    serverAdapter.getRouter()
  )

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalInterceptors(new TransformInterceptor())
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  app.useGlobalFilters(
    new AllExceptionsFilter(
      httpAdapterHost,
      new RequestScopedLoggerService(
        winston.createLogger({
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                nestWinstonModuleUtilities.format.nestLike('KohortAPI', {
                  colors: process.env.NODE_ENV === 'dev' ? true : false,
                  prettyPrint: process.env.NODE_ENV === 'dev' ? true : false,
                })
              ),
            }),
          ],
        })
      )
    )
  )

  await app.listen(process.env.PORT || 3000)
}
bootstrap()
