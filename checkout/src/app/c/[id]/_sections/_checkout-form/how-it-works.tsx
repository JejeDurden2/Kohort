import { useState } from 'react'

import T from '@locales/locale'

import lightenHexColor from '@utils/lighten-color'

import Button from '@ui/Elements/Button'
import Modal from '@ui/Elements/Modal'
import SectionHeading from '@ui/Elements/SectionHeading'
import CashbackIcon from '@ui/icons/cashback-icon'
import KohortIcon from '@ui/icons/kohort-icon'
import UserGroupIcon from '@ui/icons/user-group'

export default function HowItWorksSection({
  highlightColor,
}: {
  highlightColor: string
}) {
  const [open, setOpen] = useState(false)
  const lightenColor = lightenHexColor(highlightColor, 92)
  const howItWorks = [
    {
      id: 1,
      title: T('checkout.how_it_works.step_1.title'),
      icon: (
        <KohortIcon
          className="h-[50px] w-[50px] -translate-y-1/4 translate-x-1/4"
          fill={highlightColor?.length > 0 ? '#' + highlightColor : '#C62344'}
        />
      ),
      description: T('checkout.how_it_works.step_1.description'),
    },
    {
      id: 2,
      title: T('checkout.how_it_works.step_2.title'),
      icon: (
        <UserGroupIcon
          className="h-[50px] w-[50px] -translate-y-1/4 translate-x-1/4"
          fill={highlightColor?.length > 0 ? '#' + highlightColor : '#C62344'}
        />
      ),
      description: T('checkout.how_it_works.step_2.description'),
    },
    {
      id: 3,
      title: T('checkout.how_it_works.step_3.title'),
      icon: (
        <CashbackIcon
          className="h-[50px] w-[50px] -translate-y-1/4 translate-x-1/4"
          fill={highlightColor?.length > 0 ? '#' + highlightColor : '#C62344'}
        />
      ),
      description: T('checkout.how_it_works.step_3.description'),
    },
  ]

  return (
    <>
      <div
        className="rounded-bl-xl rounded-br-xl bg-grey-pink py-4 text-center"
        style={{ backgroundColor: lightenColor && '#' + lightenColor }}
      >
        <a
          href="#!"
          onClick={() => setOpen(true)}
          style={{ color: highlightColor && '#' + highlightColor }}
          className={
            'text-sm font-semibold underline ' +
            (!highlightColor && 'text-primary hover:text-secondary')
          }
        >
          {T('checkout.how_it_works.title')}
        </a>
      </div>

      <Modal open={open} setOpen={setOpen}>
        <div className="text-center">
          <SectionHeading title="checkout.how_it_works.title" />
          <div className="grid gap-y-6 pb-4">
            {howItWorks.map((step) => (
              <div key={step.id}>
                <div
                  className="mx-auto h-[55px] w-[55px] rounded-full bg-brand-100 bg-opacity-10 p-1.5"
                  style={{
                    backgroundColor: '#' + lightenColor,
                  }}
                >
                  {step.icon}
                </div>
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        <Button highlightColor={highlightColor} onClick={() => setOpen(false)}>
          OK
        </Button>
      </Modal>
    </>
  )
}
