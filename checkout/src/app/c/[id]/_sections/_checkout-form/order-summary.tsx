import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

import { LineItemType } from '@alltypes/LineItem'
import { PaymentGroupJoinedType } from '@alltypes/PaymentGroup'

import T from '@locales/locale'

import getBrandSettings from '@utils/settings'

import Price from '@ui/Elements/Price'
import SuperImage from '@ui/Elements/SuperImage'

import OrderSummaryProductsSection from './_order-summary/products'
import OrderSummaryTotalsSection from './_order-summary/totals'

export default function OrderSummarySection({
  data,
  paymentGroup,
  highlightColor,
}: {
  data: any
  paymentGroup: PaymentGroupJoinedType
  highlightColor: string
}) {
  const cashback = paymentGroup.id
    ? paymentGroup.discount_type == 'AMOUNT'
      ? paymentGroup.current_discount_level.value
      : ((data.amount_total / 100) *
          paymentGroup.current_discount_level.value) /
        100
    : 0

  return (
    <section className="mb-6 rounded-xl bg-white px-8 py-4 font-semibold drop-shadow-md">
      <Disclosure as="div">
        {({ open }) => (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <SuperImage
                  src={
                    getBrandSettings(data).logo_url
                      ? getBrandSettings(data).logo_url
                      : '/images/logos/full.svg'
                  }
                  width={94}
                  height={30}
                  style={{ height: '30px', width: 'auto' }}
                  className="hidden md:block"
                />

                {!open && (
                  <div className="flex items-center divide-x divide-grey-lighter">
                    <p className="pr-2">
                      <span className="font-medium text-grey">
                        {T('checkout.order_summary.article')} :{' '}
                      </span>
                      {data.line_items.reduce(
                        (acc: any, item: LineItemType) =>
                          item.type === 'PRODUCT' ? acc + item.quantity : acc,
                        0
                      )}
                    </p>
                    <p className="pl-2">
                      <span className="font-medium text-grey">
                        {T('checkout.order_summary.total')} :{' '}
                      </span>
                      <Price price={data.amount_total / 100} />
                    </p>
                  </div>
                )}
              </div>

              <Disclosure.Button
                style={highlightColor ? { color: '#' + highlightColor } : {}}
                className={
                  'text-sm underline ' +
                  (!highlightColor && 'text-primary hover:text-secondary')
                }
              >
                {open ? (
                  <span>
                    {T('common.action.see_less')}
                    <ChevronUpIcon className="ml-1 inline-flex h-4 w-4" />
                  </span>
                ) : (
                  <span>
                    {T('common.action.see_more')}
                    <ChevronDownIcon className="ml-1 inline-flex h-4 w-4" />
                  </span>
                )}
              </Disclosure.Button>
            </div>

            <Disclosure.Panel>
              <div className="mt-4 justify-between gap-14 border-t border-grey-light py-4 font-medium leading-5 md:flex">
                <OrderSummaryProductsSection line_items={data.line_items} />
                <OrderSummaryTotalsSection
                  line_items={data.line_items}
                  total={data.amount_total / 100}
                  cashback={cashback}
                  cashbackSentDate={paymentGroup.expires_at}
                />
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </section>
  )
}
