import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const CurrentOrganization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.currentOrganization
  }
)
