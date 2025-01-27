import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { Queue } from 'bull'

import { LOCALE_ASSIGNER } from '../common/constants/templates-whatsapp'
import { QueueName } from '../common/enums/queue-names.enum'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { SendWhatsappMessageDto } from './dto/send-whatsapp-message.dto'

@Injectable()
export class WhatsappService {
  private apiUrl: string
  private authToken: string
  private phoneNumberId: string

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: DefaultScopedLoggerService,
    @InjectQueue(QueueName.WHATSAPP) private emailQueue: Queue
  ) {
    this.authToken = this.configService.get('WHATSAPP_TOKEN') || ''
    this.phoneNumberId = this.configService.get('PHONE_NUMBER_ID') || ''
    this.apiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`
  }

  async enqueue(sendWhatsappMessageDto: SendWhatsappMessageDto) {
    const { recipientPhoneNumber, templateName, variables } =
      sendWhatsappMessageDto
    await this.emailQueue.add(QueueName.WHATSAPP, {
      recipientPhoneNumber,
      templateName,
      variables,
    })
  }
  async sendTemplateMessage(sendWhatsappMessageDto: SendWhatsappMessageDto) {
    const { recipientPhoneNumber, templateName, locale, variables } =
      sendWhatsappMessageDto
    if (!LOCALE_ASSIGNER[locale]) {
      this.loggerService.error(
        `Unsupported locale: ${locale}. Please add it to LOCALE_ASSIGNER in ${this.constructor.name}`
      )
    }
    const messageData = {
      messaging_product: 'whatsapp',
      to: recipientPhoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: LOCALE_ASSIGNER[locale] ?? 'fr',
          policy: 'deterministic',
        },
        components: [
          {
            type: 'body',
            parameters: variables.map((variable) => ({
              type: 'text',
              text: variable,
            })),
          },
        ],
      },
    }
    try {
      const response = await axios.post(this.apiUrl, messageData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authToken}`,
        },
      })

      this.loggerService.log(
        `Message sent with ID ${response.data.messages[0].id || ''} to ${recipientPhoneNumber} with template ${templateName}`,
        {
          service: WhatsappService.name,
          function: this.sendTemplateMessage.name,
          templateName: templateName,
          recipientPhoneNumber: recipientPhoneNumber,
          response: response.data,
        }
      )
    } catch (error) {
      this.loggerService.error(
        `Error sending message to ${recipientPhoneNumber} with template ${templateName}`,
        error.stack,
        {
          service: WhatsappService.name,
          function: this.sendTemplateMessage.name,
          templateName: templateName,
          errorMessage: error?.message || 'Unknown error', // Log the error message
          recipientPhoneNumber: recipientPhoneNumber,
          errorData: error?.response?.data || 'No response data',
        }
      )
    }
  }
}
