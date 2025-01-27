import { LineItemType } from '@alltypes/LineItem'

import T from '@locales/locale'

import { isValidUrl } from '@utils/validate-encode'

import Price from '@ui/Elements/Price'
import SuperImage from '@ui/Elements/SuperImage'

export default function OrderSummaryProductsSection({
  line_items,
}: {
  line_items: LineItemType[]
}) {
  return (
    <ul>
      {line_items
        ?.filter(function (line_item: LineItemType) {
          return line_item.type !== 'PRODUCT' ? false : true
        })
        .map((item: LineItemType) => (
          <li key={item.id} className="flex space-x-4 py-2">
            <SuperImage
              src={
                item.image_url && isValidUrl(item.image_url)
                  ? item.image_url
                  : '/images/placeholders/product.png'
              }
              width={160}
              className="h-20 w-20 flex-none rounded border border-grey-light bg-grey-lighter object-cover object-center"
            />
            <div>
              <h3>{item.name}</h3>
              <p className="mb-1.5 text-sm text-grey">
                {T('checkout.order_summary.quantity')} : {item.quantity}
              </p>
              <span className="font-semibold">
                <Price price={item.amount_total / 100} />
              </span>
            </div>
          </li>
        ))}
    </ul>
  )
}
