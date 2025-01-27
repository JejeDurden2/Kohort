import { Customer, LineItem, PaymentIntent } from '@prisma/client'

export type Participant = {
  checkoutSession?: {
    lineItems?: LineItem[] | null
  } | null
  customer?: Customer | null
} & PaymentIntent
