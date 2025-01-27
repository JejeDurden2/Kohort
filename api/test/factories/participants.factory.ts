import { PaymentIntent } from '@prisma/client'
import { Participant } from 'src/common/types/participant.type'

import { createCheckoutSession } from './checkout-session.factory'
import { createCustomer } from './customer.factory'
import { createLineItem } from './line-items.factory'
import { createPaymentIntent } from './payment-intent.factory'

export const createParticipant = () => {
  const customerDto = createCustomer()
  const checkoutSessionDto = createCheckoutSession()
  const paymentIntentDto: PaymentIntent = createPaymentIntent()

  const participant: Participant = {
    ...paymentIntentDto,
    customer: customerDto,
    checkoutSession: {
      ...checkoutSessionDto,
      lineItems: [createLineItem()],
    },
  }
  return participant
}
