export const BILL_RELATIONS = ['organization']

export const CUSTOMER_RELATIONS = [
  'organization',
  'checkoutSessions',
  'address',
]

export const TRANSACTION_EMAIL_RELATIONS = ['organization']

export const CHECKOUT_SESSION_RELATIONS = [
  'organization',
  'customer',
  'lineItems',
  'paymentIntent',
  'paymentGroup',
  'organization.brandSettings',
  'organization.paymentGroupSettings',
]

export const ORDER_RELATIONS = [
  'organization',
  'customer',
  'paymentGroup',
  'organization.brandSettings',
  'organization.paymentGroupSettings',
]

export const CHECKOUT_SETTINGS_RELATIONS = ['organization']

export const BRAND_SETTINGS_RELATIONS = ['organization', 'tags']

export const ORGANIZATION_RELATIONS = [
  'address',
  'brandSettings',
  'brandSettings.tags',
  'paymentGroupSettings',
  'paymentGroupSettings.discountLevels',
  'members',
  'members.user',
]

export const PAYMENT_INTENT_RELATIONS = [
  'organization',
  'organization.brandSettings',
  'customer',
  'checkoutSession',
  'checkoutSession.lineItems',
  'paymentGroup',
  'paymentGroup.paymentGroupSettings',
]

export const PAYMENT_GROUP_RELATIONS = [
  'orders',
  'organization',
  'organization.brandSettings',
  'customer',
  'paymentIntents',
  'paymentGroupSettings',
  'paymentGroupSettings.discountLevels',
]

export const PAYMENT_GROUP_SETTINGS_RELATIONS = [
  'organization',
  'discountLevels',
  'paymentGroup',
]

export const WEBHOOK_RELATIONS = ['organization']

export const AMBASSADOR_RELATIONS = [
  'organizations',
  'organizations.brandSettings',
  'orders',
]
