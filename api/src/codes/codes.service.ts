import { Injectable, NotFoundException } from '@nestjs/common'

import { AmbassadorService } from '../ambassador/ambassador.service'

@Injectable()
export class CodesService {
  constructor(private readonly ambassadorService: AmbassadorService) {}

  async validate(code: string) {
    const ambassador = await this.ambassadorService.findOneByCode(code)
    if (!ambassador) {
      throw new NotFoundException(
        `Ambassador with referral code ${code} not found.`
      )
    }
    
    return ambassador
  }
}
