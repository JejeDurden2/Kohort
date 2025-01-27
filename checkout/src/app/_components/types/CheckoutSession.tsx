export type CheckoutSessionType = {
  payment_group_share_id: string
  status: string
  share_id: string
  organization_id: string
  amount_total: number
  livemode: boolean
  organization: {
    livemode: boolean
    brand_settings: BrandSettingsType[]
    website_url: string | null
    image_url: string
  }
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  id: string
  cancel_url: string
  success_url: string
  payment_intent: {
    id: string
    payment_group_id: string
  }
}

export type BrandSettingsType = {
  livemode: boolean
  color: string
  logo_url: string
}
