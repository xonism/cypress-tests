import { defineConfig } from 'cypress'

export default defineConfig({
  numTestsKeptInMemory: 10,
  watchForFileChanges: false,
  chromeWebSecurity: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  projectId: 'cqn4of',
  videoUploadOnPasses: false,
  retries: 2,
  e2e: {
    // We've imported your old cypress plugins here
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    experimentalSessionAndOrigin: true,
  },
})
