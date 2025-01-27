import { Poppins } from 'next/font/google'

import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: 'Payer avec KohortPay',
  description: 'Payer, parrainer & économiser',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full bg-grey-lighter text-black">
      <body className={'h-full ' + poppins.className}>{children}</body>
    </html>
  )
}
