import { Client } from '@hubspot/api-client'
import {
  FilterOperatorEnum,
  PublicObjectSearchRequest,
} from '@hubspot/api-client/lib/codegen/crm/companies'
import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bull'

import { NODE_ENV_PROD } from '../common/constants/miscellaneous.constants'
import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { CreateHubspotContactDto } from './dto/create-hubspot-contact.dto'

@Injectable()
export class HubspotService {
  constructor(
    private readonly configService: ConfigService,
    private client: Client,
    private readonly loggerService: DefaultScopedLoggerService,
    @InjectQueue(QueueName.HUBSPOT) private hubspotQueue: Queue
  ) {
    if (process.env.NODE_ENV === NODE_ENV_PROD) {
      // This should probably be injected instead of calling getClient() here
      this.configService = new ConfigService()
      this.client = this.getClient()
    }
  }
  getClient() {
    return new Client({
      accessToken: this.configService.get('HUBSPOT_API_KEY', ''),
    })
  }

  async enqueue(createHubspotContactDto: CreateHubspotContactDto) {
    await this.hubspotQueue.add(QueueName.HUBSPOT, createHubspotContactDto)
  }

  async createOrUpdateContact(
    createHubspotContactDto: CreateHubspotContactDto
  ) {
    const searchCriteria: PublicObjectSearchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ' as FilterOperatorEnum,
              value: createHubspotContactDto.email,
            },
          ],
        },
      ],
      sorts: ['email'],
      after: '0',
      properties: ['email', 'id'],
      limit: 1,
    }

    try {
      const contact =
        await this.client.crm.contacts.searchApi.doSearch(searchCriteria)
      if (contact.results.length === 0) {
        return await this.createContact(createHubspotContactDto)
      } else {
        return await this.updateContact(
          contact.results[0].id,
          createHubspotContactDto
        )
      }
    } catch (error) {
      this.loggerService.error(
        'Error searching for Hubspot contact',
        error.stack,
        {
          service: HubspotService.name,
          function: this.createOrUpdateContact.name,
          dto: createHubspotContactDto,
        }
      )
      throw new Error('Error searching for Hubspot contact')
    }
  }

  async createContact(createHubspotContactDto: CreateHubspotContactDto) {
    const properties = this.formatPayload(createHubspotContactDto)

    try {
      return await this.client.crm.contacts.basicApi.create({
        associations: [],
        properties,
      })
    } catch (error) {
      this.loggerService.error('Error creating Hubspot contact', error.trace, {
        service: HubspotService.name,
        function: this.createOrUpdateContact.name,
        dto: createHubspotContactDto,
      })
      throw new Error('Error creating Hubspot contact')
    }
  }

  async updateContact(
    contactId: string,
    createHubspotContactDto: CreateHubspotContactDto
  ) {
    const properties = this.formatPayload(createHubspotContactDto)
    try {
      return await this.client.crm.contacts.basicApi.update(contactId, {
        properties,
      })
    } catch (error) {
      this.loggerService.error('Error updating Hubspot contact', error.stack, {
        service: HubspotService.name,
        function: this.createOrUpdateContact.name,
        dto: createHubspotContactDto,
      })
      throw new Error('Error updating Hubspot contact')
    }
  }

  formatPayload(createHubspotContactDto: CreateHubspotContactDto) {
    const properties: { [key: string]: string } = {}

    for (const key in createHubspotContactDto) {
      const value = createHubspotContactDto[key]
      properties[key] =
        typeof value === 'string' || value === null || value === undefined
          ? value
          : value.toString()
    }

    return properties
  }
}
