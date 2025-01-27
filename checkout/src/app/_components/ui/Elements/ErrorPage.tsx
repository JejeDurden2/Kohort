'use client'

import {
  BookOpenIcon,
  ChevronRightIcon,
  LifebuoyIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline'

import T from '@locales/locale'

import Link from '@ui/Elements/Link'
import Logo from '@ui/Elements/Logo'

const links = [
  {
    name: 'common.errors.links.help_center.title',
    href: 'https://help.kohortpay.com/fr',
    description: 'common.errors.links.help_center.description',
    icon: LifebuoyIcon,
  },
  {
    name: 'common.errors.links.documentation.title',
    href: 'https://docs.kohortpay.com',
    description: 'common.errors.links.documentation.description',
    icon: BookOpenIcon,
  },
  {
    name: 'common.errors.links.api_reference.title',
    href: 'https://api-docs.kohortpay.com',
    description: 'common.errors.links.api_reference.description',
    icon: QueueListIcon,
  },
]

export default function ErrorPage({
  title = 'common.errors.general.title',
  description = 'common.errors.general.description',
}: {
  title?: string
  description?: string
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:pb-20 lg:px-8">
      <Logo format="icon" className="mx-auto" width={60} height={60} />
      <div className="mx-auto mt-12 max-w-2xl space-y-1 text-center sm:mt-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {T(title)}
        </h1>
        <p className="text-base text-gray-600 sm:mt-4 sm:text-lg sm:leading-8">
          {T(description)}
        </p>
      </div>
      <div className="m-20 mx-auto flow-root max-w-lg">
        <ul role="list" className="-mt-6 divide-y divide-gray-900/5">
          {links.map((link, linkIdx) => (
            <li key={linkIdx} className="relative flex gap-x-6 py-6">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-gray-900/10">
                <link.icon className="h-6 w-6 text-brand-100" />
              </div>
              <div className="flex-auto">
                <h3 className="text-sm font-semibold leading-5">
                  <Link href={link.href}>{T(link.name)}</Link>
                </h3>
                <p className="text-sm leading-6 text-gray-600">
                  {T(link.description)}
                </p>
              </div>
              <div className="flex-none self-center">
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
