import {
  ArrowLongRightIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'

import { requestApi } from '@api/server'

import ErrorAlert from '@ui/Elements/ErrorAlert'
import SectionHeading from '@ui/Elements/SectionHeading'

export default function JoinSection({
  data,
  register,
  getValues,
  setValue,
  setPaymentGroupObject,
  highlightColor,
}: any) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [valueCode, setValueCode] = useState('')
  const lightenColor = lightenHexColor(highlightColor, 75)

  const [messageType, setMessageType] = useState('')

  const PG_SHARE_CODE_PREFIX = data.livemode ? 'KHTPAY-' : 'KHTPAY-test-'

  const validCode = () => {
    const customer_email = getValues('customer_email') || data.customer_email

    if (isSuccess) {
      setValueCode('')
      setValue('payment_group_share_id', '')
      setIsSuccess(false)
      return
    }
    if (valueCode == '') return

    setIsLoading(true)
    requestApi('post', '/i/payment-groups/' + valueCode + '/validate', {
      customerEmail: customer_email || 'email@sample.com',
    })
      .then((res) => {
        if (res.error) {
          setMessageType(res.error.code)
          setIsLoading(false)
          return
        }
        setMessageType('')
        setIsSuccess(true)
        setValue('payment_group_share_id', res.share_id)
        setPaymentGroupObject(res)
        setIsLoading(false)
      })
      .catch(() => {
        setMessageType('error')
        setIsLoading(false)
      })
  }

  return (
    <div className="relative rounded-tl-xl rounded-tr-xl">
      <div className="absolute h-52 w-full rounded-tl-xl rounded-tr-xl border-b-2 border-beige-strong bg-beige bg-kohortpay bg-cover bg-center bg-no-repeat"></div>
      <div className="z-50 mx-auto max-w-md px-4 pt-10 md:px-0">
        <SectionHeading
          title="checkout.payment_group.join.title"
          description="checkout.payment_group.join.description"
        />
        <div className="rounded-xl bg-white px-4 py-5 drop-shadow-md md:px-8 md:py-6">
          <div className="flex gap-2 md:gap-6">
            <div className="flex flex-1 rounded-md border border-grey-light focus-within:border-brand-100/50 focus-within:ring focus-within:ring-brand-100/25">
              <span className="flex select-none items-center pl-4 font-medium ">
                {PG_SHARE_CODE_PREFIX}
              </span>
              <input
                type="text"
                disabled={isLoading || isSuccess}
                onChange={(e) => {
                  setValueCode(
                    PG_SHARE_CODE_PREFIX +
                      e.currentTarget.value
                        .replace(PG_SHARE_CODE_PREFIX || '', '')
                        .toUpperCase()
                  )
                }}
                value={valueCode
                  .replace(PG_SHARE_CODE_PREFIX || '', '')
                  .toUpperCase()}
                name="code"
                id="code"
                className="block w-20 flex-1 rounded-md border-0 py-2.5 pl-1 font-medium placeholder:text-black placeholder:text-opacity-30 focus:ring-0 sm:leading-6"
                placeholder="12345678"
              />
            </div>
            <button
              type="button"
              disabled={isLoading}
              style={{
                color: highlightColor && '#' + highlightColor,
                borderColor: lightenColor && '#' + lightenColor,
              }}
              onClick={validCode}
              className={
                'inline-flex items-center justify-center gap-x-1.5 rounded-md border-2 border-primary bg-grey-pink px-3 py-2.5 font-semibold shadow-sm focus:outline-none md:px-7' +
                (isLoading ? ' cursor-wait opacity-75' : '') +
                (!highlightColor && ' text-primary ')
              }
            >
              {!isSuccess && T('common.action.validate')}
              {!isLoading && isSuccess && T('common.action.leave')}

              {isLoading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              {!isLoading && !isSuccess && (
                <ArrowLongRightIcon className="h-4 w-4" />
              )}
              {!isLoading && isSuccess && <XMarkIcon className="h-4 w-4" />}
            </button>
          </div>
          <input type="hidden" {...register('payment_group_share_id')} />

          {messageType && <ErrorAlert messageType={messageType} />}
        </div>
      </div>
    </div>
  )
}
