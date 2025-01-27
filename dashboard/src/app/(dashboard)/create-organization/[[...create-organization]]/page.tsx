import { CreateOrganization } from '@clerk/nextjs'

export default function Page() {
  return (
    <CreateOrganization
      path="/create-organization"
      routing="path"
      appearance={{
        elements: {
          card: 'shadow-none border-none p-0 w-full max-w-xl lg:mx-auto',
          rootBox: 'w-full',
          pageScrollBox: 'px-4 py-6 lg:px-8 lg:py-10',
        },
      }}
    />
  )
}
