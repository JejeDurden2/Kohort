import { Menu, Transition } from '@headlessui/react'
import { LifebuoyIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'

const userHelpLinks = [
  { name: "Centre d'aide", href: 'https://support.kohortpay.com' },
  { name: 'Documentation produit', href: 'https://docs.kohortpay.com' },
  { name: 'Roadmap publique', href: 'https://roadmap.kohortpay.com' },
  { name: 'Site web Kohort', href: 'https://www.kohortpay.com' },
]

const developerHelpLinks = [
  { name: 'Documentation API', href: 'https://api-docs.kohortpay.com' },
  { name: 'Page de status', href: 'https://status.kohortpay.com' },
]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function Dropdown() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="-mx-2.5 p-2.5 text-gray-400 hover:text-gray-500">
          <span className="sr-only">Open options</span>
          <LifebuoyIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {userHelpLinks.map((item) => (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <a
                    href={item.href}
                    target="_blank"
                    className={classNames(
                      active ? 'bg-gray-100 text-brand-100' : 'text-gray-500',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {item.name}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
          <div className="py-1">
            {developerHelpLinks.map((item) => (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <a
                    href={item.href}
                    target="_blank"
                    className={classNames(
                      active ? 'bg-gray-100 text-brand-100' : 'text-gray-500',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {item.name}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
