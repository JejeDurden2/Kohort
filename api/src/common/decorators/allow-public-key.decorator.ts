import { SetMetadata } from '@nestjs/common'

export const ALLOW_PUBLIC_KEY = 'allowPublicKey'
export const AllowPublicKey = () => SetMetadata(ALLOW_PUBLIC_KEY, true)
