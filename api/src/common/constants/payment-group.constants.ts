// The following are based on business hypothesis and can be changed. However, please carefully consider the impact of changing these values with the product team.

export const MAXIMUM_PARTICIPANTS_PER_PAYMENT_GROUP = 1000
export const MINIMUM_PARTICIPANTS_PER_PAYMENT_GROUP = 2
export const MAXIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES = 90 * 24 * 60 // 90 days
export const DEFAULT_TEST_MODE_PAYMENT_GROUP_DURATION_IN_MINUTES = 10 // 10 minutes
export const MINIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES = 1 // 1 minute
export const MAXIMUM_PAYMENT_GROUP_DURATION_IN_MS = 90 * 24 * 60 * 60 * 1000 // 7 days
export const MINIMUM_PAYMENT_GROUP_DURATION_IN_MS = 60 * 1000 // 1 minute

export const SEVEN_DAYS_IN_MINUTES = 7 * 24 * 60

export const MINIMUM_PURCHASE_VALUE = 0 // no minimum purchase to join a group
export const MAXIMUM_NUMBER_OF_DISCOUNT_LEVELS = 5
