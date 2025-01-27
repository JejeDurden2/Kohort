export const fr_FR: any = {
  locale: 'fr_FR',
  'iban must be an IBAN': "Le format de l'IBAN n'est pas valide",
  common: {
    time: {
      day: 'j',
      hour: 'h',
      minute: 'min',
      hours: 'heures',
      minutes: 'minutes',
      seconds: 'secondes',
    },
    action: {
      back: 'Retour',
      close: 'Fermer',
      see_more: 'Voir plus',
      see_less: 'Voir moins',
      validate: 'Valider',
      validating: 'Validation...',
      leave: 'Quitter',
      learn_more: 'En savoir plus',
    },
    message: {
      test_mode:
        'Environnement de TEST. Aucun paiement ne sera effectué. Veuillez utiliser le numéro de carte de crédit suivant (4242 4242 4242 4242) pour les tests.',
    },
    errors: {
      404: {
        title: 'Ouuups... 😬',
        description: 'Désolé, la page que vous recherchez est introuvable.',
      },
      general: {
        title: 'Une erreur est survenue',
        description:
          'Nos équipes ont été alertées et vont rapidement intervenir.',
      },
      session_not_found: {
        title: 'La session est introuvable',
        description: 'Veuillez réessayer de passer votre commande.',
      },
      payment_not_found: {
        title: 'Le paiement est introuvable',
        description: 'Veuillez réessayer de retirer votre cashback.',
      },
      session_expired: {
        title: 'Votre session a expiré',
        description: 'Veuillez réessayer de passer votre commande.',
      },
      session_completed: {
        title: 'Votre session est terminée',
        description: 'Votre paiement a déjà été effectué avec succès.',
      },
      links: {
        help_center: {
          title: "Centre d'aide",
          description: 'Trouver des solutions à vos problèmes.',
        },
        documentation: {
          title: 'Documentation produit',
          description: 'Comprendre comment fonctionne notre solution.',
        },
        api_reference: {
          title: 'Référence API',
          description: 'La référence complète de nos API.',
        },
      },
    },
  },
  checkout: {
    order_summary: {
      total: 'Total',
      article: 'Art.',
      quantity: 'Qté',
      shipping: 'Frais de port',
      discount: 'Réduction',
      free: 'Gratuit',
      articles: 'Article⸱s',
      subtotal: 'Sous-total',
    },
    customer: {
      fields: {
        first_name: {
          label: 'Prénom',
          required: 'Veuillez entrer votre prénom',
        },
        last_name: {
          label: 'Nom',
          required: 'Veuillez entrer votre nom de famille',
        },
        email: {
          label: 'Adresse e-mail',
          required: 'Veuillez entrer votre e-mail',
          invalid: "L'e-mail n'est pas au bon format",
        },
        iban: {
          label: 'IBAN',
          required: 'Veuillez renseigner votre IBAN',
        },
      },
    },
    payment_group: {
      title: 'Économise et fais économiser tes amis',
      new: {
        title: 'Je parraine',
        description:
          'Payez maintenant, parrainez ensuite et recevez un cashback',
        deadline: {
          title: 'Délai de parrainage',
        },
        cashback: {
          title: 'Cashback max.',
        },
        steps: {
          sponsored_friend: 'ami parrainé',
          group_of: 'Groupe de',
          current: 'Actuellement',
        },
      },
      join: {
        title: 'On vous a parrainé',
        description:
          'Renseigne le code de parrainage pour rejoindre le kohort et bénéficie d’un cashback !',
        error: {
          general: {
            title: 'Une erreur est survenue',
            description:
              'Il semblerait que nous ayons un problème avec nos serveurs. Veuillez réessayer plus tard.',
          },
          email_required: {
            title: 'E-mail requis',
            description:
              'Veuillez renseigner votre e-mail ci-dessus pour rejoindre le groupe.',
          },
          not_found: {
            title: 'Code non valide',
            description:
              'Malheureusement ce code ne correspond à aucun groupe.',
          },
          completed: {
            title: 'Le groupe est déjà terminé',
            description:
              'Aucun soucis, tu peux créer ton propre groupe en cliquant sur le bloc au dessus.',
          },
          max_participants: {
            title: 'Groupe complet',
            description: 'Malheureusement ce groupe est déjà complet.',
          },
          email_already_used: {
            title: 'E-mail déjà existant',
            description:
              'Vous avez déjà rejoint ce groupe avec le même e-mail.',
          },
        },
      },
      joined: {
        title: 'rejoint',
        kohort_of: 'Kohort de ',
        congrats: 'Félicitations, déjà ',
        of_unlocked_cashback: ' de cashback débloqué !',
        unlocked_cashback: 'Cashback débloqué',
        unlocked_cashback_at: 'Cashback envoyé le ',
        participants: 'Invités parrainés',
      },
    },
    how_it_works: {
      title: 'Comment ça marche ?',
      step_1: {
        title: 'Créé ou rejoins un kohort',
        description:
          "Créé un kohort en payant immédiatement ou rejoins un kohort en renseignant le code de parrainage d'un de tes amis.",
      },
      step_2: {
        title: 'Invite tes amis',
        description:
          'Créateur ou invité parrainé peuvent partager le code de parrainage. Plus le code de parrainage est utilisé, plus ton cashback et celui de tes invités parrainés augmentent.',
      },
      step_3: {
        title: 'Reçois un cashback',
        description:
          'À la fin du délai de parrainage, les personnes ayant réalisé un achat reçoivent un cashback proportionnel au nombre de participants.',
      },
    },
    payment: {
      pay: 'Payer',
      processing: 'Paiement en cours...',
      tos_agreement:
        'En validant le paiement, je certifie avoir lu et accepté ',
      iban_agreement:
        'En retirant mon cashback, je certifie avoir lu et accepté ',
      terms: "les conditions générales d'utilisation",
      and: ' et ',
      privacy: 'la politique de confidentialité',
      solution: ' de la solution KohortPay.',
      error: {
        title: 'Votre paiement a été refusé',
        message:
          'Veuillez vérifier les informations saisies ou réessayer avec une autre carte bancaire.',
      },
    },
    success_page: {
      title: 'Commande confirmée',
      description: {
        confirmation:
          'Vous allez être redirigé dans quelques secondes vers votre confirmation de commande, sinon',
        new_tab: 'cliquer ici',
        no_confirmation:
          'Votre confirmation de commande a été envoyé par email, vous pouvez fermer cette fênetre',
      },
      group_created: {
        title: 'Kohort créé 🔥',
        description: {
          cashback: 'de cashback gagné dès',
          friend: '1 ami',
          reffered: 'parrainé',
          with_code: 'avec le code',
        },
      },
      level_description: {
        unlock_last_level_congrats:
          'Bravo, vous avez atteint le dernier palier de cashback. Continuer à parrainer des amis pour que ceux-ci bénéficient du même cashback que vous.',
        refer: 'Parraine',
        friends: 'ami(s)',
        share_code: 'en partageant le code',
        to_unlock: 'pour atteindre le',
        second_level: 'deuxième palier',
        third_level: 'troisième palier',
      },
      group_discount_levels: {
        title: 'PARRAINE POUR GAGNER PLUS',
        description:
          'Invite des amis durant le délai de parrainage afin que toi et tes amis bénéficient d’un cashback plus élevé.',
        info1:
          'Les invités parrainés peuvent aussi inviter leurs amis à votre kohort.',
        info2:
          'Le cashback sera crédité sur votre carte bancaire dès la fin du délai de parrainage.',
        currently: 'Actuellement',
      },
      share_referral_code: {
        title: 'Inviter des amis à rejoindre le kohort',
        greeting: "Salut ! 👋 Je t'invite à mon achat parrainé sur",
        with_kohortpay:
          "avec KohortPay pour bénéficier d'un cashback allant jusqu'à",
        how_it_works: 'Comment ça marche ?',
        step1: 'Copie le code',
        step1_cont: 'rends-toi sur ',
        step1_cont_suffix: 'et constitue ton panier.',
        step2:
          'Sélectionne KohortPay comme moyen de règlement, renseigne ton code et paye ta commande.',
        step3: 'Reçois jusqu’à',
        step3_cont: 'de cashback sur ta commande !',
        learn_more:
          'Tu peux en savoir plus sur le fonctionnement et cashback déjà gagné en',
        learn_more_link: 'consultant le kohort.',
        no_account_needed:
          'Pas besoin de te créer de compte supplémentaire, la seule condition est de passer commande pour un minimum de',
        mutual_benefit: 'On gagnera tous les deux un cashback !',
        see_more:
          'Tu peux en savoir plus sur les conditions et le cashback déjà gagné ici.',
        invite_button: 'Inviter',
        copy_button: 'Copier le texte d’invitation',
        sms_button: 'SMS',
        email_button: 'E-mail',
        whatsapp_button: 'WhatsApp',
        how_it_works_intro: 'Comment ça marche ?',
      },
    },
    footer: {
      powered_by: 'Propulsé par',
      links: {
        terms: {
          label: 'Conditions',
          url: 'https://www.kohortpay.com/legal/conditions-generales',
        },
        privacy: {
          label: 'Confidentialité',
          url: 'https://www.kohortpay.com/legal/politique-de-confidentialite-payer',
        },
        help: {
          label: "Centre d'aide",
          url: 'https://help.kohortpay.com/fr',
        },
      },
    },
  },
  withdrawal: {
    cashback: {
      title: 'Retirez votre cashback ! 🎉',
      description:
        "Grâce à vos efforts, vous et vos amis bénéficiez d'un cashback.",
      available: 'Votre cashback disponible',
      success: {
        title: 'Votre cashback a été transféré ! ✅',
        description:
          'Vous recevrez votre cashback sur votre compte bancaire dans les prochains jours.',
        sent: 'Montant cashback envoyé',
      },
    },
    iban_form: {
      title: 'Mes coordonnées bancaires',
      description:
        'Remplissez vos informations bancaires pour retirer votre cashback.',
      submit: 'Retirer mon cashback disponible',
      success: {
        info: 'Un email de confirmation vient de vous être envoyé. Consulter vos spams si vous ne le trouvez pas dans votre boîte de réception.',
      },
    },
  },
} as const
