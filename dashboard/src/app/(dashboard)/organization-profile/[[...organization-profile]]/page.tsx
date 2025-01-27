import { OrganizationProfile } from '@clerk/nextjs'

export default function Page() {
  return (
    <OrganizationProfile
      path="/organization-profile"
      routing="path"
      appearance={{
        elements: {
          rootBox: 'w-full max-w-full',
          pageScrollBox: 'px-4 py-6 lg:px-8 lg:py-10',
          card: 'shadow-none border-none w-full max-w-full h-screen',
          navbar: 'border-gray-200',
          navbarButtons: 'sticky top-24',
        },
      }}
    />
  )
}
