import { Injectable, NestMiddleware } from '@nestjs/common'
import { Organization } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

import { ApiKeysService } from './api-keys/api-keys.service'
import { AuthService } from './auth/auth.service'
import {
  LIVEMODE_DATABASE_PREFIX,
  TESTMODE_DATABASE_PREFIX,
} from './common/constants/database-prefixes.constants'
import { ApiLogsObject, GetStreamService } from './getstream/getstream.service'
import { RequestScopedLoggerService } from './logger/logger.service'
import { OrganizationsService } from './organizations/organizations.service'

@Injectable()
export class ApiLogsMiddleware implements NestMiddleware {
  constructor(
    private getStreamService: GetStreamService,
    private loggerService: RequestScopedLoggerService,
    private apiKeysService: ApiKeysService,
    private authService: AuthService,
    private organizationsService: OrganizationsService
  ) {}

  async getOrganizationAndLivemodeFromRequest(request: Request) {
    const apiKey =
      this.authService.getBearerToken(request) ||
      this.authService.getBasicToken(request)
    let organization: Organization | null
    let livemode: boolean | undefined

    if (apiKey) {
      const key = await this.apiKeysService.findByKey(apiKey)
      if (key) {
        organization = await this.organizationsService.findOne(
          key.organizationId
        )
        livemode = key.livemode
        if (organization && livemode !== undefined) {
          return {
            livemode,
            organization,
          }
        }
      } else if (request.headers['clerk-organization-id']) {
        const clerkOrgId = request.headers['clerk-organization-id'] as string
        organization = await this.organizationsService.findByClerkId(clerkOrgId)
        livemode = request.headers['mode'] === LIVEMODE_DATABASE_PREFIX
        if (organization && livemode !== undefined) {
          return {
            livemode,
            organization,
          }
        }
      }
    }

    return null
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const orgAndLivemode = await this.getOrganizationAndLivemodeFromRequest(req)
    if (!orgAndLivemode) {
      return next()
    }

    const { method, ip, body, headers, baseUrl } = req
    let responseBody: Record<string, string> = {}
    const organization = orgAndLivemode.organization
    const livemode = orgAndLivemode.livemode
    const originalSend = res.send

    res.send = (body) => {
      if (method === 'GET' && res.statusCode === 200) {
        responseBody = {
          message: 'We do not log data for successful GET requests.',
        }
      } else {
        responseBody = body
      }
      return originalSend.call(res, body)
    }

    res.on('finish', () => {
      // Log data after the response is finished
      const logData: ApiLogsObject = {
        requestBody: body,
        responseBody,
        url: baseUrl,
        headers,
        ip,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      }

      try {
        this.getStreamService.sendApiLogs(
          organization,
          livemode,
          method,
          logData
        )
      } catch (error) {
        this.loggerService.error(
          'Error sending logs to getstream',
          error.stack,
          {
            service: ApiLogsMiddleware.name,
            function: this.use.name,
            object: logData,
          }
        )
      }
    })

    // Set the headers to be used by the context interceptor
    req['x-organization-id'] = organization.id
    req['x-livemode'] = livemode
      ? LIVEMODE_DATABASE_PREFIX
      : TESTMODE_DATABASE_PREFIX

    next()
  }
}
