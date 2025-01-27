import { format } from 'date-fns'

import { LineItemType } from '@alltypes/LineItem'

import T from '@locales/locale'

import Price from '@ui/Elements/Price'

export default function OrderSummaryTotalsSection({
  line_items,
  total,
  cashback,
  cashbackSentDate,
}: {
  line_items: LineItemType[]
  total: number
  cashback: number
  cashbackSentDate: string
}) {
  return (
    <ul role="list" className="mt-6 py-2 leading-6 md:mt-0 md:w-64">
      <li className="flex justify-between">
        <span className="text-grey">
          {T('checkout.order_summary.articles')} :
        </span>
        <span className="font-semibold">
          {line_items.reduce(
            (acc: any, item: LineItemType) =>
              item.type === 'PRODUCT' ? acc + item.quantity : acc,
            0
          )}
        </span>
      </li>
      <li className="flex justify-between">
        <span className="text-grey">
          {T('checkout.order_summary.subtotal')} :
        </span>
        <span className="font-semibold">
          <Price
            price={
              line_items
                .filter((item: LineItemType) => item.type === 'PRODUCT')
                .reduce((acc, item) => acc + item.amount_total, 0) / 100
            }
          />
        </span>
      </li>
      {line_items
        ?.filter(function (line_item: LineItemType) {
          return line_item.type === 'PRODUCT' ? false : true
        })
        .map((item: LineItemType) => (
          <li key={item.id} className="flex justify-between">
            <span className="text-grey">
              {T('checkout.order_summary.' + item.type.toLowerCase())} :
            </span>
            <span className="font-semibold">
              <Price price={item.amount_total / 100} />
            </span>
          </li>
        ))}
      <li className="mt-2 border-t border-grey-light pt-2"></li>
      <li className="flex justify-between">
        <span className="text-grey">{T('checkout.order_summary.total')} :</span>
        <span className="font-semibold">
          <Price price={total} />
        </span>
      </li>
      {cashback > 0 && (
        <li className="flex justify-between">
          <span className="text-grey">
            {T('checkout.payment_group.joined.unlocked_cashback')} :
          </span>
          <span className="font-semibold">
            <Price price={cashback} />*
          </span>
        </li>
      )}
      {cashback > 0 && (
        <li className="mt-2 text-right text-xs font-normal text-grey">
          *{T('checkout.payment_group.joined.unlocked_cashback_at')} :{' '}
          {format(new Date(cashbackSentDate), 'dd/MM/yyyy')}
        </li>
      )}
    </ul>
  )
}
