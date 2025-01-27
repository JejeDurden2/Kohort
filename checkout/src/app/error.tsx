'use client'

import { Poppins } from 'next/font/google'

import ErrorPage from '@ui/Elements/ErrorPage'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function Custom404() {
  return (
    <div className={'h-full bg-white text-brand-900 ' + poppins.className}>
      <ErrorPage />
    </div>
  )
}
