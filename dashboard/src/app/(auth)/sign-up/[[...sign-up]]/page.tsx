import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <SignUp
      appearance={{
        elements: {
          card: 'shadow-none p-0 w-full',
          rootBox: 'w-full',
        },
      }}
    />
  )
}
