import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode, fiatMinAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - API - Callbacks', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
  })

  it('[Mobile] Check if request with "Pending" order status appears in "Callbacks"', () => {
    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMinAmount, fiatCurrencyCode, fiatCurrencyCode)
          .visitApiAppPaymentURL()
      })

    cy.selectCryptoCurrencyInInvoice(cryptoCurrencySymbol)

    cy.get('#invoice-checkout-button') // FIXME: fix these steps after new invoice launch
      .click()

    cy.get('[data-test="invoice-amount-input"]')
      .siblings('.ant-input-prefix')
      .should('contain', cryptoCurrencySymbol)

    cy.get('.invoice-progress-bar')
      .should('be.visible')

    cy.get('#invoice-qr-code')
      .should('be.visible')

    cy.visit('/account/apps/api-payment-callbacks')

    cy.breadcrumbContains('/Account/Merchant/Apps/API Callbacks')

    cy.headerContains('API Payment Callbacks')

    cy.getApiPaymentCallbacksViaAPI()
      .then((response) => {
        const paymentCallback = response.body.data[0]
        const paymentCallbackID = paymentCallback.id
        const paymentCallbackRequestCount = paymentCallback.requests_count
        const orderID = paymentCallback.api_order.order_id

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, paymentCallbackID)
            cy.assertTableDataCellContains(1, `Order #${orderID}`)

            cy.get('td')
              .eq(1)
              .find('a')
              .invoke('attr', 'href')
              .should('equal', `/account/orders/${orderID}`)

            cy.assertTableDataCellContains(2, 'Order')
            cy.assertTableDataCellContains(3, 'Pending')

            cy.assertTableDataCellIsNotEmpty(4)

            cy.assertTableDataCellContains(5, paymentCallbackRequestCount)
          })
      })
  })

  it('[Mobile] Check if request with "Paid" order status appears in "Callbacks"', () => {
    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMinAmount, fiatCurrencyCode, fiatCurrencyCode)
          .markApiAppOrderAsPaid(cryptoCurrencySymbol)
      })

    cy.visit('/account/apps/api-payment-callbacks')

    cy.breadcrumbContains('/Account/Merchant/Apps/API Callbacks')

    cy.headerContains('API Payment Callbacks')

    cy.getApiPaymentCallbacksViaAPI()
      .then((response) => {
        const paymentCallback = response.body.data.find((callback) => callback.api_callbackable_status === 'paid')
        const paymentCallbackID = paymentCallback.id
        const paymentCallbackRequestCount = paymentCallback.requests_count
        const orderID = paymentCallback.api_order.order_id

        cy.contains('tbody tr', 'Paid')
          .within(() => {
            cy.assertTableDataCellContains(0, paymentCallbackID)
            cy.assertTableDataCellContains(1, `Order #${orderID}`)

            cy.get('td')
              .eq(1)
              .find('a')
              .invoke('attr', 'href')
              .should('equal', `/account/orders/${orderID}`)

            cy.assertTableDataCellContains(2, 'Order')
            cy.assertTableDataCellContains(3, 'Paid')

            cy.assertTableDataCellIsNotEmpty(4)

            cy.assertTableDataCellContains(5, paymentCallbackRequestCount)
          })
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
