import { Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { Job } from 'bull'

import { NODE_ENV_PROD } from '../common/constants/miscellaneous.constants'
import { QueueName } from '../common/enums/queue-names.enum'
import { CreateHubspotContactDto } from './dto/create-hubspot-contact.dto'
import { HubspotService } from './hubspot.service'

@Processor(QueueName.HUBSPOT)
export class HubspotConsumer {
  constructor(
    private readonly hubspotService: HubspotService,
    private readonly configService: ConfigService
  ) {}

  @Process(QueueName.HUBSPOT)
  async createOrUpdateContact(hubspotJob: Job<CreateHubspotContactDto>) {
    if (this.configService.get('NODE_ENV', '') === NODE_ENV_PROD) {
      return await this.hubspotService.createOrUpdateContact(hubspotJob.data)
    }
    return 'Not in production, not sending to Hubspot'
  }
}
