export interface ClerkJWTClaims {
  iss: string
  sub: string
  sid: string
  nbf: number
  exp: number
  iat: number
  azp?: string
}
