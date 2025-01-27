import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { QueueName } from '../common/enums/queue-names.enum'
import { SendWhatsappMessageDto } from './dto/send-whatsapp-message.dto'
import { WhatsappService } from './whatsapp.service'

@Processor(QueueName.WHATSAPP)
export class WhatsappConsumer {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Process(QueueName.WHATSAPP)
  async sendWhatsappMessage(whatsappJob: Job<SendWhatsappMessageDto>) {
    await this.whatsappService.sendTemplateMessage(whatsappJob.data)
  }
}
