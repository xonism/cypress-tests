import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Sell - SEPA', () => {
  const { email, password, countryCode } = generateTrader()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmFiatPayoutSettingViaAPI()
  })

  beforeEach(() => {
    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  for (const currency in cryptoPayoutCurrencyInfo) {
    const { currencySymbol, amount, platform } = cryptoPayoutCurrencyInfo[currency]

    it(`[Mark as Paid] Create sell ${currencySymbol} order with SEPA`, () => {
      cy.loginViaAPI(email, password)

      cy.visit('/account/trader/trade#sell')

      cy.wait('@getOrderDetails')

      cy.breadcrumbContains('/Account/Trader/Buy & Sell')

      cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
        .click()

      cy.assertNumberOfExplainMessages(2)

      cy.selectTraderCurrency($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

      cy.selectTraderCountry(traderCountry)

      cy.selectCryptoCurrency($.TRADER.SELL.DROPDOWN.SELL_CURRENCY, cryptoPayoutCurrencyInfo[currency])

      cy.assertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

      cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
        .typeAndAssertValueWithPulseCheck(amount)

      cy.wait('@getOrderDetails')

      cy.assertOrderDetailsTotalAmount(amount, currencySymbol)

      cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

      cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
        .click()

      cy.urlContains('/invoice')

      cy.validateInvoice({ currency: currencySymbol })

      cy.get('.invoice-header')// FIXME: fix these steps after new invoice launch
        .should('contain', `${amount} ${currencySymbol}`)
        .and('contain', platform.title)

      cy.get('.ant-input-prefix')
        .first()
        .should('contain', currencySymbol)

      cy.get('[data-test="invoice-amount-input"]')
        .should('have.value', amount)

      cy.get('[data-test="button-mark-as-paid"]')
        .click()

      cy.get('#invoice-paid h2')
        .should('contain', 'Paid and Confirmed')

      cy.get('.invoice-header')
        .should('contain', `${amount} ${currencySymbol}`)
        .and('contain', platform.title)

      cy.getButtonWithText('Back')
        .click()

      cy.urlContains('/success')

      cy.breadcrumbContains('/Account/Trader/Success')

      cy.contains($.GENERAL.TITLE.TITLE, 'Payment Received')
        .should('be.visible')

      cy.contains('.point', 'Withdrawal Created')
        .should('contain', new Date().getFullYear())

      cy.getButtonWithText('Go to Dashboard')
        .click()

      cy.urlContains('/account/dashboard')

      cy.breadcrumbContains('/Account/Dashboard')

      cy.get('tbody tr')
        .first()
        .should('contain', 'Completed')
        .and('contain', 'Sell')
        .and('contain', `${amount} ${currencySymbol}`)
    })

    if (currencySymbol === Object.keys(cryptoPayoutCurrencyInfo)[0]) {
      it(`[Mark as Invalid] Create sell ${currencySymbol} order with SEPA`, () => {
        cy.loginViaAPI(email, password)

        cy.visit('/account/trader/trade#sell')

        cy.wait('@getOrderDetails')

        cy.breadcrumbContains('/Account/Trader/Buy & Sell')

        cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
          .click()

        cy.assertNumberOfExplainMessages(2)

        cy.selectTraderCurrency($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

        cy.selectTraderCountry(traderCountry)

        cy.selectCryptoCurrency($.TRADER.SELL.DROPDOWN.SELL_CURRENCY, cryptoPayoutCurrencyInfo[currency])

        cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .typeAndAssertValueWithPulseCheck(amount)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsTotalAmount(amount, currencySymbol)

        cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

        cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
          .click()

        cy.urlContains('/invoice')

        cy.validateInvoice({ currency: currencySymbol })

        cy.get('.invoice-header')
          .should('contain', `${amount} ${currencySymbol}`)
          .and('contain', platform.title)

        cy.get('.ant-input-prefix')
          .first()
          .should('contain', currencySymbol)

        cy.get('[data-test="invoice-amount-input"]')
          .should('have.value', amount)

        cy.get('[data-test="button-mark-as-invalid"]')
          .click()

        cy.get('#payment-default h2')
          .should('contain', 'This order is invalid')

        cy.get('.invoice-header')
          .should('contain', `${amount} ${currencySymbol}`)
          .and('contain', platform.title)

        cy.getButtonWithText('Back')
          .click()

        cy.urlContains('/success')

        cy.breadcrumbContains('/Account/Trader/Success')

        cy.contains($.GENERAL.TITLE.TITLE, 'Payment Received')
          .should('be.visible')

        cy.contains('.point', 'Withdrawal Created')
          .should('not.contain', new Date().getFullYear())

        cy.getButtonWithText('Go to Dashboard')
          .click()

        cy.urlContains('/account/dashboard')

        cy.breadcrumbContains('/Account/Dashboard')

        cy.get('tbody tr')
          .first()
          .should('contain', 'Waiting for payment')
          .and('contain', 'Sell')
          .and('contain', `${amount} ${currencySymbol}`)
      })
    }
  }
})
