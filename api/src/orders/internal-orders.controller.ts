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

import { IsMasterKeyProtected } from '../common/decorators/is-master-key-protected.decorator'
import { QueryDto } from '../common/dto/query.dto'
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto'
import { OrdersService } from './orders.service'

@ApiExcludeController()
@Controller('i/orders')
export class InternalOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  @IsMasterKeyProtected()
  async findOne(@Param('id') id: string, @Query() query: QueryDto) {
    let paymentIntent = await this.ordersService.findOne(id, query)
    if (!paymentIntent) {
      paymentIntent = await this.ordersService.findOneByClientReferenceId(
        id,
        query
      )
      if (!paymentIntent) {
        throw new NotFoundException(`Payment intent with id ${id} not found.`)
      }
    }
    return paymentIntent
  }

  @Post(':id/withdrawal')
  @IsMasterKeyProtected()
  async createWithdrawal(
    @Param('id') id: string,
    @Body() createWithdrawalDto: CreateWithdrawalDto
  ) {
    return await this.ordersService.withdrawCashback(id, createWithdrawalDto)
  }
}
