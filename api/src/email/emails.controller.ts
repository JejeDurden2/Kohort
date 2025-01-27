import { Controller, Get } from '@nestjs/common'

import { IsPublic } from '../common/decorators/is-public.decorator'
import { EmailsService } from './emails.service'

@IsPublic()
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get('send')
  async send() {
    return await this.emailsService.send({
      subject: 'Test',
      to: 'walid.boulanouar@kohort.eu',
      html: `
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
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
  <title>{{staticData.title}}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;700&display=swap" rel="stylesheet">
  <style>
    @media (max-width: 600px) {
      .sm-my-4 {
        margin-top: 16px !important;
        margin-bottom: 16px !important
      }
      .sm-mt-4 {
        margin-top: 16px !important
      }
      .sm-w-full {
        width: 100% !important
      }
      .sm-border-l-0 {
        border-left-width: 0px !important
      }
      .sm-border-t {
        border-top-width: 1px !important
      }
      .sm-p-6 {
        padding: 24px !important
      }
      .sm-px-6 {
        padding-left: 24px !important;
        padding-right: 24px !important
      }
      .sm-pl-0 {
        padding-left: 0 !important
      }
      .sm-pr-6 {
        padding-right: 24px !important
      }
      .sm-pt-2 {
        padding-top: 8px !important
      }
      .sm-text-center {
        text-align: center !important
      }
      .sm-leading-8 {
        line-height: 32px !important
      }
    }
  </style>
</head>
<body style="margin: 0; width: 100%; background-color: #F7F7F7; padding: 0; -webkit-font-smoothing: antialiased; word-break: break-word">
  <div style="display: none">
    {{staticData.metaData.greeting}} {{creatorName}}{{staticData.metaData.offerPartOne}}{{paymentGroup.shareId}}{{staticData.metaData.offerPartTwo}}
              {{creatorDiscountAmount}}
              {{staticData.metaData.cashback}}
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847;
    &#8199;&#65279;&#847; </div>
  <div role="article" aria-roledescription="email" aria-label="Ton paiement est autorisé" lang="fr">
    <div style="font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif">
      <table align="center" style="margin-left: auto; margin-right: auto; width: 600px; max-width: 100%" cellpadding="0" cellspacing="0" role="none">
        <tr>
          <td class="sm-my-4" style="margin-top: 24px; margin-bottom: 24px; text-align: center">
            <p style="font-size: 12px; color: #6b7280">
              {{staticData.weblink.label}}
              <a href="{{Weblink}}" style="color: #6b7280;"> {{staticData.weblink.seeOnline}}</a>
            </p>
          </td>
        </tr>
        <tr>
        </tr>
        <tr>
           <td class="sm-p-6" style="border-top: 8px solid {{#if  colors}}
                    {{colors.primaryColor}}
              {{else}}
                 #c72443
              {{/if}} ; background-color: #fff; padding: 64px 80px 16px; color: #170D2C">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
               {{#if  productType}}
              <tr>
                <td style="padding-bottom: 32px; text-align: left">
                  <img src="{{organization.imageUrl}}" alt="{{organization.name}}" style="vertical-align: middle; line-height: 1; border: 0; width: 80px; max-width: 80px; height: auto" class="sm-w-16">
                </td>
              </tr>
              {{/if}}
              <tr>
                <td style="text-align: left;">
                  <h1 style="margin-top: 0; margin-bottom: 0; font-size: 48px; font-weight: 600; line-height: 56px">
             {{staticData.header.moreMembersLessPay}}
            
               
            </h1>
            </table>
          </td>
        </tr>
        {{#equals reminderEmailSentStatus "MIDWAY_SENT"}}
        <tr>
          <td class="sm-px-6" style="background-color: #fff; padding-left: 80px; padding-right: 80px; font-size: 14px; color: #334155;font-size: 24px; font-weight: 400; color: #170D2C">
            <p>
              {{staticData.mainContent.greeting}} {{creatorName}},
              <br><br>
              {{staticData.mainContent.welcomeMessageStart}}{{organization.name}}{{staticData.mainContent.welcomeMessageDate}}{{createdAt}}{{staticData.mainContent.welcomeMessageEnd}}
              <span style="font-weight: 600;">{{staticData.mainContent.unlockUntill}}{{maxDiscount}}</span>
              {{staticData.mainContent.organizationNameBold}}
              <br><br>
              {{staticData.mainContent.remainingTimeToInvite}}
              <span style="font-weight: 600;">{{remainingTime}}</span>
              {{staticData.mainContent.invitePartOne}}{{organization.name}}{{staticData.mainContent.shareCodePartOne}}
              <span style="font-weight: 600;">{{paymentGroup.shareId}}{{staticData.mainContent.shareCodePartTwo}}</span>
              
             <br><br>
              {{staticData.mainContent.offerPartOne}}
              <span style="font-weight: 600;">{{creatorDiscountAmount}}</span>
              {{staticData.mainContent.offerPartTwo}}
             {{staticData.mainContent.offerPercentage}}<span style="font-weight: 600;">{{discount}}</span>
              {{staticData.mainContent.offerPartThree}}
              <br> <br>
              {{staticData.mainContent.offerPartFour}}
              <span style="font-weight: 600;">{{staticData.mainContent.offerPartFive}}</span>
              {{staticData.mainContent.friendsAppreciation}}<br>
            </p>
          </td>
        </tr>
        {{/equals}}
        {{#equals reminderEmailSentStatus "DAY3_SENT"}}
        <tr>
          <td class="sm-px-6" style="background-color: #fff; padding-left: 80px; padding-right: 80px; font-size: 14px; color: #334155;font-size: 24px; font-weight: 400; color: #170D2C">
            <p>
              {{staticData.mainContent.greeting}} {{creatorName}},
              <br><br>
              {{staticData.mainContent.welcomeMessageStart}}{{organization.name}}{{staticData.mainContent.welcomeMessageDate}}{{createdAt}}{{staticData.mainContent.welcomeMessageEnd}}
              <span style="font-weight: 600;">{{staticData.mainContent.unlockUntill}}{{maxDiscount}}</span>
              {{staticData.mainContent.organizationNameBold}}
              <br><br>
              {{staticData.mainContent.remainingTimeToInvite}}
              <span style="font-weight: 600;">{{remainingTime}}</span>
              {{staticData.mainContent.invitePartOne}}{{organization.name}}{{staticData.mainContent.shareCodePartOne}}
              <span style="font-weight: 600;">{{paymentGroup.shareId}}{{staticData.mainContent.shareCodePartTwo}}</span>
              
             <br><br>
              {{staticData.mainContent.offerPartOne}}
              <span style="font-weight: 600;">{{creatorDiscountAmount}}</span>
              {{staticData.mainContent.offerPartTwo}}
             {{staticData.mainContent.offerPercentage}}<span style="font-weight: 600;">{{discount}}</span>
              {{staticData.mainContent.offerPartThree}}
              <br> <br>
              {{staticData.mainContent.offerPartFour}}
              <span style="font-weight: 600;">{{staticData.mainContent.offerPartFive}}</span>
              {{staticData.mainContent.friendsAppreciation}}<br>
            </p>
          </td>
        </tr>
        {{/equals}}
        {{#equals reminderEmailSentStatus "DAY2_BEFORE_END_SENT"}}
        <tr>
  <td class="sm-px-6" style="background-color: #fff; padding-left: 80px; padding-right: 80px; font-size: 14px; color: #334155; font-size: 24px; font-weight: 400; color: #170D2C">
    <p>
      {{staticData.mainContent.greeting}} {{creatorName}},
      <br><br>
      {{staticData.mainContent.timeLeftMessage}}<span style="font-weight: 600;">{{expiresAt}}</span>{{staticData.mainContent.inviteMessagePartOne}}{{organization.name}}{{staticData.mainContent.inviteMessagePartTwo}}
      <span style="font-weight: 600;">{{paymentGroup.shareId}}{{staticData.mainContent.inviteMessagePartThree}}</span>
      <br><br>
      {{staticData.mainContent.directBenefitMessagePartOne}}
      <span style="font-weight: 600;">{{creatorDiscountAmount}}</span>
      {{staticData.mainContent.directBenefitMessagePartTwo}}
      {{staticData.mainContent.directBenefitMessagePartThree}}<span style="font-weight: 600;">{{discount}}</span>
      {{staticData.mainContent.directBenefitMessagePartFour}}
      <br><br>
      {{staticData.mainContent.increaseCashbackMessagePartOne}}
      {{staticData.mainContent.increaseCashbackMessagePartTwo}}
      <span style="font-weight: 600;">{{maxDiscount}}</span>{{staticData.mainContent.increaseCashbackMessagePartThree}}
      {{staticData.mainContent.closingMessage}}
    </p>
  </td>
</tr>
{{/equals}}
        <tr>
          <td class="sm-px-6" style="background-color: #fff; padding-left: 80px; padding-right: 80px;padding-bottom: 64px;  font-size: 14px; color: #334155">
      <!-- Button -->
     <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="">
                <a href="{{paymentGroup.shareUrl}}" target="_blank" style="display: block;border-radius: 16px; border: 8px solid {{#if  colors}}
                            {{colors.secondaryColor}}
                      {{else}}
                         #FDEAF3
                      {{/if}} ; background: {{#if  colors}}
                            {{colors.primaryColor}}
                      {{else}}
                         #ed3a5f
                      {{/if}}; font-size: 18px; font-weight: 800; color: {{#if  colors.colorTextButton}}
                            {{colors.colorTextButton}}
                      {{else}}
                         #fff
                      {{/if}}; text-decoration: none; padding: 16px; text-align: center;">
                      {{staticData.cta}}
                    </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
       
        
        <tr style="border: 0px solid #f8f1ec; border-top: 2px solid #f8f1ec; background-color: #fffaf6; font-size: 12px; color: #170D2C">
          <td class="sm-px-6" style="border: 0px solid #f8f1ec; border-top: 2px solid #f8f1ec; padding: 16px 80px">
            <table style="width: 100%;" cellpadding="0" cellspacing="0" role="none">
              <tr>
                <td class="sm-w-full" style="display: inline-block; width: 66.666667%">
                  {{#if productType}}
                  <span style="font-size: 12px; font-weight: 500; color: #6b7280;margin-right: 6px;">{{staticData.footer.developedBy}}</span>
                  <a href="https://www.kohortpay.com">
                    <img src="https://my.kohortpay.dev/Logo.png" width="83" alt="kohortpay" style="max-width: 100%; vertical-align: middle; line-height: 1; border: 0;padding-left: 4px;margin-top:-4px">
                  </a>
                     {{else}}
                    <a href="https://www.kohortpay.com">
                    <img src="https://my.kohortpay.dev/Logo.png" width="83" alt="kohortpay" style="max-width: 100%; vertical-align: middle; line-height: 1; border: 0">
                  </a>
                  <p style="margin-top: 6px; margin-bottom: 6px; font-size: 10px; color: #170D2C">
                    {{staticData.footer.addressLine1}}<br>
                    {{staticData.footer.addressLine2}}<br>
                    {{staticData.footer.addressLine3}}
                  </p>
                  
                
                  {{/if}}
                </td>
                <td class="sm-w-full sm-border-l-0 sm-border-t sm-pl-0 sm-mt-4 sm-pt-2 sm-text-center" style="display: inline-block; border: 0px solid #9ca3af; font-size: 10px;width: 30%;text-align: right; vertical-align: middle;">
                  <a class="sm-pr-6" target="_blank" href="{{staticData.footer.privacyPolicyUrl}}" style="line-height: 24px; color: #170D2C; text-decoration-line: none">{{staticData.footer.privacyPolicy}}</a><br>
                  <a class="sm-pr-6" target="_blank" href="{{staticData.footer.termsAndConditionsUrl}}" style="line-height: 24px; color: #170D2C; text-decoration-line: none">{{staticData.footer.termsAndConditions}}</a><br>
                  <a class="sm-pr-6" target="_blank" href="{{staticData.footer.helpCenterUrl}}" style="line-height: 24px; color: #170D2C; text-decoration-line: none">{{staticData.footer.helpCenter}}</a>
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
      dynamicTemplateData: {
        creatorName: 'Martin',
        productType: '3 €',
        maxDiscountAmount: '40€',
        subject: 'testing',
        discount: '20%',
        colors: {
          primaryColor: '#000000',
          secondaryColor: '#b3b3b3',
        },
        reminderEmailSentStatus: 'DAY2_BEFORE_END_SENT',
        createdAt: '13/09',
        expiresAt: '29 juin, 17h00',
        maxDiscount: '30%',
        organization: {
          id: 'org_0fd333a2d24433',
          name: 'OrgJ',
          slug: 'orgj',
          clerkId: 'org_2RbAPSCGjLVl9vhN0TZzSittcol',
          stripeId: 'acct_1NQoPcPuDsnYRPJE',
          imageUrl:
            'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yUWVla2dZbEptTmJRR3hJN3lFZ2VqTElXc1IiLCJyaWQiOiJvcmdfMlJiQVBTQ0dqTFZsOXZoTjBUWnpTaXR0Y29sIiwiaW5pdGlhbHMiOiJPIn0',
          stripeDashboardUrl:
            'https://connect.stripe.com/express/acct_1NQoPcPuDsnYRPJE/IAXd1uq3iasZ',
          payoutInterval: 'WEEKLY',
          payoutAnchorWeekly: 'MONDAY',
          payoutAnchorMonthly: null,
          kohortPaymentFees: '2',
          kohortAcquisitionFees: '10',
          checkoutCancelUrl: 'www.imparfaite.com',
          checkoutSuccessUrl: 'www.imparfaite.com',
          checkoutCurrency: 'EUR',
          checkoutLocale: 'en_US',
          checkoutBrandIconUrl: 'www.tediber.com/favicon-128.png',
          checkoutBrandLogoUrl: 'www.imparfaite.com/_nuxt/img/logo.5ddc513.svg',
          checkoutBrandColor: 'fdf8ed',
          checkoutBrandHighlightColor: '000001',
          checkoutSessionDuration: 1440,
          checkoutPaymentTypeAvailable: ['GROUP', 'STANDARD'],

          checkoutPaymentGroupMaximumParticipants: 15,
          checkoutPaymentGroupMinutesDuration: 10080,
          addressId: 'adr_51ddd0577c1d70',
          createdBy: 'user_2RbANbWzI3MfhBugCp9kmuXOEw3',
          createdAt: '2023-06-23T08:19:45.721Z',
          updatedAt: '2023-08-11T12:19:32.294Z',
          updatedBy: 'user_33a2d244331f8d',
          deletedAt: null,
        },
        paymentGroup: {
          id: 'pg_f6842b2afce211',
          shareId: 'KHTPAY-test-6842B2AF',
          shareUrl: 'https://my.kohortpay.dev/pg/KHTPAY-test-6842B2AF',
          livemode: false,
          organizationId: 'org_0fd333a2d24433',
          customerId: 'cus_06957e56fd6d32',
          status: 'OPEN',
          metadata: null,
          expiresAt: '2023-09-15T09:52:10.857Z',
          createdAt: '2023-09-08T09:52:10.891Z',
          updatedAt: '2023-09-08T09:52:10.891Z',
          canceledAt: null,
          completedAt: null,
        },
        customer: {
          id: 'cus_06957e56fd6d32',
          emailAddress: 'jerome.desmares@kohort.eu',
          firstName: 'Aymeric',
          lastName: 'Aitamer',
          phoneNumber: null,
          livemode: false,
          organizationId: 'org_0fd333a2d24433',
          addressId: null,
          shippingAddressId: null,
          metadata: null,
          createdAt: '2023-08-04T06:59:45.676Z',
          updatedAt: '2023-08-04T06:59:45.676Z',
          deletedAt: null,
        },
        creatorDiscountAmount: '-30€',
        remainingTime: '2h 30m',
        staticData: {
          title: 'tic tac tac',
          metaData: {
            greeting: 'Hello',
            offerPartOne: ', if a friend uses your referral code ',
            offerPartTwo: ', you benefit directly from ',
            cashback: ' in cashback.',
          },
          weblink: {
            label: 'Des difficultés pour consulter cet email ?',
            seeOnline: 'Visualiser en ligne',
          },
          header: {
            priceDropAlert: 'Tic tac, tic tac... ',
            moreMembersLessPay:
              'Tu n’as pas encore bénéficier de ton cashback ? 😮',
            welcomeMessageStart:
              'Personne n’a encore rejoint ton achat KohortPay chez ',
            welcomeMessageEnd: '',
            organizationNameBold:
              '. Mais pas d’inquiétude, on est là pour toi !',
          },
          mainContent: {
            greeting: 'Bonjour',
            welcomeMessageStart: 'Suite à ta commande chez ',
            welcomeMessageDate: ' le ',
            welcomeMessageEnd: ', tu as la possibilité de ',
            unlockUntill: ' débloquer jusqu’à ',
            organizationNameBold: 'en cashback.',
            remainingTimeToInvite: 'il te reste ',
            invitePartOne: ' pour inviter des amis à réaliser un achat sur ',
            shareCodePartOne: ' en utilisant ton code ',
            shareCodePartTwo: '.',
            cashback: ' de cashback',
            unlockLevel: '.',
            offerPartOne:
              'Si un.e ami.e utilise ton code dans ce délai, tu bénéficies directement de ',
            offerPartTwo: ' en cashback ',
            offerPercentage: '(et lui/elle l’équivalent de ',
            offerPartThree: ' sur le montant de son achat).',
            offerPartFour: ' Ensuite, ',
            offerPartFive:
              ' plus ton code est utilisé, plus vos cashback augmentent.',
            friendsAppreciation: ' Jouer collectif ça marche !',
            title: "Dernière chance d'obtenir ton cashback ⏳",
            timeLeftMessage: 'Il te reste jusqu’au ',
            inviteMessagePartOne:
              ' pour inviter un ou des amis à réaliser un achat sur ',
            inviteMessagePartTwo: ' en utilisant le code ',
            inviteMessagePartThree: '.',
            directBenefitMessagePartOne:
              'Si un.e ami.e utilise ton code dans ce délai, tu bénéficies directement de ',
            directBenefitMessagePartTwo: ' en cashback ',
            directBenefitMessagePartThree: '(et lui/elle l’équivalent de ',
            directBenefitMessagePartFour: ' sur le montant de son achat).',
            increaseCashbackMessagePartOne:
              'Ensuite, plus le code est utilisé plus, plus le montant du cashback augmente ',
            increaseCashbackMessagePartTwo: '(jusqu’à ',
            increaseCashbackMessagePartThree: ' sur vos commandes).',
            closingMessage: 'Jouer collectif, ça marche !',
          },
          cta: 'Voir mon kohort',
          footer: {
            developedBy: 'propulsé par',
            addressLine1: '1 rue Stockholm',
            addressLine2: '75008 Paris',
            addressLine3: 'France',
            privacyPolicy: 'Confidentialité',
            termsAndConditions: 'Conditions générales',
            helpCenter: "Centre d'aide",
            privacyPolicyUrl:
              'https://en.kohortpay.com/legal/politique-de-confidentialite',
            termsAndConditionsUrl:
              'https://en.kohortpay.com/legal/mentions-legales',
            helpCenterUrl: 'https://support.kohortpay.com/',
            websiteUrl: 'https://www.kohortpay.com/',
          },
        },
      },
    })
  }
}
