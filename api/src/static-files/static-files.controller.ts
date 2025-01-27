import { Controller, ForbiddenException, Get, Query, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { join } from 'path'

import { IsPublic } from '../common/decorators/is-public.decorator'

@IsPublic()
@Controller('static-files')
export class StaticFilesController {
  constructor(private readonly configService: ConfigService) {}

  @Get('openapi.json')
  sendOpenApiFile(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'openapi.json'))
  }

  @Get('openapi-full.json')
  sendOpenApiFullFile(@Query('secret') secret: string, @Res() res: Response) {
    const expectedSecret = this.configService.get('OPENAPI_FILE_SECRET_KEY') // secret key

    if (secret !== expectedSecret) {
      throw new ForbiddenException('Invalid secret key')
    }

    const filePath = join(process.cwd(), 'openapi-full.json')
    res.sendFile(filePath)
  }
}
