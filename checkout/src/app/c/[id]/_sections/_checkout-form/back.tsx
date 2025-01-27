import { ArrowLongLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'
import { isValidUrl } from '@utils/validate-encode'

export default function BackSection({
  url,
  highlightColor,
}: {
  url: string
  highlightColor: string
}) {
  if (!url || !isValidUrl(url)) {
    return <></>
  }
  const lightenColor = lightenHexColor(highlightColor, 75)

  return (
    <Link
      href={url}
      className={
        'absolute -top-9 left-2 rounded-md border-2  px-3 py-1 font-medium lg:-left-20 lg:top-0 lg:px-4' +
        (!highlightColor &&
          ' border-primary border-opacity-30 text-primary hover:text-secondary')
      }
      style={
        highlightColor
          ? {
              color: highlightColor && '#' + highlightColor,
              borderColor: lightenColor && '#' + lightenColor,
            }
          : {}
      }
    >
      <ArrowLongLeftIcon className="h-4 w-4 lg:h-6 lg:w-5" />
      <span className="sr-only">{T('common.action.back')}</span>
    </Link>
  )
}
