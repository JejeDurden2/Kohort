import { IsNotEmpty, IsString } from 'class-validator'

export class SendSlackDto {
  @IsNotEmpty()
  @IsString()
  text: string

  @IsNotEmpty()
  @IsString()
  webhook: 'SLACK_FRAUD_WEBHOOK_URL' | 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL'
}
