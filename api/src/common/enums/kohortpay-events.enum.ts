export enum KohortPayEvent {
  ORDER_CASHBACK_AVAILABLE = 'order.cashback_available',
  ORDER_CASHBACK_SENT = 'order.cashback_sent',
  ORDER_CREATED = 'order.created',
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_CASHBACK_SENT = 'payment_intent.cashback_sent',
  PAYMENT_INTENT_CASHBACK_AVAILABLE = 'payment_intent.cashback_available',
  PAYMENT_GROUP_CREATED = 'payment_group.created',
  PAYMENT_GROUP_SUCCEEDED = 'payment_group.succeeded',
  PAYMENT_GROUP_EXPIRED = 'payment_group.expired',
  PAYMENT_GROUP_NEW_MEMBER_JOINED = 'payment_group.joined',
  DEPRECATED_PAYMENT_GROUP_NEW_MEMBER_JOINED = 'payment_group.old_joined',
}
