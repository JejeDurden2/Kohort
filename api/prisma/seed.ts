import {
  EmailType,
  FromEmailType,
  Locale,
  Prisma,
  PrismaClient,
} from '@prisma/client'

type TransactionalEmail = {
  id: string
  type: EmailType
  subject: string
  fromEmail: FromEmailType
  preheaderText: string
  variables: Prisma.InputJsonValue
  locale: Locale
  livemode: boolean
  isInternal?: boolean
  body: string
}
const prisma = new PrismaClient()
async function main() {
  const transactionalEmails: TransactionalEmail[] = [
    {
      id: 'tem_cashback_withdrawn_en_test_abc123',
      type: EmailType.ONBOARDING_AMBASSADOR,
      subject:
        "Bienvenue dans notre programme d'ambassadeurs ! Partage, gagne, et profite de tes avantages 💸",
      fromEmail: FromEmailType.RESEND_FROM_EMAIL_CASHBACK,
      isInternal: true,
      preheaderText:
        "Bienvenue dans notre programme d'ambassadeurs ! Découvrez comment gagner des récompenses en partageant vos marques préférées avec votre communauté.",
      variables: {
        ambassador: {
          phoneNumber: '0606060606',
          referralCode: 'AMB-123456',
        },
        organizationsWebsites: 'nike.com, adidas.com',
      },
      locale: Locale.fr_FR,
      livemode: true,
      body: `<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml">
  <head>
    <meta charset="utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings
            xmlns:o="urn:schemas-microsoft-com:office:office"
          >
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <style>
        td,
        th,
        div,
        p,
        a,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-family: "Segoe UI", sans-serif;
          mso-line-height-rule: exactly;
        }
      </style>
    <![endif]-->
    <title>
    Bienvenue dans notre programme d'ambassadeurs ! Partage, gagne, et profite de tes avantages 💸
    </title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
    />
    <style>
      @media (max-width: 600px) {
        .sm-my-4 {
          margin-top: 16px !important;
          margin-bottom: 16px !important;
        }
        .sm-mt-4 {
          margin-top: 16px !important;
        }
        .sm-w-full {
          width: 100% !important;
        }
        .sm-border-l-0 {
          border-left-width: 0px !important;
        }
        .sm-border-t {
          border-top-width: 1px !important;
        }
        .sm-p-6 {
          padding: 24px !important;
        }
        .sm-px-6 {
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
        .sm-pl-0 {
          padding-left: 0 !important;
        }
        .sm-pr-6 {
          padding-right: 24px !important;
        }
        .sm-pt-2 {
          padding-top: 8px !important;
        }
        .sm-text-center {
          text-align: center !important;
        }
        .sm-leading-8 {
          line-height: 30px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      margin: 0;
      width: 100%;
      background-color: #f7f7f7;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      word-break: break-word;
    "
  >
    <div style="display: none">
    Partage ton code avec tes amis et gagne 10€ pour chaque commande ! Tes amis bénéficient aussi de 20% de réduction.
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
    </div>
    <div
      role="article"
      aria-roledescription="email"
      aria-label="Ton paiement est autorisé"
      lang="fr"
    >
      <div
        style="
          font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system,
            'Segoe UI', sans-serif;
        "
      >
        <table
          align="center"
          style="
            margin-left: auto;
            margin-right: auto;
            width: 600px;
            max-width: 100%;
          "
          cellpadding="0"
          cellspacing="0"
          role="none"
        >
          <tr>
            <td
              class="sm-my-4"
              style="margin-top: 24px; margin-bottom: 24px; text-align: center"
            >
              <p style="font-size: 12px; color: #6b7280">
                Des difficultés pour consulter cet email ?
                <a href="{{Weblink}}" style="color: #6b7280">
                  Visualiser en ligne</a
                >
              </p>
            </td>
          </tr>
          <tr></tr>
          <tr>
            <td
              class="sm-p-6"
              style="border-top: 8px solid #ffae00 ; background-color: #fff; padding: 64px 80px 16px; color: #170D2C"
            >
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td style="padding-bottom: 32px; text-align: left">
                    <img
                      src="https://my.kohortpay.dev/kohor-inf/logo.png"
                      alt="Organization Logo"
                      height="100"
                      style="
                        display: block;
                        border: 0;
                        width: auto;
                        height: auto;
                        max-height: 100px;
                        max-width: 180px;
                      "
                    />
                  </td>
                </tr>

                <tr>
                  <td style="text-align: left">
                    <h1
                      style="
                        margin-top: 0;
                        margin-bottom: 0;
                        font-size: 48px;
                        font-weight: 600;
                        line-height: 56px;
                      "
                    >
                     Bienvenue dans 
la communauté !
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          
          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding-left: 80px;
                padding-right: 80px;
                font-size: 14px;
                color: #334155;
              "
            >
              <p
                style="
                  font-size: 20px;
                  text-align: center;
                  font-weight: 400;
                  color: #170d2c;
                "
              >
               Ton code est désormais actif et valable sur l’ensemble des sites partenaires suivants : {{organizationsWebsites}}<br><br>

Chaque commande effectuée sur le site  
en utilisant ce code te rapportera 10€*
              </p>
            </td>
          </tr>
          
           <tr>
           
                  <td
                    colspan="2"
                    style="
                       background-color: #fff;
                      font-size: 14px;
                      font-style: italic;
                      color: #6b7280;
                      text-align: center;
                    "
                  >
                    *minimum d’achat de 30€
                  </td>
                </tr>

          <tr>
            <td
              class="sm-px-6"
              style="background-color: #fff; padding: 20px 80px"
            >
              
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color: #f9a909; border-radius: 10px;"
              >
                <tr>
                  <td align="center" valign="middle" style="padding: 10px">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                          style="font-size: 24px; font-weight: 800; color: #fff; text-decoration: none; padding: 4px;"
                        >
                          {{ambassador.referralCode}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr></tr>
              </table>
              <!--[if mso]>
              </v:textbox>
            </v:roundrect>
            <![endif]-->
            </td>
          </tr>

          

          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding-left: 80px;
                padding-right: 80px;
                font-size: 14px;
                color: #334155;
              "
            >
              <p
                style="
                  font-size: 20px;
                  text-align: center;
                  font-weight: 400;
                  color: #170d2c;
                "
              >
                Communique ton code dès maintenant à un maximum de personnes sur tes réseaux sociaux préférés :
              </p>
            </td>
          </tr>

          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding-left: 80px;
                padding-right: 80px;
                padding-bottom: 5px;
              "
            >
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                width="100%"
                style="text-align: center"
              >
                <!-- Instagram -->
                <td align="center" style="padding: 10px">
                  <a
                    href="www.instagram.com"
                    target="_blank"
                    style="text-decoration: none"
                  >
                    <table
                      width="55"
                      height="55"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      style="border-collapse: collapse"
                    >
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                          style="
                            
                            
                          "
                        >
                          <img
                            src="https://my.kohortpay.dev/kohor-inf/Instagram.png"
                            alt="Instagram Icon"
                            style="display: block; width: 60px; height: 60px"
                          />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- WhatsApp -->
                <td align="center" style="padding: 10px">
                  <a
                    href="https://web.whatsapp.com/"
                    target="_blank"
                    style="text-decoration: none"
                  >
                    <table
                      width="55"
                      height="55"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      style="border-collapse: collapse"
                    >
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                          style="
                            
                          "
                        >
                          <img
                            src="https://my.kohortpay.dev/kohor-inf/Whatsapp.png"
                            alt="WhatsApp Icon"
                            style="display: block; width: 60px; height: 60px"
                          />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- X (formerly Twitter) -->
                <td align="center" style="padding: 10px">
                  <a
                    href="https://www.X.com"
                    target="_blank"
                    style="text-decoration: none"
                  >
                    <table
                      width="55"
                      height="55"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      style="border-collapse: collapse"
                    >
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                        >
                          <img
                            src="https://my.kohortpay.dev/kohor-inf/Messenger.png"
                            alt="X Icon"
                            style="display: block; width: 60px; height: 60px"
                          />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- Messenger -->
                <td align="center" style="padding: 10px">
                  <a
                    href="https://www.messenger.com/"
                    target="_blank"
                    style="text-decoration: none"
                  >
                    <table
                      width="55"
                      height="55"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      style="border-collapse: collapse"
                    >
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                          style="
                            
                          "
                        >
                          <img
                            src="https://my.kohortpay.dev/kohor-inf/X.png"
                            alt="Messenger Icon"
                            style="display: block; width: 60px; height: 60px"
                          />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- AI Button -->
             
              </table>
            </td>
          </tr>

         

          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding-left: 80px;
                padding-right: 80px;
                font-size: 14px;
                color: #334155;
              "
            ></td>
          </tr>

          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding: 16px 80px;
                font-size: 14px;
                color: #334155;
              "
            >
              <div
                style="
                  border-radius: 9999px;
                  border-color: #f3f4f6;
                  background-color: #fff;
                  border-top: 1px solid #e5e7eb;
                "
              ></div>
            </td>
          </tr>
          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding-left: 80px;
                padding-right: 80px;
                font-size: 14px;
                color: #170d2c;
              "
            >
              <h2
                class="sm-leading-8"
                style="
                  margin-bottom: 16px;
                  text-align: center;
                  font-size: 32px;
                  font-weight: 600;
                  color: #000;
                "
              >
                <span
                  style="color: #ffae00;"
                  >Des</span
                >
                questions ?
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="font-size: 16px; font-weight: 400; color: #170D2C">
      <h3 style="font-size: 24px; font-weight: 600">Quand est-ce que je serai payé ?</h3>
      <p>
        Vous pouvez effectuer la demande à tout moment en nous envoyant un mail contact@kohortpay.com.
        Kohortpay vous fait un virement bancaire immédiatement.
      </p>
    </td>
  </tr>
  <tr>
    <td style="font-size: 16px; font-weight: 400; color: #170D2C">
      <h3 style="font-size: 24px; font-weight: 600;">Que se passe t-il si je ne parraine personne ?</h3>
      <p>
        Absolument rien. Vous n’êtes pas engagé, si vous ne parvenez pas à parrainer personne, vous pouvez essayer avec une autre marque en vous rendant sur influence.kohortpay.com
      </p>
    </td>
  </tr>
  <tr>
    <td style="font-size: 16px; font-weight: 400; color: #170D2C">
      <h3 style="font-size: 24px; font-weight: 600;">Comment KohortPay sait que j’ai parrainé des personnes ?</h3>
      <p>
        KohortPay identifie vos parrainages à l’utilisation de votre code et vous envoie un rapport chaque mois par SMS.
      </p>
    </td>
  </tr>
</table>

            </td>
          </tr>
          <tr>
            <td
              class="sm-px-6"
              style="
                background-color: #fff;
                padding-top: 20px;
                padding-left: 80px;
                padding-right: 80px;
                padding-bottom: 64px;
                font-size: 14px;
                color: #334155;
              "
            >
              <!-- Button -->
              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                width="100%"
              >
                <tr>
                  
                </tr>
              </table>
            </td>
          </tr>

          <tr
            style="
              border: 0px solid #f8f1ec;
              border-top: 2px solid #f8f1ec;
              background-color: #fffaf6;
              font-size: 12px;
              color: #170d2c;
            "
          >
            <td
              class="sm-px-6"
              style="
                border: 0px solid #f8f1ec;
                border-top: 2px solid #f8f1ec;
                padding: 16px 80px;
              "
            >
              <table
                style="width: 100%; max-width: 600px; margin: 0 auto"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
              >
                <tr>
                  <td style="font-size: 12px; color: #666666">
                    Propulsé par
                    <a
                      href="https://www.kohortpay.com"
                      style="text-decoration: none; vertical-align: middle"
                    >
                      <img
                        src="https://my.kohortpay.dev/Logo.png"
                        width="83"
                        alt="kohortPay"
                        style="
                          border: 0;
                          vertical-align: middle;
                          margin-left: 4px;
                        "
                      />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="line-height: 48px">&zwj;</td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`,
    },
    {
      id: 'tem_cashback_withdrawn_en_test_abc123',
      type: EmailType.ONBOARDING_AMBASSADOR,
      subject:
        "Bienvenue dans notre programme d'ambassadeurs ! Partage, gagne, et profite de tes avantages 💸",
      fromEmail: FromEmailType.RESEND_FROM_EMAIL_CASHBACK,
      isInternal: true,
      preheaderText:
        "Bienvenue dans notre programme d'ambassadeurs ! Découvrez comment gagner des récompenses en partageant vos marques préférées avec votre communauté.",
      variables: {
        ambassador: {
          phoneNumber: '0606060606',
          referralCode: 'AMB-123456',
        },
        organizationsWebsites: 'nike.com, adidas.com',
      },
      locale: Locale.fr_FR,
      livemode: false,
      body: `<!DOCTYPE html>
  <html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml">
    <head>
      <meta charset="utf-8" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="format-detection"
        content="telephone=no, date=no, address=no, email=no, url=no"
      />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings
              xmlns:o="urn:schemas-microsoft-com:office:office"
            >
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <style>
          td,
          th,
          div,
          p,
          a,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            font-family: "Segoe UI", sans-serif;
            mso-line-height-rule: exactly;
          }
        </style>
      <![endif]-->
      <title>
      Bienvenue dans notre programme d'ambassadeurs ! Partage, gagne, et profite de tes avantages 💸
      </title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
      <style>
        @media (max-width: 600px) {
          .sm-my-4 {
            margin-top: 16px !important;
            margin-bottom: 16px !important;
          }
          .sm-mt-4 {
            margin-top: 16px !important;
          }
          .sm-w-full {
            width: 100% !important;
          }
          .sm-border-l-0 {
            border-left-width: 0px !important;
          }
          .sm-border-t {
            border-top-width: 1px !important;
          }
          .sm-p-6 {
            padding: 24px !important;
          }
          .sm-px-6 {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          .sm-pl-0 {
            padding-left: 0 !important;
          }
          .sm-pr-6 {
            padding-right: 24px !important;
          }
          .sm-pt-2 {
            padding-top: 8px !important;
          }
          .sm-text-center {
            text-align: center !important;
          }
          .sm-leading-8 {
            line-height: 30px !important;
          }
        }
      </style>
    </head>
    <body
      style="
        margin: 0;
        width: 100%;
        background-color: #f7f7f7;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        word-break: break-word;
      "
    >
      <div style="display: none">
      Partage ton code avec tes amis et gagne 10€ pour chaque commande ! Tes amis bénéficient aussi de 20% de réduction.
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      </div>
      <div
        role="article"
        aria-roledescription="email"
        aria-label="Ton paiement est autorisé"
        lang="fr"
      >
        <div
          style="
            font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system,
              'Segoe UI', sans-serif;
          "
        >
          <table
            align="center"
            style="
              margin-left: auto;
              margin-right: auto;
              width: 600px;
              max-width: 100%;
            "
            cellpadding="0"
            cellspacing="0"
            role="none"
          >
            <tr>
              <td
                class="sm-my-4"
                style="margin-top: 24px; margin-bottom: 24px; text-align: center"
              >
                <p style="font-size: 12px; color: #6b7280">
                  Des difficultés pour consulter cet email ?
                  <a href="{{Weblink}}" style="color: #6b7280">
                    Visualiser en ligne</a
                  >
                </p>
              </td>
            </tr>
            <tr></tr>
            <tr>
              <td
                class="sm-p-6"
                style="border-top: 8px solid #ffae00 ; background-color: #fff; padding: 64px 80px 16px; color: #170D2C"
              >
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="padding-bottom: 32px; text-align: left">
                      <img
                        src="https://my.kohortpay.dev/kohor-inf/logo.png"
                        alt="Organization Logo"
                        height="100"
                        style="
                          display: block;
                          border: 0;
                          width: auto;
                          height: auto;
                          max-height: 100px;
                          max-width: 180px;
                        "
                      />
                    </td>
                  </tr>
  
                  <tr>
                    <td style="text-align: left">
                      <h1
                        style="
                          margin-top: 0;
                          margin-bottom: 0;
                          font-size: 48px;
                          font-weight: 600;
                          line-height: 56px;
                        "
                      >
                       Bienvenue dans 
  la communauté !
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding-left: 80px;
                  padding-right: 80px;
                  font-size: 14px;
                  color: #334155;
                "
              >
                <p
                  style="
                    font-size: 20px;
                    text-align: center;
                    font-weight: 400;
                    color: #170d2c;
                  "
                >
                 Ton code est désormais actif et valable sur l’ensemble des sites partenaires suivants : {{organizationsWebsites}}<br><br>
  
  Chaque commande effectuée sur le site  
  en utilisant ce code te rapportera 10€*
                </p>
              </td>
            </tr>
            
             <tr>
             
                    <td
                      colspan="2"
                      style="
                         background-color: #fff;
                        font-size: 14px;
                        font-style: italic;
                        color: #6b7280;
                        text-align: center;
                      "
                    >
                      *minimum d’achat de 30€
                    </td>
                  </tr>
  
            <tr>
              <td
                class="sm-px-6"
                style="background-color: #fff; padding: 20px 80px"
              >
                
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="background-color: #f9a909; border-radius: 10px;"
                >
                  <tr>
                    <td align="center" valign="middle" style="padding: 10px">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td
                            align="center"
                            valign="middle"
                            style="font-size: 24px; font-weight: 800; color: #fff; text-decoration: none; padding: 4px;"
                          >
                            {{ambassador.referralCode}}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr></tr>
                </table>
                <!--[if mso]>
                </v:textbox>
              </v:roundrect>
              <![endif]-->
              </td>
            </tr>
  
            
  
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding-left: 80px;
                  padding-right: 80px;
                  font-size: 14px;
                  color: #334155;
                "
              >
                <p
                  style="
                    font-size: 20px;
                    text-align: center;
                    font-weight: 400;
                    color: #170d2c;
                  "
                >
                  Communique ton code dès maintenant à un maximum de personnes sur tes réseaux sociaux préférés :
                </p>
              </td>
            </tr>
  
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding-left: 80px;
                  padding-right: 80px;
                  padding-bottom: 5px;
                "
              >
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                  style="text-align: center"
                >
                  <!-- Instagram -->
                  <td align="center" style="padding: 10px">
                    <a
                      href="www.instagram.com"
                      target="_blank"
                      style="text-decoration: none"
                    >
                      <table
                        width="55"
                        height="55"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td
                            align="center"
                            valign="middle"
                            style="
                              
                              
                            "
                          >
                            <img
                              src="https://my.kohortpay.dev/kohor-inf/Instagram.png"
                              alt="Instagram Icon"
                              style="display: block; width: 60px; height: 60px"
                            />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
  
                  <!-- WhatsApp -->
                  <td align="center" style="padding: 10px">
                    <a
                      href="https://web.whatsapp.com/"
                      target="_blank"
                      style="text-decoration: none"
                    >
                      <table
                        width="55"
                        height="55"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td
                            align="center"
                            valign="middle"
                            style="
                              
                            "
                          >
                            <img
                              src="https://my.kohortpay.dev/kohor-inf/Whatsapp.png"
                              alt="WhatsApp Icon"
                              style="display: block; width: 60px; height: 60px"
                            />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
  
                  <!-- X (formerly Twitter) -->
                  <td align="center" style="padding: 10px">
                    <a
                      href="https://www.X.com"
                      target="_blank"
                      style="text-decoration: none"
                    >
                      <table
                        width="55"
                        height="55"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td
                            align="center"
                            valign="middle"
                          >
                            <img
                              src="https://my.kohortpay.dev/kohor-inf/Messenger.png"
                              alt="X Icon"
                              style="display: block; width: 60px; height: 60px"
                            />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
  
                  <!-- Messenger -->
                  <td align="center" style="padding: 10px">
                    <a
                      href="https://www.messenger.com/"
                      target="_blank"
                      style="text-decoration: none"
                    >
                      <table
                        width="55"
                        height="55"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        style="border-collapse: collapse"
                      >
                        <tr>
                          <td
                            align="center"
                            valign="middle"
                            style="
                              
                            "
                          >
                            <img
                              src="https://my.kohortpay.dev/kohor-inf/X.png"
                              alt="Messenger Icon"
                              style="display: block; width: 60px; height: 60px"
                            />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
  
                  <!-- AI Button -->
               
                </table>
              </td>
            </tr>
  
           
  
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding-left: 80px;
                  padding-right: 80px;
                  font-size: 14px;
                  color: #334155;
                "
              ></td>
            </tr>
  
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding: 16px 80px;
                  font-size: 14px;
                  color: #334155;
                "
              >
                <div
                  style="
                    border-radius: 9999px;
                    border-color: #f3f4f6;
                    background-color: #fff;
                    border-top: 1px solid #e5e7eb;
                  "
                ></div>
              </td>
            </tr>
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding-left: 80px;
                  padding-right: 80px;
                  font-size: 14px;
                  color: #170d2c;
                "
              >
                <h2
                  class="sm-leading-8"
                  style="
                    margin-bottom: 16px;
                    text-align: center;
                    font-size: 32px;
                    font-weight: 600;
                    color: #000;
                  "
                >
                  <span
                    style="color: #ffae00;"
                    >Des</span
                  >
                  questions ?
                </h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size: 16px; font-weight: 400; color: #170D2C">
        <h3 style="font-size: 24px; font-weight: 600">Quand est-ce que je serai payé ?</h3>
        <p>
          Vous pouvez effectuer la demande à tout moment en nous envoyant un mail contact@kohortpay.com.
          Kohortpay vous fait un virement bancaire immédiatement.
        </p>
      </td>
    </tr>
    <tr>
      <td style="font-size: 16px; font-weight: 400; color: #170D2C">
        <h3 style="font-size: 24px; font-weight: 600;">Que se passe t-il si je ne parraine personne ?</h3>
        <p>
          Absolument rien. Vous n’êtes pas engagé, si vous ne parvenez pas à parrainer personne, vous pouvez essayer avec une autre marque en vous rendant sur influence.kohortpay.com
        </p>
      </td>
    </tr>
    <tr>
      <td style="font-size: 16px; font-weight: 400; color: #170D2C">
        <h3 style="font-size: 24px; font-weight: 600;">Comment KohortPay sait que j’ai parrainé des personnes ?</h3>
        <p>
          KohortPay identifie vos parrainages à l’utilisation de votre code et vous envoie un rapport chaque mois par SMS.
        </p>
      </td>
    </tr>
  </table>
  
              </td>
            </tr>
            <tr>
              <td
                class="sm-px-6"
                style="
                  background-color: #fff;
                  padding-top: 20px;
                  padding-left: 80px;
                  padding-right: 80px;
                  padding-bottom: 64px;
                  font-size: 14px;
                  color: #334155;
                "
              >
                <!-- Button -->
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  width="100%"
                >
                  <tr>
                    
                  </tr>
                </table>
              </td>
            </tr>
  
            <tr
              style="
                border: 0px solid #f8f1ec;
                border-top: 2px solid #f8f1ec;
                background-color: #fffaf6;
                font-size: 12px;
                color: #170d2c;
              "
            >
              <td
                class="sm-px-6"
                style="
                  border: 0px solid #f8f1ec;
                  border-top: 2px solid #f8f1ec;
                  padding: 16px 80px;
                "
              >
                <table
                  style="width: 100%; max-width: 600px; margin: 0 auto"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                >
                  <tr>
                    <td style="font-size: 12px; color: #666666">
                      Propulsé par
                      <a
                        href="https://www.kohortpay.com"
                        style="text-decoration: none; vertical-align: middle"
                      >
                        <img
                          src="https://my.kohortpay.dev/Logo.png"
                          width="83"
                          alt="kohortPay"
                          style="
                            border: 0;
                            vertical-align: middle;
                            margin-left: 4px;
                          "
                        />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="line-height: 48px">&zwj;</td>
            </tr>
          </table>
        </div>
      </div>
    </body>
  </html>`,
    },
  ]
  // delte emails the same type:
  await prisma.transactionalEmail.deleteMany({
    where: {
      type: EmailType.ONBOARDING_AMBASSADOR,
    },
  })
  console.log('Deleted existing onboarding ambassador emails')
  const upsertPromises = transactionalEmails.map(async (email) => {
    try {
      console.log(`Attempting to upsert email with ID: ${email.id}`)

      const result = await prisma.transactionalEmail.upsert({
        where: {
          id: email.id,
        },
        update: {
          ...email,
        },
        create: {
          ...email,
          organizationId: null,
        },
      })

      console.log(`Upserted email with ID: ${email.id} & type: ${email.type}`)
      return result
    } catch (error) {
      console.error(
        `An error occurred while upserting email with ID: ${email.id}`,
        error
      )
    }
  })

  await Promise.all(upsertPromises)

  console.log('Upsert operation completed for all emails.')
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
