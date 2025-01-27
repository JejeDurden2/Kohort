import T from '@locales/locale'

import Link from '@ui/Elements/Link'

export default function TermsIbanSections() {
  return (
    <p className="mt-4 text-center text-xs text-gray-400">
      {T('checkout.payment.iban_agreement')}
      <Link href={T('checkout.footer.links.terms.url')}>
        {T('checkout.payment.terms')}
      </Link>
      {T('checkout.payment.and')}
      <Link href={T('checkout.footer.links.privacy.url')}>
        {T('checkout.payment.privacy')}
      </Link>
      {T('checkout.payment.solution')}
    </p>
  )
}
