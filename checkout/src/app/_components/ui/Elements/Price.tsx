import { getCookie } from 'cookies-next'

import T from '@locales/locale'

export default function Price({
  price,
  isFreeMode = true,
}: {
  price: number
  isFreeMode?: boolean
}) {
  const cookieLocale = getCookie('NEXT_LOCALE') || 'fr_FR'

  if (price === 0 && isFreeMode) {
    return <>{T('checkout.order_summary.free')}</>
  }

  return (
    <>
      {price.toLocaleString(cookieLocale.replace('_', '-'), {
        style: 'currency',
        currency: 'EUR',
      })}
    </>
  )
}
