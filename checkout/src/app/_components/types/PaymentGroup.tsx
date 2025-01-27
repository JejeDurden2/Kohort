const paymentGroupSample = {
  id: 'pg_ee77ea7005fb40',
  share_id: 'KHTPAY-test-E77EA700',
  livemode: false,
  organization_id: 'org_f126897e1ff91e',
  customer_id: 'cus_3f49a9ea79f3ec',
  customer: {
    id: 'cus_3f49a9ea79f3ec',
    first_name: 'Jérôme',
    last_name: 'Desmares',
  },
  creator_email: 'e2e+frcypressTest@kohortpay.com',
  status: 'COMPLETED',
  metadata: null,
  expires_at: '2024-05-13T12:18:56.427Z',
  mid_expire_at: '2024-05-13T12:18:26.427Z',
  reminder_email_sent: false,
  created_at: '2024-05-13T12:17:56.430Z',
  created_by: 'cus_3f49a9ea79f3ec',
  updated_at: '2024-05-13T12:19:00.033Z',
  updated_by: 'system',
  canceled_at: null,
  completed_at: '2024-05-13T12:19:00.032Z',
  payment_group_settings: {
    id: 'pgset_77ea7005fb404e',
    organization_id: null,
    payment_group_id: 'pg_ee77ea7005fb40',
    livemode: false,
    discount_type: 'PERCENTAGE',
    max_participants: 15,
    minutes_duration: 1,
    min_purchase_value: 3000,
    created_at: '2024-05-13T12:17:56.448Z',
    created_by: 'system',
    updated_at: '2024-05-13T12:17:56.448Z',
    updated_by: 'system',
    discount_levels: [
      {
        id: 'dlev_7ea7005fb404ee',
        payment_group_settings_id: 'pgset_77ea7005fb404e',
        level: 1,
        value: 10,
        participants_to_unlock: 2,
        created_at: '2024-05-13T12:17:56.449Z',
      },
      {
        id: 'dlev_ea7005fb404eed',
        payment_group_settings_id: 'pgset_77ea7005fb404e',
        level: 2,
        value: 15,
        participants_to_unlock: 5,
        created_at: '2024-05-13T12:17:56.449Z',
      },
      {
        id: 'dlev_a7005fb404eed9',
        payment_group_settings_id: 'pgset_77ea7005fb404e',
        level: 3,
        value: 20,
        participants_to_unlock: 10,
        created_at: '2024-05-13T12:17:56.449Z',
      },
    ],
  },
}

const paymentGroupJoinedSample = {
  id: 'pgset_95b7f4e95076d3',
  share_id: 'KHTPAY-test-195B7F4E',
  livemode: false,
  organization_id: null,
  customer_id: 'cus_3f49a9ea79f3ec',
  customer: {
    id: 'cus_3f49a9ea79f3ec',
    first_name: 'Jérôme',
    last_name: 'Desmares',
  },
  creator_email: 'e2e+frcypressTest@kohortpay.com',
  status: 'OPEN',
  metadata: null,
  expires_at: '2024-06-14T06:19:39.253Z',
  mid_expire_at: '2024-05-14T06:19:09.253Z',
  reminder_email_sent: false,
  created_at: '2024-05-14T06:18:39.271Z',
  created_by: 'system',
  updated_at: '2024-05-14T06:18:39.271Z',
  updated_by: 'system',
  canceled_at: null,
  completed_at: null,
  payment_intents: [
    {
      id: 'pi_a0195b7f4e9507',
      stripe_id: 'pi_3PGEgyLELo0TF9yJ0EvyJEpd',
      stripe_client_secret:
        'pi_3PGEgyLELo0TF9yJ0EvyJEpd_secret_dX59hAejvTTwB8r8N65YBagej',
      livemode: false,
      amount: 3000,
      amount_captured: 2700,
      amount_cashback: 300,
      currency: 'EUR',
      customer_id: 'cus_3f49a9ea79f3ec',
      customer_email: 'e2e+frcypressTest@kohortpay.com',
      organization_id: 'org_f126897e1ff91e',
      checkout_session_id: 'cs_965a0195b7f4e9',
      metadata: null,
      status: 'CASHBACK_SENT',
      stripe_risk_level: 'normal',
      risk_level: 'LOW',
      payment_group_id: 'pg_0195b7f4e95076',
      application_fee_amount: null,
      client_reference_id: null,
      created_at: '2024-05-14T06:18:28.813Z',
      created_by: 'system',
      updated_at: '2024-05-14T06:20:02.013Z',
      updated_by: 'system',
      canceled_at: null,
      customer: {
        id: 'cus_3f49a9ea79f3ec',
        email_address: 'e2e+frcypressTest@kohortpay.com',
        first_name: 'Jérôme',
        last_name: 'Desmares',
        phone_number: null,
        livemode: false,
        locale: 'fr_FR',
        is_blocked: false,
        organization_id: 'org_f126897e1ff91e',
        client_reference_id: null,
        address_id: null,
        shipping_address_id: null,
        metadata: null,
        created_at: '2024-04-17T07:13:20.883Z',
        created_by: 'system',
        updated_at: '2024-04-17T07:13:20.883Z',
        blocked_at: null,
        blocked_by: null,
        updated_by: 'system',
        deleted_at: null,
      },
    },
    {
      id: 'pi_076d3d3d686183',
      stripe_id: 'pi_3PGEhBLELo0TF9yJ0cJMMWz8',
      stripe_client_secret:
        'pi_3PGEhBLELo0TF9yJ0cJMMWz8_secret_PSE4XS7eQnv9pfLlAWzRIXsBk',
      livemode: false,
      amount: 8000,
      amount_captured: 7200,
      amount_cashback: 800,
      currency: 'EUR',
      customer_id: 'cus_5896df7e625377',
      customer_email: 'e2e+encypressTest@kohortpay.com',
      organization_id: 'org_f126897e1ff91e',
      checkout_session_id: 'cs_f4e95076d3d3d6',
      metadata: null,
      status: 'CASHBACK_SENT',
      stripe_risk_level: 'normal',
      risk_level: 'HIGH',
      payment_group_id: 'pg_0195b7f4e95076',
      application_fee_amount: null,
      client_reference_id: null,
      created_at: '2024-05-14T06:18:41.753Z',
      created_by: 'system',
      updated_at: '2024-05-14T06:20:02.126Z',
      updated_by: 'system',
      canceled_at: null,
      customer: {
        id: 'cus_5896df7e625377',
        email_address: 'e2e+encypressTest@kohortpay.com',
        first_name: 'Thomas',
        last_name: 'Andrews',
        phone_number: null,
        livemode: false,
        locale: 'en_US',
        is_blocked: false,
        organization_id: 'org_f126897e1ff91e',
        client_reference_id: null,
        address_id: null,
        shipping_address_id: null,
        metadata: null,
        created_at: '2024-04-16T09:12:22.750Z',
        created_by: 'system',
        updated_at: '2024-04-16T09:12:22.750Z',
        blocked_at: null,
        blocked_by: null,
        updated_by: 'system',
        deleted_at: null,
      },
    },
  ],
  payment_group_id: 'pg_0195b7f4e95076',
  discount_type: 'PERCENTAGE',
  max_participants: 15,
  minutes_duration: 1,
  min_purchase_value: 3000,
  discount_levels: [
    {
      id: 'dlev_5b7f4e95076d3d',
      payment_group_settings_id: 'pgset_95b7f4e95076d3',
      level: 1,
      value: 10,
      participants_to_unlock: 2,
      created_at: '2024-05-14T06:18:39.272Z',
    },
    {
      id: 'dlev_b7f4e95076d3d3',
      payment_group_settings_id: 'pgset_95b7f4e95076d3',
      level: 2,
      value: 15,
      participants_to_unlock: 5,
      created_at: '2024-05-14T06:18:39.272Z',
    },
    {
      id: 'dlev_7f4e95076d3d3d',
      payment_group_settings_id: 'pgset_95b7f4e95076d3',
      level: 3,
      value: 20,
      participants_to_unlock: 10,
      created_at: '2024-05-14T06:18:39.272Z',
    },
  ],
  current_discount_level: {
    id: 'dlev_5b7f4e95076d3d',
    payment_group_settings_id: 'pgset_95b7f4e95076d3',
    level: 1,
    value: 10,
    participants_to_unlock: 2,
    created_at: '2024-05-14T06:18:39.272Z',
  },
}

export type PaymentGroupJoinedType = typeof paymentGroupJoinedSample

export type PaymentGroupType = typeof paymentGroupSample
export type PaymentGroupDiscountLevels =
  typeof paymentGroupSample.payment_group_settings.discount_levels
