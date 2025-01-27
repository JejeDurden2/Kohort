import * as jwt from 'jsonwebtoken'

export function generateToken(clerkId: string) {
  return jwt.sign({ sub: clerkId, sid: 'sid-12345' }, 'some-secret')
}
