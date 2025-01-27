import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col px-4 py-12 lg:flex-none lg:px-20 lg:py-16 xl:px-40 xl:py-20">
        <div className="mx-auto w-full max-w-md lg:w-108">{children}</div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/assets/auth-bkg.png"
          width="1908"
          height="1433"
          alt=""
        />
      </div>
    </div>
  )
}
