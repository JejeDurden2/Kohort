export type LineItemType = {
  id: string
  name: string
  description: string
  amount_total: number
  quantity: number
  price: number
  image_url: string
  type: 'PRODUCT' | 'DISCOUNT' | 'SHIPPING'
}
