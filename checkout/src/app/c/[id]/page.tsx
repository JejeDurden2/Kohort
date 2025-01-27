'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { setCookie } from 'cookies-next'

import { appearance } from '@settings/stripe'

import { encodeStringOrNumber } from '@utils/validate-encode'

import useApi from '@api/useApi'

import BannerMode from '@ui/Elements/BannerMode'
import ErrorPage from '@ui/Elements/ErrorPage'
import Footer from '@ui/Elements/Footer'
import Loading from '@ui/Elements/Loading'
import Logo from '@ui/Elements/Logo'

import CheckoutFormSection from './_sections/checkout-form'

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useApi(
    '/i/checkout-sessions/' +
      encodeStringOrNumber(params.id) +
      '?expand[]=organization.checkout_settings&expand[]=organization.brand_settings&expand[]=line_items&expand[]=payment_intent.payment_group'
  )

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <ErrorPage />
  }

  setCookie('NEXT_LOCALE', data.locale)

  if (data?.error && data?.error?.code === 'Not Found') {
    return (
      <ErrorPage
        title="common.errors.session_not_found.title"
        description="common.errors.session_not_found.description"
      />
    )
  }

  if (
    data.status == 'COMPLETED' &&
    data.payment_intent.payment_group?.expires_at < new Date().toISOString()
  ) {
    return (
      <ErrorPage
        title="common.errors.session_completed.title"
        description="common.errors.session_completed.description"
      />
    )
  }

  if (data.status == 'EXPIRED' || data.expires_at < new Date().toISOString()) {
    return (
      <ErrorPage
        title="common.errors.session_expired.title"
        description="common.errors.session_expired.description"
      />
    )
  }

  const stripePromise = loadStripe(
    (data.livemode
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST) || '',
    {
      locale: data.locale == 'en_US' ? 'en' : 'fr',
    }
  )

  const stripeElementOptions = {
    clientSecret: data.payment_intent.stripe_client_secret,
    appearance,
    fonts: [
      {
        cssSrc: 'https://checkout.kohortpay.com/fonts/poppins/font.css',
      },
    ],
  }

  return (
    <>
      <BannerMode livemode={data.livemode} />
      <main className="relative mx-auto my-12 max-w-3xl md:px-4">
        <Logo className="mx-auto mb-10" />
        <Elements stripe={stripePromise} options={stripeElementOptions}>
          <CheckoutFormSection data={data} />
        </Elements>
      </main>
      <Footer />
    </>
  )
}
