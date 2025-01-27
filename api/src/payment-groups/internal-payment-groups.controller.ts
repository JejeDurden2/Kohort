import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'

import { CodesService } from '../codes/codes.service'
import {
  AMBASSADOR_CODE_PREFIX,
  KOHORT_CODE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { IsMasterKeyProtected } from '../common/decorators/is-master-key-protected.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { HelpPaymentGroupDto } from './dto/help-payment-group.dto'
import { ValidatePaymentGroupDto } from './dto/validate-payment-group.dto'
import { PaymentGroupsService } from './payment-groups.service'

@ApiExcludeController()
@Controller(['i/payment-groups', 'groups'])
export class InternalPaymentGroupsController {
  constructor(
    private readonly paymentGroupsService: PaymentGroupsService,
    private readonly codesService: CodesService
  ) {}

  @Get(':id')
  @IsMasterKeyProtected()
  async findOne(@Param('id') id: string, @Query() query: QueryDto) {
    const paymentGroup = await this.paymentGroupsService.findOne(id, query)
    if (!paymentGroup) {
      throw new NotFoundException(`Payment Group with id ${id} not found.`)
    }
    return paymentGroup
  }

  @Get(':id/participants')
  @IsMasterKeyProtected()
  async participants(@Param('id') id: string, @Query() query: QueryDto) {
    return await this.paymentGroupsService.deprecatedGetParticipants(id, query)
  }

  @Post(':id/validate')
  @IsMasterKeyProtected()
  async validate(
    @Param('id') id: string,
    @Body() validatePaymentGroupDto: ValidatePaymentGroupDto
  ) {
    if (id.startsWith(AMBASSADOR_CODE_PREFIX)) {
      const ambassador = await this.codesService.validate(id)
      if (ambassador) return { current_discount_level: { value: 20 } }
    } else if (id.startsWith(KOHORT_CODE_PREFIX)) {
      return await this.paymentGroupsService.validate(
        id,
        validatePaymentGroupDto
      )
    } else {
      throw new NotFoundException('Code not found.')
    }
  }

  @Post(':id/request-referral-help')
  @IsMasterKeyProtected()
  async requestReferralHelp(
    @Param('id') id: string,
    @Body() helpPaymentGroupDto: HelpPaymentGroupDto
  ) {
    return await this.paymentGroupsService.requestReferralHelp(
      id,
      helpPaymentGroupDto
    )
  }
}
