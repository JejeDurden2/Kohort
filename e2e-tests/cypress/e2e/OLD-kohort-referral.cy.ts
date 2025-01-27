import { faker } from '@faker-js/faker'
import 'cypress-iframe'

import exp = require('constants')

describe('template spec', () => {
  const secretKey = Cypress.env('STAGING_SECRET_KEY_KOHORT_REFERRAL')
  const API_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_API_URL')
      : Cypress.env('PROD_API_URL')
  const MY_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_MY_URL')
      : Cypress.env('PROD_MY_URL')
  const CHECKOUT_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_CHECKOUT_URL')
      : Cypress.env('PROD_CHECKOUT_URL')
  let firstCheckoutSessionId = ''
  let groupShareId = ''
  let paymentIntentId = ''

  beforeEach(() => {
    cy.viewport('macbook-13')
  })

  it('creates a completed checkout session and open group', () => {
    cy.request({
      url: `${API_URL}/checkout-sessions`,
      method: 'POST',
      auth: {
        bearer: secretKey,
      },
      body: {
        lineItems: [
          {
            price: 3000,
            quantity: 1,
            name: 'test',
            description: 'lorem ipsum',
            imageUrl: 'https://via.placeholder.com/150',
          },
        ],
        amountTotal: 3000,
        customerFirstName: 'Test',
        customerLastName: 'Customer',
        customerEmail: 'e2e+frcypressTest@kohortpay.com',
        clientReferenceId: faker.string.uuid(),
        paymentClientReferenceId: faker.string.uuid(),
      },
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('share_id')
      expect(response.body).to.have.property('url')
      expect(response.body).to.have.property('status').to.eq('COMPLETED')
      firstCheckoutSessionId = response.body.share_id
      cy.visit(response.body.url)
      cy.request({
        url: `${API_URL}/checkout-sessions/${firstCheckoutSessionId}?expand[]=paymentIntent`,
        method: 'GET',
        auth: {
          bearer: secretKey,
        },
      }).then((response) => {
        paymentIntentId = response.body.payment_intent.id
        expect(response.body.payment_intent)
          .to.have.property('status')
          .to.eq('SUCCEEDED')
        expect(response.body.payment_intent).to.have.property(
          'payment_group_id'
        ).to.not.be.null
      })
    })
  })

  it('creates a en_US completed checkout session and join a group', () => {
    cy.request({
      url: `${API_URL}/checkout-sessions/${firstCheckoutSessionId}?expand[]=paymentIntent.paymentGroup`,
      method: 'GET',
      auth: {
        bearer: secretKey,
      },
    }).then((response: any) => {
      groupShareId = response.body.payment_intent.payment_group.share_id
      cy.request({
        url: `${API_URL}/checkout-sessions`,
        method: 'POST',
        auth: {
          bearer: secretKey,
        },
        body: {
          lineItems: [
            { name: 'WELCOME10', price: -1000, quantity: 1, type: 'DISCOUNT' },
            {
              name: 'Item',
              price: 4000,
              quantity: 2,
              description: 'Beautiful item',
              type: 'PRODUCT',
              image_url: 'https://via.placeholder.com/150',
            },
            {
              name: 'Shipping',
              price: 1000,
              quantity: 1,
              description: 'FEDEX',
              type: 'SHIPPING',
            },
          ],
          amountTotal: 8000,
          customerFirstName: 'Thomas',
          customerLastName: 'Andrews',
          customerEmail: 'e2e+encypressTest@kohortpay.com',
          clientReferenceId: faker.string.uuid(),
          paymentClientReferenceId: faker.string.uuid(),
          paymentGroupShareId: groupShareId,
          locale: 'en_US',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  it('creates a fr_FR completed checkout session and join a group', () => {
    cy.request({
      url: `${API_URL}/checkout-sessions/${firstCheckoutSessionId}?expand[]=paymentIntent.paymentGroup`,
      method: 'GET',
      auth: {
        bearer: secretKey,
      },
    }).then((response: any) => {
      groupShareId = response.body.payment_intent.payment_group.share_id
      cy.request({
        url: `${API_URL}/checkout-sessions`,
        method: 'POST',
        auth: {
          bearer: secretKey,
        },
        body: {
          lineItems: [
            { name: 'WELCOME10', price: -1000, quantity: 1, type: 'DISCOUNT' },
            {
              name: 'Item',
              price: 3000,
              quantity: 2,
              description: 'Beautiful item',
              type: 'PRODUCT',
              image_url: 'https://via.placeholder.com/150',
            },
          ],
          amountTotal: 5000,
          customerFirstName: 'Martin',
          customerLastName: 'Souriau',
          customerEmail: 'e2e+fr2cypressTest@kohortpay.com',
          clientReferenceId: faker.string.uuid(),
          paymentClientReferenceId: faker.string.uuid(),
          paymentGroupShareId: groupShareId,
          locale: 'fr_FR',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  it('visits MY and checks display', () => {
    cy.visit(`${MY_URL}/en_US/pg/${groupShareId}`)
    cy.wait(2000)
    cy.contains('€3.00').should('exist')
    cy.contains('€80.00').should('exist')
    cy.contains('span', 'Invite').should('exist')
  })

  it('visits Cashback Withdrawal page and withdraw cashback', () => {
    cy.wait(120000) // need to wait for the cashback to be available (groups ends + cron job)
    cy.request({
      url: `${API_URL}/payment-intents/${paymentIntentId}`,
      method: 'GET',
      auth: {
        bearer: secretKey,
      },
    }).then((response) => {
      const token = response.body.token
      cy.visit(`${CHECKOUT_URL}/w/${paymentIntentId}?token=${token}`)
      cy.wait(2000)
      cy.contains('3,00 €').should('exist')
      cy.contains('button', 'Retirer mon cashback disponible').should('exist')
      cy.get('input[id="iban"]')
        .type('FR1420041010050500013M02606')
        .scrollIntoView()
      cy.get('button[type="submit"]').click({ force: true }).scrollIntoView()
      cy.wait(2000)
      cy.contains('p', 'Montant cashback envoyé').should('exist')
    })
  })
})
