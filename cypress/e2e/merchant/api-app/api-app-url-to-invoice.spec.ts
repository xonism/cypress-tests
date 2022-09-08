import { fiatCurrencyCode, fiatMinAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Merchant - API - Apps - URL To Invoice', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check if payment URL leads to correct invoice', () => {
    cy.visit('/account/dashboard')

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMinAmount, fiatCurrencyCode, fiatCurrencyCode)
          .visitApiAppPaymentURL()
      })

    cy.urlContains('/invoice')

    cy.get('.business-name')
      .should('be.visible')
      .and('contain', business.businessTitle)

    cy.assertInvoiceElementsAreVisible()

    cy.get('.invoice-header')
      .should('be.visible')
      .and('contain', fiatMinAmount)
      .and('contain', fiatCurrencyCode)

    cy.getButtonWithText('Cancel')
      .click()

    cy.urlContains('/delete-sign.png')
  })

  afterEach(() => {
    cy.deleteAllApiApps()
  })
})
