import { Controller, Get } from '@nestjs/common'

import { IsPublic } from '../common/decorators/is-public.decorator'
import { getTemplateName } from '../common/utils/find-whatsapp-template-name'
import { formatPhoneNumber } from '../common/utils/format-phone-number'
import { WhatsappService } from './whatsapp.service'

// not exist in Whatsapp Module just for testing purposes
@IsPublic()
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}
  @Get('testing')
  sendOpenApiFile() {
    return this.whatsappService.sendTemplateMessage({
      recipientPhoneNumber: formatPhoneNumber('33751367846'),
      templateName: getTemplateName('intro', true),
      locale: 'en_US',
      variables: ['KHTPAY-DEMO', 'Nike.com', '40 €'],
    })
  }
}
