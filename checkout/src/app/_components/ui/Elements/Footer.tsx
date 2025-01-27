import T from '@locales/locale'

import Link from '@ui/Elements/Link'
import Logo from '@ui/Elements/Logo'

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 text-xs font-medium text-grey">
      <div className="mx-auto max-w-5xl justify-between md:flex md:flex-row-reverse md:px-8">
        <div className="flex items-center justify-center gap-6 pb-4 md:pb-0">
          <Link href={T('checkout.footer.links.help.url')}>
            {T('checkout.footer.links.help.label')}
          </Link>
          <Link href={T('checkout.footer.links.terms.url')}>
            {T('checkout.footer.links.terms.label')}
          </Link>
          <Link href={T('checkout.footer.links.privacy.url')}>
            {T('checkout.footer.links.privacy.label')}
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2">
          {T('checkout.footer.powered_by') + ' '}
          <Logo width={72} height={16} />
        </div>
      </div>
    </div>
  )
}
