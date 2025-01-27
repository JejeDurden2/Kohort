import { SetMetadata } from '@nestjs/common'

export const IS_WEBHOOK_KEY = 'isWebhook'
export const IsWebhook = () => SetMetadata(IS_WEBHOOK_KEY, true)
