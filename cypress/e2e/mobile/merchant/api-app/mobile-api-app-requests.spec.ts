import $ from '@selectors/index'
import { fiatCurrencyCode, fiatMinAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - API - Requests', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const ipAddressRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/m

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMinAmount, fiatCurrencyCode, fiatCurrencyCode)
      })
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Check if "Create order" request appears in "Requests"', () => {
    cy.visit('/account/apps')

    cy.breadcrumbContains('/Account/Merchant/Apps')

    cy.headerContains('Apps')

    cy.get($.GENERAL.LIST_ITEM)
      .should('have.length', 1)
      .click()

    cy.getApiAppsViaAPI()
      .then((response) => {
        const apiAppID = response.body.data[0].id

        cy.urlContains(`/account/apps/${apiAppID}`) // all these steps give time for requests to execute

        cy.breadcrumbContains(`/Account/Merchant/Apps/App #${apiAppID}`)

        cy.headerContains(`App #${apiAppID}`)

        cy.get($.API_APP.BTN.EDIT)
          .should('be.visible')

        cy.get($.API_APP.BTN.CURRENCY_SETTINGS)
          .should('be.visible')

        cy.visit('/account/apps/api-requests')

        cy.breadcrumbContains('/Account/Merchant/Apps/API Requests')

        cy.headerContains('API requests')

        cy.get('thead')
          .should('be.visible')
          .within(() => {
            cy.assertTableHeaderCellContains(1, 'API App')
            cy.assertTableHeaderCellContains(2, 'Action')
            cy.assertTableHeaderCellContains(3, 'Response')
            cy.assertTableHeaderCellContains(4, 'IP Address')
            cy.assertTableHeaderCellContains(5, 'Time')
          })

        cy.get('tbody tr', { timeout: 20000 })
          .should('be.visible')
          .and('have.length', 1)
          .within(() => {
            cy.assertTableDataCellContains(1, `API App #${apiAppID}`)

            cy.get('td')
              .eq(1)
              .find('a')
              .invoke('attr', 'href')
              .should('contain', `account/apps/${apiAppID}`)

            cy.get('td')
              .eq(2)
              .find($.GENERAL.TAG)
              .should('contain', 'POST')

            cy.assertTableDataCellContains(2, '/v2/orders')

            cy.get('td')
              .eq(3)
              .find($.GENERAL.TAG)
              .should('contain', '200')

            cy.get('td')
              .eq(4)
              .invoke('text')
              .should('match', ipAddressRegex)

            cy.assertTableDataCellIsNotEmpty(5)
          })
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
