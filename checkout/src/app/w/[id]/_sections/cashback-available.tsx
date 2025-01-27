import T from '@locales/locale'

import Price from '@ui/Elements/Price'
import SectionHeading from '@ui/Elements/SectionHeading'
import CashbackIcon from '@ui/icons/cashback-icon'

export default function CashbackAvailableSection({
  cashback_amount,
  isSuccess,
}: {
  cashback_amount: number
  isSuccess: boolean
}) {
  return (
    <div className="relative rounded-tl-xl rounded-tr-xl">
      <div className="absolute h-52 w-full rounded-tl-xl rounded-tr-xl border-b-2 border-beige-strong bg-beige bg-kohortpay bg-cover bg-center bg-no-repeat"></div>
      <div className="z-50 mx-auto max-w-md px-4 pt-10 md:px-0">
        <SectionHeading
          title={
            isSuccess
              ? 'withdrawal.cashback.success.title'
              : 'withdrawal.cashback.title'
          }
          description={
            isSuccess
              ? 'withdrawal.cashback.success.description'
              : 'withdrawal.cashback.description'
          }
        />
        <div className="mx-auto w-72 rounded-xl bg-white px-4 py-5 text-center drop-shadow-md">
          <p className="text-base font-semibold">
            {isSuccess
              ? T('withdrawal.cashback.success.sent')
              : T('withdrawal.cashback.available')}
          </p>
          <div className="mt-4 flex items-center justify-center gap-x-2.5">
            <div className="h-9 w-9 rounded-full bg-primary bg-opacity-10 p-1.5">
              <CashbackIcon className="h-6 w-6" />
            </div>
            <span className=" text-2xl">
              <Price price={cashback_amount} isFreeMode={false} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
