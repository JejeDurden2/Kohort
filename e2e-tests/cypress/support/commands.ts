// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

interface CustomWindow extends Window {
  Clerk: {
    isReady: () => boolean
    client: {
      signIn: {
        create: (options: {
          identifier: string
          password: string
        }) => Promise<{ createdSessionId: string }>
      }
    }
    setActive: (options: { session: string }) => Promise<void>
  }
}

Cypress.Commands.add('signOut', () => {
  const DASHBOARD_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_DASHBOARD_URL')
      : Cypress.env('PRODUCTION_DASHBOARD_URL')
  cy.log(`sign out by clearing all cookies.`)
  cy.clearCookies({ domain: null })
})

Cypress.Commands.add(`signIn`, () => {
  const DASHBOARD_URL =
    Cypress.env('NODE_ENV') === 'staging'
      ? Cypress.env('STAGING_DASHBOARD_URL')
      : Cypress.env('PRODUCTION_DASHBOARD_URL')
  cy.visit(`${DASHBOARD_URL}/sign-in`, {
    failOnStatusCode: false,
  })

  cy.window()
    .should((window: Window) => {
      const customWindow = window as CustomWindow // Type assertion
      expect(customWindow).to.not.have.property('Clerk', undefined)
      expect(customWindow.Clerk.isReady()).to.eq(true)
    })
    .then(async (window: Window) => {
      const customWindow = window as CustomWindow // Type assertion
      cy.clearCookies({ domain: customWindow.location.hostname })

      const res = await customWindow.Clerk.client.signIn.create({
        identifier: Cypress.env('CYPRESS_TEST_EMAIL') as string,
        password: Cypress.env('CYPRESS_TEST_PASSWORD') as string,
      })

      await customWindow.Clerk.setActive({
        session: res.createdSessionId,
      })

      cy.log('Finished Signing in.')
    })
})
