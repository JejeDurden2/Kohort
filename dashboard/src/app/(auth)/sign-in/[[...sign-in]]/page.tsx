import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <SignIn
      appearance={{
        elements: {
          card: 'shadow-none p-0 w-full',
          rootBox: 'w-full',
        },
      }}
    />
  )
}
