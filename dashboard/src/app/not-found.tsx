import Link from 'next/link'

export default function Custom404() {
  return (
    <main className="grid min-h-full place-items-center px-6 py-32">
      <div className="text-center">
        <p className="text-base font-semibold text-brand-100">404</p>
        <h1 className="font-bold tracking-tight text-gray-900 text-5xl mt-4">
          Ouuups ... 😬
        </h1>
        <p className="leading-7 text-gray-500 text-base mt-6">
          Désolé mais la page que vous recherchez semble introuvable.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            className="rounded-md bg-brand-100 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
            href="/"
          >
            Retour au dashboard
          </Link>
          <Link
            className="text-sm font-semibold text-gray-900"
            target="_blank"
            rel="noreferrer"
            href="https://docs.kohortpay.com"
          >
            Consulter la documentation <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
