export const SYSTEM = 'system'

export const GET_STREAM_FEEDS = [
  'ApiKey',
  'CheckoutSession',
  'Customer',
  'Organization',
  'PaymentGroup',
  'PaymentGroupSettings',
  'PaymentIntent',
  'User',
  'Webhook',
]

export const OMITTED_FIELDS = [
  'stripeId',
  'stripeClientSecret',
  'application_fee_amount',
] as const

export const WEBHOOKS_RATE_LIMIT = 10

export const HUBSPOT_LYFE_CYCLE_STAGE = 'lead'

export const HUBSPOT_LEAD_STATUS = 'NEW'

export const HUBSPOT_IS_DASHBOARD_USER = true

export const NODE_ENV_DEV = 'dev'
export const NODE_ENV_STAGING = 'staging'
export const NODE_ENV_PROD = 'production'

export const FRAUD_EMAIL_SIMILARITY_THRESHOLD = 2

export const PENNYLANE_BILLING_EMAIL = 'kohort-vt720xj7@customers.pennylane.com'
