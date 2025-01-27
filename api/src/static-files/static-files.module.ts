import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { StaticFilesController } from './static-files.controller'

@Module({
  imports: [ConfigModule],
  controllers: [StaticFilesController],
})
export class StaticFilesModule {}
