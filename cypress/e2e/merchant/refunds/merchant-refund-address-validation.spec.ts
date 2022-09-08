import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { fiatCurrencyCode, fiatMinAmount, fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateEmail, generateTrader } from '@entity/entity-helper-functions'

describe('Merchant - Refunds - Address Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, payoutAddress } = receiveCurrency

  const refundReason = 'Testing address validation'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.enableLedgerForMerchantViaAPI()

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatTargetAmount, fiatCurrencyCode, currencySymbol)
          .markApiAppOrderAsPaid(currencySymbol)
      })
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check refund address validation', () => {
    cy.visit('/account/orders')
    cy.breadcrumbContains('/Account/Merchant/Orders')
    cy.headerContains('Merchant Orders')

    cy.get('tbody tr')
      .should('have.length', 1)
      .click()

    cy.getMerchantOrdersViaAPI()
      .then((response) => {
        const orderID = response.body.data[0].id

        cy.urlContains(`/account/orders/${orderID}`)
        cy.breadcrumbContains(`/Account/Merchant/Orders/Order #${orderID}`)
        cy.headerContains(`Order #${orderID}`)

        cy.get($.MERCHANT.REFUNDS.DIV.REFUNDS)
          .should('be.visible')
          .within(() => {
            cy.headerContains('Refunds')
          })

        cy.selectRefundBalance(orderID, receiveCurrency)

        cy.get($.MERCHANT.REFUNDS.INPUT.AMOUNT)
          .typeAndAssertValue(fiatTargetAmount)

        cy.assertOriginalPriceCurrencyIsCorrect(fiatCurrencyCode)

        cy.get($.MERCHANT.REFUNDS.INPUT.EMAIL)
          .typeAndAssertValue(generateEmail())

        cy.selectRefundCurrency(receiveCurrency)

        cy.selectRefundNetwork(receiveCurrency)

        cy.get($.MERCHANT.REFUNDS.INPUT.ADDRESS)
          .typeAndAssertValue(payoutAddress)

        cy.get($.MERCHANT.REFUNDS.INPUT.REASON)
          .typeAndAssertValue(refundReason)

        cy.intercept(`/account/orders/${orderID}/submit-refund`)
          .as('submitRefund')

        cy.get($.MERCHANT.REFUNDS.BTN.SUBMIT)
          .should('be.visible')
          .click()

        cy.wait('@submitRefund')

        cy.get($.GENERAL.MESSAGE_NOTICE_CONTENT)
          .should('be.visible')
          .and('contain', 'Refund submitted successfully')
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
