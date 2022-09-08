import $ from '@selectors/index'
import { fiatCurrencyCode, fiatMinAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Merchant - API - Apps - Create Order', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

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
    cy.loginViaAPI(email, password)

    cy.visit('/account/apps')

    cy.get($.GENERAL.LIST_ITEM)
      .should('be.visible')
      .and('have.length', 1)
  })

  it('Check if created order appears in "Orders"', () => {
    cy.getMerchantOrdersViaAPI()
      .then((response) => {
        const orderID = response.body.data[0].id

        cy.getApiAppsViaAPI()
          .then((response) => {
            const apiAppID = response.body.data[0].id

            cy.visit('/account/orders')

            cy.breadcrumbContains('/Account/Merchant/Orders')

            cy.headerContains('Merchant Orders')

            cy.get('thead')
              .should('be.visible')
              .and('have.length', 1)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'ID')
                cy.assertTableHeaderCellContains(1, 'Type')
                cy.assertTableHeaderCellContains(2, 'Title')
                cy.assertTableHeaderCellContains(3, 'Price')
                cy.assertTableHeaderCellContains(4, 'Pay Amount')
                cy.assertTableHeaderCellContains(5, 'Status')
                cy.assertTableHeaderCellContains(6, 'Created')
                cy.assertTableHeaderCellContains(7, 'Paid')
                cy.assertTableHeaderCellContains(8, 'Credit')
                cy.assertTableHeaderCellContains(9, 'Issue a refund')
                cy.assertTableHeaderCellContains(10, 'Generate Invoice')
              })

            cy.get('tbody tr')
              .should('be.visible')
              .and('have.length', 1)
              .within(() => {
                cy.assertTableDataCellContains(0, orderID)
                cy.assertTableDataCellContains(1, `API #${apiAppID}`)

                cy.assertTableDataCellIsEmpty(2)

                cy.assertTableDataCellContains(3, `${fiatMinAmount} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(4, '-')
                cy.assertTableDataCellContains(5, 'New')

                cy.assertTableDataCellIsNotEmpty(6)

                cy.assertTableDataCellIsEmpty(7)
                cy.assertTableDataCellIsEmpty(8)
                cy.assertTableDataCellIsEmpty(9)
                cy.assertTableDataCellIsEmpty(10)
              })
          })
      })
  })

  it('Check if created order is linked to API app', () => {
    cy.getApiAppsViaAPI()
      .then((response) => {
        const apiAppID = response.body.data[0].id

        cy.visit('/account/orders')

        cy.breadcrumbContains('/Account/Merchant/Orders')

        cy.headerContains('Merchant Orders')

        cy.get('tbody tr')
          .should('be.visible')
          .and('have.length', 1)
          .within(() => {
            cy.assertTableDataCellContains(1, `API #${apiAppID}`)
          })

        cy.visitFirstLinkInTable()

        cy.urlContains(`/account/apps/${apiAppID}`)

        cy.breadcrumbContains(`/Account/Merchant/Apps/App #${apiAppID}`)

        cy.headerContains(`App #${apiAppID}`)
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
