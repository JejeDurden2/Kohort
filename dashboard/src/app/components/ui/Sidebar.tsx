import { OrganizationSwitcher } from '@clerk/nextjs'
import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useParams } from 'next/navigation'

const navigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon, current: true },
  { name: 'Clients', href: '/customers', icon: UsersIcon, current: false },
  { name: 'Transactions', href: '#', icon: FolderIcon, current: false },
  { name: 'Campagnes', href: '#', icon: CalendarIcon, current: false },
  { name: 'Produits', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Rapports', href: '#', icon: ChartPieIcon, current: false },
]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar() {
  const params = useParams()
  const mode = params?.mode

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-brand-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <OrganizationSwitcher
          hidePersonal={true}
          organizationProfileUrl="/organization-profile"
          organizationProfileMode="navigation"
          createOrganizationUrl="/create-organization"
          createOrganizationMode="navigation"
          appearance={{
            elements: {
              card: 'pt-4 pb-2',
              organizationSwitcherTrigger: 'text-white pt-3',
              organizationSwitcherTriggerIcon: 'opacity-50',
              organizationSwitcherPopoverActionButton__manageOrganization:
                'mb-4',
              organizationSwitcherPopoverActionButtonIconBox: 'flex-none',
            },
          }}
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto mx-auto">
            <Image
              src="/assets/logo_white.svg"
              width={78}
              height={18}
              alt="Kohort Logo"
            />
          </li>
        </ul>
      </nav>
    </div>
  )
}
