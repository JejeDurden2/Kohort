import { Module } from '@nestjs/common'

import { IdsService } from './ids.service'

@Module({
  imports: [],
  controllers: [],
  providers: [IdsService],
  exports: [IdsService],
})
export class IdsModule {}
