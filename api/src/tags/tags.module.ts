import { Module } from '@nestjs/common'
import { CustomPrismaModule } from 'nestjs-prisma'

import { IdsModule } from '../common/ids/ids.module'
import { extendedPrismaClient } from '../prisma.extension'
import { TagsController } from './tags.controller'
import { TagsService } from './tags.service'

@Module({
  imports: [
    IdsModule,
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient
      },
    }),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
