export const WHATSAPP_TEMPLATES = {
  production: {
    intro: {
      name: 'cashback_offer_intro',
      variablesNumbers: 3,
    },
    forward: {
      name: 'forward_referral_code',
      variablesNumbers: 4,
    },
    reminder: {
      name: 'reminder_intro',
      variablesNumbers: 2,
    },
    ambassador: {
      name: 'ambassador_onboarding',
      variablesNumbers: 4,
    },
  },
  staging: {
    intro: {
      name: 'staging_cashback_offer_intro',
      variablesNumbers: 3,
    },
    forward: {
      name: 'staging_forward_referral_code',
      variablesNumbers: 4,
    },
    reminder: {
      name: 'staging_reminder_intro',
      variablesNumbers: 2,
    },
    ambassador: {
      name: 'staging_ambassador_onboarding',
      variablesNumbers: 4,
    },
  },
}
export const LEVELS = {
  en_US: {
    '1': 'first',
    '2': 'second',
    '3': 'third',
  },
  fr_FR: {
    '1': 'premier',
    '2': 'deuxième',
    '3': 'troisième',
  },
}

export const LOCALE_ASSIGNER = {
  fr_FR: 'fr',
  en_US: 'en',
}
