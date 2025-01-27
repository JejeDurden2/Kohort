import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  chromeWebSecurity: true,
  projectId: 't278in',
  video: true,
})
