'use client'

import {
  ChatBubbleLeftEllipsisIcon,
  CheckIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline'
import { getCookie } from 'cookies-next'
import Image from 'next/image'
import { useState } from 'react'

import T from '@locales/locale'

import { formatLink } from '@utils/link'

import Button from '@ui/Elements/Button'
import Link from '@ui/Elements/Link'
import Modal from '@ui/Elements/Modal'
import SectionHeading from '@ui/Elements/SectionHeading'

const WhatsappIcon = () => {
  return (
    <Image
      src="/images/icons/whatsapp.svg"
      alt="whatsapp"
      width={20}
      height={20}
      className="mr-4 h-10 w-10 rounded-full bg-brand-900 p-2 font-bold text-white"
    />
  )
}
export interface InviteSectionProps {
  referralCode: string
  maxCashback: string
  minPurchaseValue: string
  brandUrl: string
  highlightColor: string
}

export default function InviteSection({
  referralCode,
  maxCashback,
  minPurchaseValue,
  brandUrl,
  highlightColor,
}: InviteSectionProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const cookieLocale = getCookie('NEXT_LOCALE') || 'fr_FR'

  const myUrl =
    process.env.NEXT_PUBLIC_KOHORTPAY_MY_URL +
    '/' +
    cookieLocale +
    '/pg/' +
    referralCode

  const predefinedText = `${T(
    'checkout.success_page.share_referral_code.greeting'
  )} ${formatLink(brandUrl)} ${T(
    'checkout.success_page.share_referral_code.with_kohortpay'
  )} ${maxCashback}.

${T('checkout.success_page.share_referral_code.how_it_works')}

1. ${T('checkout.success_page.share_referral_code.step1')} ${referralCode} ${T(
    'checkout.success_page.share_referral_code.step1_cont'
  )} ${formatLink(brandUrl)} ${T(
    'checkout.success_page.share_referral_code.step1_cont_suffix'
  )}
2. ${T('checkout.success_page.share_referral_code.step2')}
3. ${T('checkout.success_page.share_referral_code.step3')} ${maxCashback} ${T(
    'checkout.success_page.share_referral_code.step3_cont'
  )}

${T('checkout.success_page.share_referral_code.learn_more')} ${T(
    'checkout.success_page.share_referral_code.learn_more_link'
  )} (${myUrl + '?inviteMode=true'})

${T(
  'checkout.success_page.share_referral_code.no_account_needed'
)} ${minPurchaseValue}. ${T(
    'checkout.success_page.share_referral_code.mutual_benefit'
  )} ${T('checkout.success_page.share_referral_code.see_more')}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(predefinedText)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSMS = () => {
    const smsLink = `sms:?&body=${encodeURIComponent(predefinedText)}`
    window.open(smsLink, '_blank')
  }

  const handleEmail = () => {
    const emailLink = `mailto:?body=${encodeURIComponent(predefinedText)}`
    window.open(emailLink, '_blank')
  }

  const handleWhatsApp = () => {
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
      predefinedText
    )}`
    window.open(whatsappLink, '_blank')
  }
  const options = [
    {
      name: T('checkout.success_page.share_referral_code.copy_button'),
      icon: Square2StackIcon,
      handler: handleCopy,
    },
    { name: 'SMS', icon: ChatBubbleLeftEllipsisIcon, handler: handleSMS },
    { name: 'E-mail', icon: EnvelopeIcon, handler: handleEmail },
    { name: 'WhatsApp', icon: WhatsappIcon, handler: handleWhatsApp },
  ]
  const predefinedMessage = (
    <>
      {T('checkout.success_page.share_referral_code.greeting')}{' '}
      <Link className="font-bold" href={brandUrl}>
        {formatLink(brandUrl)}
      </Link>{' '}
      {T('checkout.success_page.share_referral_code.with_kohortpay')}{' '}
      {maxCashback}.
      <br />
      <br />
      {T('checkout.success_page.share_referral_code.how_it_works')}
      <br />
      <br />
      1. {T('checkout.success_page.share_referral_code.step1')}{' '}
      <span className="font-bold">{referralCode}</span>{' '}
      {T('checkout.success_page.share_referral_code.step1_cont')}
      {formatLink(brandUrl)}{' '}
      {T('checkout.success_page.share_referral_code.step1_cont_suffix')}
      <br />
      2. {T('checkout.success_page.share_referral_code.step2')}
      <br />
      3. {T('checkout.success_page.share_referral_code.step3')} {maxCashback}{' '}
      {T('checkout.success_page.share_referral_code.step3_cont')}
      <br />
      <br />
      {T('checkout.success_page.share_referral_code.learn_more')}{' '}
      {T('checkout.success_page.share_referral_code.learn_more_link')}(
      <Link href={myUrl + '?inviteMode=true'}>
        {myUrl + '?inviteMode=true'}
      </Link>
      )
      <br />
      <br />
      {T('checkout.success_page.share_referral_code.no_account_needed')}{' '}
      {minPurchaseValue}
      {'. '}
      {T('checkout.success_page.share_referral_code.mutual_benefit')}
      <br />
      <br />
      {T('checkout.success_page.share_referral_code.see_more')}
    </>
  )

  return (
    <>
      <Button highlightColor={highlightColor} onClick={() => setOpen(true)}>
        {T('checkout.success_page.share_referral_code.invite_button')}
      </Button>
      <Modal open={open} setOpen={setOpen}>
        <div>
          <SectionHeading title="checkout.success_page.share_referral_code.title" />
          <div className="bg-white">
            <p className="text-brand-700 mb-4 max-h-72 overflow-scroll rounded-lg border border-grey-light bg-grey-lighter p-3 text-sm">
              {predefinedMessage}
            </p>

            <div className="divide-y divide-grey-light">
              {options.map((option) => (
                <div
                  key={option.name}
                  className="flex cursor-pointer items-center p-2 hover:bg-gray-100"
                  onClick={option.handler}
                >
                  {isCopied &&
                  option.name ===
                    T(
                      'checkout.success_page.share_referral_code.copy_button'
                    ) ? (
                    <CheckIcon className="mr-4 h-10 w-10 rounded-full bg-black p-2 text-white" />
                  ) : (
                    <option.icon className="mr-4 h-10 w-10 rounded-full bg-black p-2 text-white" />
                  )}

                  <span className="flex-grow font-semibold">{option.name}</span>
                  <ChevronRightIcon className="h-6 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
