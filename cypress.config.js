const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    viewportWidth: 1100,
    viewportHeight: 900,
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 120000,
  },
  env: {
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
  },
  screenshotOnRunFailure: true,
  video: false,
});
