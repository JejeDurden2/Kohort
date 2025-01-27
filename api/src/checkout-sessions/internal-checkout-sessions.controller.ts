import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'

import { IsMasterKeyProtected } from '../common/decorators/is-master-key-protected.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { CheckoutSessionsService } from './checkout-sessions.service'
import { UpdateCheckoutSessionDto } from './dto/update-checkout-session.dto'

@ApiExcludeController()
@Controller('i/checkout-sessions')
export class InternalCheckoutSessionsController {
  constructor(
    private readonly checkoutSessionsService: CheckoutSessionsService
  ) {}

  @Get(':id')
  @IsMasterKeyProtected()
  async findOne(@Param('id') id: string, @Query() query: QueryDto) {
    const checkoutSession = await this.checkoutSessionsService.findOne(
      id,
      query
    )
    if (!checkoutSession) {
      throw new NotFoundException(`Checkout session with id ${id} not found.`)
    }
    return checkoutSession
  }

  @Patch(':id')
  @IsMasterKeyProtected()
  async update(
    @Param('id') id: string,
    @Body() updateCheckoutSessionDto: UpdateCheckoutSessionDto
  ) {
    let checkoutSession = await this.checkoutSessionsService.update(
      id,
      updateCheckoutSessionDto
    )
    // update checkout session is called right before the payment is sent to Stripe.
    // We need to validate the checkout session to avoid fraud or bad states.
    // We also need to calculate and send application fees amount to Stripe.
    checkoutSession = await this.checkoutSessionsService.validate(
      checkoutSession.id
    )
    await this.checkoutSessionsService.sendApplicationFeesAmount(
      checkoutSession.id
    )

    return checkoutSession
  }
}
