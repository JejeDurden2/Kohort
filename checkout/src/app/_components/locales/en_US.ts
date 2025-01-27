export const en_US: any = {
  locale: 'en_US',
  'iban must be an IBAN': 'The IBAN format is not valid',
  common: {
    time: {
      day: 'd',
      hour: 'h',
      minute: 'min',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
    },
    action: {
      back: 'Back',
      close: 'Close',
      see_more: 'See more',
      see_less: 'See less',
      validate: 'Validate',
      validating: 'Validating...',
      leave: 'Leave',
      learn_more: 'Learn more',
    },
    message: {
      test_mode:
        'TEST environment. No payment will be made. Please use the following credit card number (4242 4242 4242 4242) for testing.',
    },
    errors: {
      404: {
        title: 'Ouuups... 😬',
        description: 'Sorry, the page you are looking for is not found.',
      },
      general: {
        title: 'An error has occurred',
        description: 'Our teams have been alerted and will intervene quickly.',
      },
      session_not_found: {
        title: 'Session not found',
        description: 'Please try again to place your order.',
      },
      payment_not_found: {
        title: 'Payment not found',
        description: 'Please try again to withdraw your cashback.',
      },
      session_expired: {
        title: 'Your session has expired',
        description: 'Please try again to place your order.',
      },
      session_completed: {
        title: 'Your session is completed',
        description: 'Your payment has already been successfully made.',
      },
      links: {
        help_center: {
          title: 'Help center',
          description: 'Find solutions to your problems.',
        },
        documentation: {
          title: 'Product documentation',
          description: 'Understand how our solution works.',
        },
        api_reference: {
          title: 'API reference',
          description: 'The complete reference of our APIs.',
        },
      },
    },
  },
  checkout: {
    order_summary: {
      total: 'Total',
      article: 'Art.',
      quantity: 'Qty',
      shipping: 'Shipping fees',
      discount: 'Discount',
      free: 'Free',
      articles: 'Article⸱s',
      subtotal: 'Subtotal',
    },
    customer: {
      fields: {
        first_name: {
          label: 'First name',
          required: 'Please fill in your first name',
        },
        last_name: {
          label: 'Last name',
          required: 'Please fill in your last name',
        },
        email: {
          label: 'E-mail address',
          required: 'Please fill in your e-mail',
          invalid: "The e-mail format isn't valid",
        },
        iban: {
          label: 'IBAN',
          required: 'Please fill in your IBAN',
        },
      },
    },
    payment_group: {
      title: 'Save and make your friends save money',
      new: {
        title: 'I refer',
        description: 'Pay now, then share your code and get cashback',
        deadline: {
          title: 'Referral deadline',
        },
        cashback: {
          title: 'Cashback max.',
        },
        steps: {
          sponsored_friend: 'Referred friend',
          group_of: 'Group of',
          current: 'Currently',
        },
      },
      join: {
        title: 'You have been referred',
        description:
          'Enter the referral code to join the kohort and enjoy cashback!',
        error: {
          general: {
            title: 'An error has occurred',
            description:
              'It seems we have a problem with our servers. Please try again later.',
          },
          email_required: {
            title: 'E-mail required',
            description: 'Please fill in your e-mail above to join the group.',
          },
          not_found: {
            title: 'Code not valid',
            description:
              'This code does not match any group. Please check the code you received.',
          },
          completed: {
            title: 'Group over',
            description:
              'No worry, you can still create your own group by clicking on the block above.',
          },
          max_participants: {
            title: 'Group full',
            description: 'Unfortunately this group is already full.',
          },
          email_already_used: {
            title: 'E-mail already used',
            description: 'You have already join the group with this e-mail.',
          },
        },
      },
      joined: {
        title: 'joined',
        kohort_of: 'Kohort of ',
        congrats: 'Congratulations, already ',
        of_unlocked_cashback: ' of cashback unlocked!',
        unlocked_cashback: 'Cashback unlocked',
        unlocked_cashback_at: 'Cashback sent on ',
        participants: 'Referred guests',
      },
    },
    how_it_works: {
      title: 'How does it work?',
      step_1: {
        title: 'Pay',
        description: 'Pay the full amount of your order now.',
      },
      step_2: {
        title: 'Share',
        description:
          'Creator or referred guest can share the referral code. The more your referral code is used, the more your cashback and that of your referred friends increase.',
      },
      step_3: {
        title: 'Save money',
        description:
          'Enjoy cashback applied to the current purchase. The more people in your group, the higher the discount!',
      },
    },
    payment: {
      pay: 'Pay',
      processing: 'Payment in progress...',
      tos_agreement: 'By confirming the payment, you agree to ',
      iban_agreement: 'By withdrawing your cashback, you agree to ',
      terms: 'the terms of use',
      and: ' and ',
      privacy: 'the privacy policy',
      solution: ' of the KohortPay solution.',
      error: {
        title: 'Your payment has been refused',
        message:
          'Please check the information filled or try again with another credit card.',
      },
    },
    success_page: {
      title: 'Order confirmed',
      description: {
        confirmation:
          'You will be redirected in a few seconds to your order confirmation, otherwise',
        new_tab: 'click here',
        no_confirmation:
          'Your order confirmation has been sent by e-mail, you can close this page',
      },
      group_created: {
        title: 'Kohort created 🔥',
        description: {
          cashback: 'of cashback earned from the',
          friend: '1st friend',
          reffered: 'referred',
          with_code: 'with the code',
        },
      },
      level_description: {
        unlock_last_level_congrats:
          'Congratulations, you have reached the last cashback level. Continue to refer friends so that they can benefit from the same cashback as you.',
        refer: 'Refer',
        friends: 'friend(s)',
        share_code: 'by sharing the code',
        to_unlock: 'to unlock the',
        second_level: 'second level',
        third_level: 'third level',
      },
      group_discount_levels: {
        title: 'REFER TO EARN MORE',
        description:
          'Invite friends during the referral period so that you and your friends can benefit from higher cashback.',
        info1:
          'The referred guests can also invite their friends to your kohort.',
        info2:
          'The cashback will be credited to your credit card at the end of the referral period.',
        currently: 'Currently',
      },
      share_referral_code: {
        title: 'Invite friends to join the kohort',
        greeting: "Hi! 👋 I'm inviting you to my referred purchase on",
        with_kohortpay: 'with KohortPay to enjoy a cashback of up to',
        how_it_works: 'How does it work?',
        step1: 'Copy the code',
        step1_cont: 'go to ',
        step1_cont_suffix: 'and fill your cart.',
        step2:
          'Select KohortPay as your payment method, enter your code, and pay for your order.',
        step3: 'Receive up to',
        step3_cont: 'cashback on your order!',
        learn_more:
          'You can learn more about how it works and the cashback already earned by',
        learn_more_link: 'checking the kohort.',

        no_account_needed:
          'No need to create an additional account, the only condition is to place an order for a minimum of',
        mutual_benefit: 'We both earn cashback!',
        see_more:
          'You can learn more about the conditions and the cashback already earned here.',
        invite_button: 'Invite',
        copy_button: 'Copy the invitation text',
        sms_button: 'SMS',
        email_button: 'Email',
        whatsapp_button: 'WhatsApp',
        how_it_works_intro: 'How does it work?',
      },
    },
    footer: {
      powered_by: 'Powered by',
      links: {
        terms: {
          label: 'Terms',
          url: 'https://en.kohortpay.com/legal/conditions-generales',
        },
        privacy: {
          label: 'Privacy',
          url: 'https://en.kohortpay.com/legal/politique-de-confidentialite-payer',
        },
        help: {
          label: 'Help center',
          url: 'https://help.kohortpay.com/fr',
        },
      },
    },
  },
  withdrawal: {
    cashback: {
      title: 'Withdraw your cashback! 🎉',
      description:
        'Thanks to your efforts, you and your friends benefit from cashback.',
      available: 'Your available cashback',
      success: {
        title: 'Your cashback has been sent! ✅',
        description:
          'You will receive your cashback on your bank account in the next few days.',
        sent: 'Cashback sent amount',
      },
    },
    iban_form: {
      title: 'My bank details',
      description: 'Fill in your bank details to withdraw your cashback.',
      submit: 'Withdraw my available cashback',
      success: {
        info: 'A confirmation email has just been sent to you. Please check your spam folder if you do not find it in your inbox.',
      },
    },
  },
} as const
