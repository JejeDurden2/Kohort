import { Controller, Get, HttpCode } from '@nestjs/common'

import { IsPublic } from './common/decorators/is-public.decorator'

@Controller()
export class AppController {
  @Get()
  @IsPublic()
  @HttpCode(204)
  home() {
    return 'Not Found'
  }

  @Get('favicon.ico')
  @IsPublic()
  @HttpCode(204)
  getFavicon() {
    return 'Not Found'
  }
}
