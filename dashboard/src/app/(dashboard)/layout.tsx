'use client'

import { UserButton } from '@clerk/nextjs'
import { Dialog, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { Fragment, useEffect, useState } from 'react'

import Dropdown from '@ui/Dropdown'
import Sidebar from '@ui/Sidebar'
import Toggle from '@ui/Toggle'

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => (sidebarOpen ? setSidebarOpen(false) : void null), [pathname])

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <Sidebar />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <Sidebar />
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div
            className="h-6 w-px bg-gray-900/10 lg:hidden"
            aria-hidden="true"
          />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Recherche
              </label>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm"
                placeholder="Recherche..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Toggle />

              {/* Separator */}
              <div className="h-6 w-px bg-gray-900/10" aria-hidden="true" />

              <Dropdown />

              {/* Profile dropdown */}
              <UserButton
                afterSignOutUrl="/"
                userProfileUrl="/user-profile"
                userProfileMode="navigation"
                appearance={{
                  elements: {
                    card: 'shadow-lg py-2 w-80 ring-1 ring-black ring-opacity-5 rounded-md',
                    userButtonPopoverActionButtonIconBox: 'flex-none',
                    userButtonPopoverActions:
                      'border-t border-gray-200 pt-2 mt-2',
                    userButtonPopoverActionButton: 'py-1',
                    userButtonPopoverActionButtonText:
                      'text-sm text-gray-500 tracking-normal',
                  },
                }}
              />
            </div>
          </div>
        </div>

        <main>{children}</main>
      </div>
      <Script src="/scripts/helpscout-beacon.js" strategy="lazyOnload" />
    </div>
  )
}
