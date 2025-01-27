import { Process, Processor } from '@nestjs/bull'
import { Organization } from '@prisma/client'
import { Job } from 'bull'

import { QueueName } from '../common/enums/queue-names.enum'
import { OrganizationsService } from './organizations.service'

@Processor(QueueName.SETUP_ORGANIZATION)
export class OrganizationsSetupConsumer {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Process(QueueName.SETUP_ORGANIZATION)
  async setupOrganization(organizationJob: Job<Organization>) {
    return await this.organizationsService.afterCreateSetup(
      organizationJob.data
    )
  }
}
