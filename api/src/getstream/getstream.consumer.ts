import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { UR } from 'getstream'

import { QueueName } from '../common/enums/queue-names.enum'
import { GetStreamService } from './getstream.service'

export type GetStreamJobData = {
  model: string
  operation: string
  time: string
  result: UR
  args: UR
}

@Processor(QueueName.GETSTREAM)
export class GetStreamConsumer {
  constructor(private readonly getStreamService: GetStreamService) {}

  @Process(QueueName.GETSTREAM)
  async sendActivity(getStreamJob: Job<GetStreamJobData>) {
    return await this.getStreamService.sendActivity(
      getStreamJob.data.model,
      getStreamJob.data.operation,
      getStreamJob.data.time,
      getStreamJob.data.result,
      getStreamJob.data.args
    )
  }
}
