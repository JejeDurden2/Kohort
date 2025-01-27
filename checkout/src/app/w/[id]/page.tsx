'use client'

import { setCookie } from 'cookies-next'
import { useState } from 'react'

import getBrandSettings from '@utils/settings'
import { encodeStringOrNumber } from '@utils/validate-encode'

import useApi from '@api/useApi'

import BannerMode from '@ui/Elements/BannerMode'
import ErrorPage from '@ui/Elements/ErrorPage'
import Footer from '@ui/Elements/Footer'
import Loading from '@ui/Elements/Loading'
import SuperImage from '@ui/Elements/SuperImage'

import CashbackAvailableSection from './_sections/cashback-available'
import IbanFormSection from './_sections/iban-form'

export default function WithdrawPage({ params }: { params: { id: string } }) {
  const [isSuccess, setIsSuccess] = useState(false)
  const { data, isLoading, error } = useApi(
    '/i/payment-intents/' +
      encodeStringOrNumber(params.id) +
      '?expand[]=customer&expand[]=organization.brand_settings'
  )

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <ErrorPage />
  }

  setCookie('NEXT_LOCALE', data.customer.locale)

  if (data?.error) {
    return (
      <ErrorPage
        title="common.errors.payment_not_found.title"
        description="common.errors.payment_not_found.description"
      />
    )
  }

  const success = isSuccess || data.status != 'CASHBACK_AVAILABLE'

  return (
    <>
      <BannerMode livemode={data.livemode} />
      <main className="relative mx-auto my-12 max-w-3xl md:px-4">
        <SuperImage
          src={
            getBrandSettings(data).logo_url
              ? getBrandSettings(data).logo_url
              : '/images/logos/full.svg'
          }
          width={94}
          height={30}
          style={{ height: '80px', width: 'auto' }}
          className="mx-auto mb-10"
        />
        <section className="rounded-xl bg-white shadow-md">
          <CashbackAvailableSection
            cashback_amount={data.amount_cashback / 100}
            isSuccess={success}
          />
          <IbanFormSection
            isSuccess={success}
            setIsSuccess={setIsSuccess}
            customer_email={data.customer_email}
            payment_id={params.id}
            highlightColor={getBrandSettings(data).color}
          />
        </section>
      </main>
      <Footer />
    </>
  )
}
