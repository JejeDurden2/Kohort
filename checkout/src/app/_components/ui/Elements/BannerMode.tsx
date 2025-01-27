import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import T from '@locales/locale'

export default function BannerMode({ livemode }: { livemode: boolean }) {
  if (livemode) {
    return <></>
  }

  return (
    <p className="bg-primary p-4 py-3 text-center text-sm text-white">
      <ExclamationTriangleIcon className="mr-2 inline-block h-5 w-5" />
      {T('common.message.test_mode')}
    </p>
  )
}
