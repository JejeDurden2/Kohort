import { frFR } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import { Poppins } from 'next/font/google'

import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata = {
  title: 'Kohort Dashboard',
  description: 'A new way to pay, socially.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        variables: {
          colorPrimary: '#ED395E',
          colorText: '#170D2C',
        },
      }}
    >
      <html lang="fr" className="h-full">
        <body className={'h-full ' + poppins.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
