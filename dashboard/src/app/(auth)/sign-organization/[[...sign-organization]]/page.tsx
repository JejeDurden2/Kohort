import { CreateOrganization } from '@clerk/nextjs'

export default function Page() {
  return (
    <CreateOrganization
      path="/sign-organization"
      routing="path"
      appearance={{
        elements: {
          card: 'shadow-none border-none p-0 w-full',
          rootBox: 'w-full',
          pageScrollBox: 'p-0',
        },
      }}
    />
  )
}
