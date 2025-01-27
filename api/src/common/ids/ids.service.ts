import { Injectable } from '@nestjs/common'
import { uid } from 'uid'

import {
  AMBASSADOR_CODE_PREFIX,
  CHECKOUT_SESSION_DATABASE_PREFIX,
  DATABASE_PREFIX_SEPARATOR,
  KOHORT_CODE_PREFIX,
  LIVEMODE_DATABASE_PREFIX,
  TESTMODE_DATABASE_PREFIX,
} from '../constants/database-prefixes.constants'
import {
  CHECKOUT_SESSION_ID_LENGTH,
  ID_LENGTH,
  PAYMENT_GROUP_SHARE_ID_LENGTH,
} from '../constants/encryption'

@Injectable()
export class IdsService {
  public createId(prefix: string) {
    return `${prefix}${DATABASE_PREFIX_SEPARATOR}${uid(ID_LENGTH)}`
  }

  public createCheckoutId(livemode: boolean) {
    const livemodePrefix = livemode
      ? LIVEMODE_DATABASE_PREFIX
      : TESTMODE_DATABASE_PREFIX
    return `${CHECKOUT_SESSION_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}${livemodePrefix}${DATABASE_PREFIX_SEPARATOR}${uid(
      CHECKOUT_SESSION_ID_LENGTH
    )}`
  }

  public createPaymentGroupShareId(livemode: boolean) {
    const livemodePrefix = livemode ? '' : `${TESTMODE_DATABASE_PREFIX}-`
    return `${KOHORT_CODE_PREFIX}-${livemodePrefix}${uid(
      PAYMENT_GROUP_SHARE_ID_LENGTH
    ).toUpperCase()}`
  }

  public createAmbassadorReferralCode() {
    const REFERRAL_CODE_LENGTH = 8
    return `${AMBASSADOR_CODE_PREFIX}-${uid(REFERRAL_CODE_LENGTH).toUpperCase()}`
  }

  public createBillId(
    lastBillNumber: number,
    organizationId: string,
    livemode: boolean
  ) {
    const cleanId = organizationId.startsWith('org')
      ? organizationId.slice(4)
      : organizationId
    const billNumber = lastBillNumber + 1
    const livemodePrefix = livemode ? '' : `${TESTMODE_DATABASE_PREFIX}-`
    return `${livemodePrefix.toUpperCase()}${cleanId.toUpperCase()}-${billNumber.toString().padStart(8, '0')}`
  }
}
