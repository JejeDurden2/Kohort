import {
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

import T from '@locales/locale'

export default function ErrorAlert({ messageType }: any) {
  let icon = <XCircleIcon className="h-6 w-6 text-orange" />
  let title = 'common.errors.general.title'
  let description = 'common.errors.general.description'

  switch (messageType) {
    case 'EMAIL_REQUIRED':
      icon = <ExclamationTriangleIcon className="h-6 w-6 text-orange" />
      title = 'checkout.payment_group.join.error.email_required.title'
      description =
        'checkout.payment_group.join.error.email_required.description'
      break
    case 'NOT_FOUND':
      icon = <ExclamationTriangleIcon className="h-6 w-6 text-orange" />
      title = 'checkout.payment_group.join.error.not_found.title'
      description = 'checkout.payment_group.join.error.not_found.description'
      break
    case 'COMPLETED_EXPIRED_CANCELED':
      icon = <ClockIcon className="h-6 w-6 text-orange" />
      title = 'checkout.payment_group.join.error.completed.title'
      description = 'checkout.payment_group.join.error.completed.description'
      break
    case 'MAX_PARTICIPANTS_REACHED':
      icon = <ExclamationTriangleIcon className="h-6 w-6 text-orange" />
      title = 'checkout.payment_group.join.error.max_participants.title'
      description =
        'checkout.payment_group.join.error.max_participants.description'
      break
    case 'EMAIL_ALREADY_USED':
      icon = <ExclamationTriangleIcon className="h-6 w-6 text-orange" />
      title = 'checkout.payment_group.join.error.email_already_used.title'
      description =
        'checkout.payment_group.join.error.email_already_used.description'
      break
    case 'PAYMENT_FAILED':
      icon = <ExclamationTriangleIcon className="h-6 w-6 text-orange" />
      title = 'checkout.payment.error.title'
      description = 'checkout.payment.error.message'
      break
    case 'GENERAL':
      icon = <XCircleIcon className="h-6 w-6 text-orange" />
      title = 'common.errors.general.title'
      description = 'common.errors.general.description'
      break
  }

  return (
    <div className="mt-3 rounded-md border border-orange border-opacity-30 bg-orange bg-opacity-10 p-4">
      <h3 className="mb-1 flex gap-2 font-medium text-orange">
        {' '}
        {icon} {T(title)}
      </h3>
      <p className="text-sm">{T(description)}</p>
    </div>
  )
}
