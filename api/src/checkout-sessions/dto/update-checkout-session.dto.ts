import { PartialType } from '@nestjs/mapped-types'

import { CreateCheckoutSessionDto } from './create-checkout-session.dto'

export class UpdateCheckoutSessionDto extends PartialType(
  CreateCheckoutSessionDto
) {}
