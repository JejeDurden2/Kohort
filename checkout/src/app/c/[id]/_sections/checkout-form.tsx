import { ArrowPathIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { CheckoutSessionType } from '@alltypes/CheckoutSession'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'
import getBrandSettings from '@utils/settings'
import { encodeStringOrNumber } from '@utils/validate-encode'

import { requestApi } from '@api/server'

import ErrorAlert from '@ui/Elements/ErrorAlert'

import BackSection from './_checkout-form/back'
import CustomerInformationsSection from './_checkout-form/customer-informations'
import HeadingSection from './_checkout-form/heading'
import HowItWorksSection from './_checkout-form/how-it-works'
import JoinSection from './_checkout-form/join'
import OrderSummarySection from './_checkout-form/order-summary'
import SettingsSection from './_checkout-form/settings'
import SuccessPageSection from './_checkout-form/success-page'
import TermsSections from './_checkout-form/terms'

type Inputs = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  payment_group_share_id: string
}

export default function CheckoutFormSection({
  data,
}: {
  data: CheckoutSessionType
}) {
  const [paymentGroupObject, setPaymentGroupObject] = useState<any>({})

  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const stripe = useStripe()
  const elements = useElements()
  const [groupValidationMessage, setGroupValidationMessage] = useState('')

  const {
    register,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer_first_name: data.customer_first_name,
      customer_last_name: data.customer_last_name,
      customer_email: data.customer_email,
      payment_group_share_id: data.payment_group_share_id,
    },
  })
  const currentUrl = window.location.href

  const validateGroupBeforePayment = async (valueCode: string) => {
    const customer_email = getValues('customer_email') || data.customer_email
    if (!customer_email) {
      setGroupValidationMessage('EMAIL_REQUIRED')
      return false
    }
    try {
      const res = await requestApi(
        'post',
        '/i/payment-groups/' + valueCode + '/validate',
        {
          customerEmail: customer_email,
        }
      )
      if (res.error) {
        setGroupValidationMessage(res.error.code)
        return false
      }
      return true
    } catch (error) {
      setGroupValidationMessage('error') // You might want to customize this message
      return false
    } finally {
      setIsLoading(true)
    }
  }

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const valueCode: string = getValues('payment_group_share_id')
    setIsLoading(true)
    const isGroupValid =
      valueCode && valueCode.startsWith('KHTPAY')
        ? await validateGroupBeforePayment(valueCode)
        : true
    if (!isGroupValid) {
      setIsLoading(false)
      return
    } else {
      requestApi(
        'patch',
        '/i/checkout-sessions/' + encodeStringOrNumber(data.id),
        formData
      )
        .then((resp) => {
          if (resp.error) {
            switch (resp.error.code) {
              case 'WRONG_STATUS':
              case 'CUSTOMER_BLOCKED':
              case 'NOT_FOUND':
                setMessage(resp.error.code)
                break
              default:
                setMessage('error')
                break
            }
            setIsLoading(false)
            return
          }
          handleSubmitStripe()
        })
        .catch((error) => {
          setMessage(error.message || '')
          setIsLoading(false)
        })
    }
  }

  const handleSubmitStripe = async () => {
    if (!stripe || !elements) {
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: currentUrl,
      },
    })

    if (error) {
      setMessage(error.message || '')
    } else {
      setIsSuccess(true)
    }

    setIsLoading(false)
  }

  if (isSuccess || data.status == 'COMPLETED') {
    return <SuccessPageSection checkoutSession={data} />
  }

  const highlightColor = getBrandSettings(data).color
  const lightenColor = lightenHexColor(highlightColor || '', 85)
  return (
    <>
      <BackSection url={data.cancel_url} highlightColor={highlightColor} />
      <OrderSummarySection
        data={data}
        paymentGroup={paymentGroupObject}
        highlightColor={highlightColor}
      />
      <section className="rounded-xl bg-white shadow-md">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!paymentGroupObject.id && (
              <JoinSection
                data={data}
                register={register}
                getValues={getValues}
                errors={errors}
                setValue={setValue}
                setPaymentGroupObject={setPaymentGroupObject}
                highlightColor={highlightColor}
              />
            )}
            <div className="mx-auto my-8 max-w-2xl p-4 md:my-0 md:p-12">
              <HeadingSection
                paymentGroup={paymentGroupObject}
                amountTotalWithCents={data.amount_total}
              />
              <div className="border-1 rounded-xl border border-grey-medium p-4 shadow-md md:px-16 md:py-8">
                <SettingsSection
                  mode={data.livemode}
                  organizationId={data.organization_id}
                  amountTotalWithCents={data.amount_total}
                  paymentGroup={paymentGroupObject}
                  highlightColor={highlightColor}
                />
                <CustomerInformationsSection
                  data={data}
                  register={register}
                  errors={errors}
                />
                <PaymentElement />
                {groupValidationMessage && (
                  <ErrorAlert messageType={groupValidationMessage} />
                )}
                {message && <ErrorAlert messageType="PAYMENT_FAILED" />}
                <button
                  type="submit"
                  disabled={isLoading || !stripe || !elements}
                  style={
                    highlightColor
                      ? {
                          backgroundColor: '#' + highlightColor,
                          ...(!highlightColor
                            ? {}
                            : {
                                border: '4px solid #' + lightenColor,
                                borderRadius: '12px',
                              }),
                        }
                      : {}
                  }
                  className={
                    'mt-5 inline-flex w-full items-center justify-center gap-x-1.5 rounded-md p-3 font-medium text-white shadow-sm focus:outline-none ' +
                    (!highlightColor
                      ? ' bg-primary ring-4 ring-primary ring-opacity-20 focus:ring-2 focus:ring-primary focus:ring-offset-2'
                      : ` `) +
                    (isLoading && ' cursor-wait opacity-75')
                  }
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <CreditCardIcon
                      className="-ml-0.5 h-5 w-5"
                      aria-hidden="true"
                    />
                  )}
                  {isLoading
                    ? T('checkout.payment.processing')
                    : T('checkout.payment.pay')}
                </button>
                <TermsSections />
              </div>
            </div>
          </form>
        </div>
        <HowItWorksSection highlightColor={highlightColor} />
      </section>
    </>
  )
}
