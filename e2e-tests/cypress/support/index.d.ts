declare global {
  namespace Cypress {
    interface Chainable {
      signIn(): Chainable<JQuery<HTMLElement>>
    }
  }
}

declare global {
  namespace Cypress {
    interface Chainable {
      signOut(): Chainable<JQuery<HTMLElement>>
    }
  }
}

export {}
