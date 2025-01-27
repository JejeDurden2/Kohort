'use client'

import {
  BrandSettingsType,
  CheckoutSessionType,
} from '@alltypes/CheckoutSession'

type PaymentGroupSettingsType = {
  livemode: boolean
  discount_type: 'AMOUNT' | 'PERCENTAGE'
  minutes_duration: number
  discount_levels: {
    value: number
    participants_to_unlock: number
    level: number
  }[]
}

export default function getBrandSettings(
  data: CheckoutSessionType
): BrandSettingsType {
  const mode = data.livemode
  const defaultSettings: BrandSettingsType = {
    livemode: false,
    color: '',
    logo_url: '',
  }
  const brand_settings: BrandSettingsType =
    data.organization.brand_settings.find(
      (brand_settings: BrandSettingsType) => brand_settings.livemode == mode
    ) || defaultSettings
  brand_settings.logo_url = data.organization.image_url
  return brand_settings
}

export function getPaymentGroupSettings(mode: boolean, data: any) {
  const payment_group_settings: PaymentGroupSettingsType =
    data.payment_group_settings.find(
      (payment_group_settings: PaymentGroupSettingsType) =>
        payment_group_settings.livemode == mode
    )

  return payment_group_settings
}
