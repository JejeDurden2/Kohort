import { faker } from '@faker-js/faker'
import 'cypress-iframe'

import exp = require('constants')

describe('template spec', () => {
  const secretKey = Cypress.env('STAGING_SECRET_KEY_KOHORT_REFERRAL')
  const API_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_API_URL')
      : Cypress.env('PROD_API_URL')
  const DASHBOARD_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_DASHBOARD_URL')
      : Cypress.env('PROD_DASHBOARD_URL')
  const MY_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_MY_URL')
      : Cypress.env('PROD_MY_URL')
  const CHECKOUT_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_CHECKOUT_URL')
      : Cypress.env('PROD_CHECKOUT_URL')
  let orderId = ''
  let paymentGroupShareId = ''

  beforeEach(() => {
    cy.viewport('macbook-13')
  })

  it('creates an order and a group', () => {
    cy.request({
      url: `${API_URL}/orders`,
      method: 'POST',
      auth: {
        bearer: secretKey,
      },
      body: {
        amount: 3000,
        customerFirstName: 'Test',
        customerLastName: 'Customer',
        customerEmail: 'e2e+frcypressTest@kohortpay.com',
        clientReferenceId: faker.string.uuid(),
      },
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('payment_group_id').to.not.be.null
      expect(response.body).to.have.property('status').to.eq('CREATED')
      orderId = response.body.id
    })
  })

  it('creates a en_US order and join a group', () => {
    cy.request({
      url: `${API_URL}/orders/${orderId}?expand[]=paymentGroup`,
      method: 'GET',
      auth: {
        bearer: secretKey,
      },
    }).then((response: any) => {
      paymentGroupShareId = response.body.payment_group_share_id
      cy.request({
        url: `${API_URL}/orders`,
        method: 'POST',
        auth: {
          bearer: secretKey,
        },
        body: {
          amount: 8000,
          customerFirstName: 'Thomas',
          customerLastName: 'Andrews',
          customerEmail: 'e2e+encypressTest@kohortpay.com',
          clientReferenceId: faker.string.uuid(),
          paymentGroupShareId,
          locale: 'en_US',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  it('creates a fr_FR order and join a group', () => {
    cy.request({
      url: `${API_URL}/orders/${orderId}?expand[]=paymentGroup`,
      method: 'GET',
      auth: {
        bearer: secretKey,
      },
    }).then((response: any) => {
      paymentGroupShareId = response.body.payment_group_share_id
      cy.request({
        url: `${API_URL}/orders`,
        method: 'POST',
        auth: {
          bearer: secretKey,
        },
        body: {
          amount: 5000,
          customerFirstName: 'Martin',
          customerLastName: 'Souriau',
          customerEmail: 'e2e+fr2cypressTest@kohortpay.com',
          clientReferenceId: faker.string.uuid(),
          paymentGroupShareId,
          locale: 'fr_FR',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  it('visits MY and checks display', () => {
    cy.visit(`${MY_URL}/en_US/pg/${paymentGroupShareId}`)
    cy.wait(2000)
    cy.contains('€3.00').should('exist')
    cy.contains('€80.00').should('exist')
    cy.contains('span', 'Invite').should('exist')
  })

  it('visits Cashback Withdrawal page and withdraw cashback', () => {
    cy.wait(120000) // need to wait for the cashback to be available (groups ends + cron job)
    cy.request({
      url: `${API_URL}/orders/${orderId}`,
      method: 'GET',
      auth: {
        bearer: secretKey,
      },
    }).then((response) => {
      const token = response.body.token
      cy.visit(`${CHECKOUT_URL}/w/${orderId}?token=${token}`)
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

  // Sign in with Clerk only work with chromeWebSecurity: true, so we can't use it for now because we need chromeWebSecurity: false to test the Stripe iframe
  it('logs in to dashboard', () => {
    cy.signIn()
    cy.visit(DASHBOARD_URL, { failOnStatusCode: false })
    cy.contains('Cypress Test').should('exist')
    cy.get('button[role="switch"]').click()
    cy.get('a[href="test/payment-groups"]').click()
    cy.contains('Groupes').should('exist')
    cy.contains(paymentGroupShareId).should('exist')
    cy.get('tbody tr:first').contains('td', 'finalisé')
    cy.signOut()
  })
})
