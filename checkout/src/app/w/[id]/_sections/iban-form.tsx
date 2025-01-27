import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'

import { requestApi } from '@api/server'

import ErrorAlert from '@ui/Elements/ErrorAlert'
import Input from '@ui/Elements/Input'
import SectionHeading from '@ui/Elements/SectionHeading'

import CreateWithdrawalDto from './create.dto'
import TermsIbanSections from './terms'

type Inputs = {
  customer_email: string
  iban: string
}

export default function IbanFormSection({
  isSuccess,
  setIsSuccess,
  customer_email,
  payment_id,
  highlightColor,
}: {
  isSuccess: boolean
  setIsSuccess: any
  customer_email: string
  payment_id: string
  highlightColor: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer_email: customer_email,
      iban: '',
      token: '',
    },
    resolver: classValidatorResolver(CreateWithdrawalDto),
  })

  // Form state variables
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Highlight color
  const lightenColor = lightenHexColor(highlightColor || '', 85)

  const onSubmit: SubmitHandler<Inputs> = async (formData: any) => {
    setIsLoading(true)

    const postData = {
      iban: formData.iban.replace(/\s/g, ''),
      token: new URLSearchParams(window.location.search).get('token'),
    }

    requestApi(
      'post',
      '/i/payment-intents/' + payment_id + '/withdrawal',
      postData
    )
      .then((resp) => {
        if (resp.error) {
          setMessage('GENERAL')
          setIsLoading(false)
          return
        }
        setIsSuccess(true)
      })
      .catch(() => {
        setMessage('GENERAL')
        setIsLoading(false)
      })
  }

  if (isSuccess) {
    return (
      <div className="mx-auto my-8 max-w-2xl p-4 md:my-0 md:p-12">
        <SectionHeading
          title=""
          description="withdrawal.iban_form.success.info"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto my-8 max-w-2xl p-4 md:my-0 md:p-12">
      <SectionHeading
        title="withdrawal.iban_form.title"
        description="withdrawal.iban_form.description"
      />
      <div className="border-1 rounded-xl border border-grey-medium p-4 shadow-md md:px-12 md:py-8">
        <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                name="customer_email"
                type="email"
                autoComplete="email"
                label={T('checkout.customer.fields.email.label')}
                errors={errors}
                register={register}
                isDisabled={true}
              />
            </div>
            <div className="col-span-2">
              <Input
                name="iban"
                type="text"
                autoComplete="iban"
                label={T('checkout.customer.fields.iban.label')}
                errors={errors}
                register={register}
                options={{
                  onChange: (e: any) => {
                    e.target.value = e.target.value
                      .toUpperCase()
                      .replace(/[^\dA-Z]/g, '')
                      .replace(/(.{4})/g, '$1 ')
                      .trim()
                  },
                  required: T('checkout.customer.fields.iban.required'),
                  error: T('checkout.customer.fields.iban.error'),
                }}
              />
            </div>
          </div>
          <div className="my-8">
            {message && <ErrorAlert messageType={message} />}
          </div>

          <button
            type="submit"
            disabled={isLoading}
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
              'inline-flex w-full items-center justify-center gap-x-1.5 rounded-md p-3 font-medium text-white shadow-sm focus:outline-none ' +
              (!highlightColor
                ? ' bg-primary ring-4 ring-primary ring-opacity-20 focus:ring-2 focus:ring-primary focus:ring-offset-2'
                : ` `) +
              (isLoading && ' cursor-wait opacity-75')
            }
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowDownTrayIcon
                className="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            )}
            {T('withdrawal.iban_form.submit')}
          </button>
        </form>
        <TermsIbanSections />
      </div>
    </div>
  )
}
