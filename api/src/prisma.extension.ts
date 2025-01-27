import { Prisma, PrismaClient } from '@prisma/client'
import * as Queue from 'bull'
import { Redis } from 'ioredis'

import {
  GET_STREAM_FEEDS,
  NODE_ENV_PROD,
  NODE_ENV_STAGING,
} from './common/constants/miscellaneous.constants'
import { QueueName } from './common/enums/queue-names.enum'

const RedisConfig = [NODE_ENV_PROD, NODE_ENV_STAGING].includes(
  process.env.NODE_ENV as string
)
  ? {
      tls: {
        rejectUnauthorized: false, // Remove this as soon as we stop using Heroku Redis
        requestCert: true,
      },
    }
  : {}
const client = new Redis(process.env.REDIS_URL as string, RedisConfig)
const subscriber = new Redis(process.env.REDIS_URL as string, RedisConfig)

const opts = {
  createClient: function (type, redisOpts) {
    switch (type) {
      case 'client':
        return client
      case 'subscriber':
        return subscriber
      case 'bclient':
        return new Redis(process.env.REDIS_URL as string, redisOpts)
      default:
        throw new Error(`Unexpected connection type: ${type}`)
    }
  },
}
const streamQueue = new Queue(QueueName.GETSTREAM, opts)

export const extendedPrismaClient =
  new PrismaClient<Prisma.PrismaClientOptions>().$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args)

          // Getstream.io setup and logic
          if (
            result &&
            typeof result === 'object' &&
            ['create', 'update', 'delete'].includes(operation) &&
            GET_STREAM_FEEDS.includes(model)
          ) {
            const payload = {
              model,
              operation,
              time: new Date().toISOString(),
              result,
              args,
            }
            await streamQueue.add(QueueName.GETSTREAM, payload)
          }
          return result
        },
      },
    },
  })

export type extendedPrismaClient = typeof extendedPrismaClient
