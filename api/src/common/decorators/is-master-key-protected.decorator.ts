import { SetMetadata } from '@nestjs/common'

export const IS_MASTER_KEY_PROTECTED = 'isMasterKeyProtected'
export const IsMasterKeyProtected = () =>
  SetMetadata(IS_MASTER_KEY_PROTECTED, true)
