import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Exchange - Create Order', () => {
  const { email, password, countryCode } = generateTrader()

  const { BTC, LTC, USDT } = cryptoPayoutCurrencyInfo

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(BTC)
    cy.addAndConfirmCryptoPayoutSettingViaAPI(LTC)
    cy.addAndConfirmCryptoPayoutSettingViaAPI(USDT)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  function exchangeTest (firstCurrency, secondCurrency) {
    it(`[Mark as Paid] Create ${firstCurrency.currencySymbol} to ${secondCurrency.currencySymbol} exchange order`, () => {
      cy.visit('/account/trader/trade#swap')

      cy.wait('@getOrderDetails')

      cy.breadcrumbContains('/Account/Trader/Buy & Sell')

      cy.selectTraderCountry(traderCountry)

      cy.get($.TRADER.BTN.EXCHANGE)
        .should('have.class', 'active')

      cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
        .click()

      cy.assertNumberOfExplainMessages(2)

      cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, firstCurrency)

      cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, secondCurrency)

      cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
        .typeAndAssertValueWithPulseCheck(firstCurrency.amount)

      cy.wait('@getOrderDetails')

      cy.assertOrderDetailsTotalAmount(firstCurrency.amount, firstCurrency.currencySymbol)

      cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, secondCurrency.currencySymbol)

      cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
        .click()

      cy.urlContains('/invoice')

      cy.validateInvoice({ currency: firstCurrency.currencySymbol })

      cy.get('.invoice-header')// FIXME: fix these steps after new invoice launch
        .should('contain', `${firstCurrency.amount} ${firstCurrency.currencySymbol}`)
        .and('contain', firstCurrency.platform.title)

      cy.get('.ant-input-prefix')
        .first()
        .should('contain', firstCurrency.currencySymbol)

      cy.get('[data-test="invoice-amount-input"]')
        .should('have.value', firstCurrency.amount)

      cy.get('[data-test="button-mark-as-paid"]')
        .click()

      cy.get('#invoice-paid h2')
        .should('contain', 'Paid and Confirmed')

      cy.get('.invoice-header')
        .should('contain', `${firstCurrency.amount} ${firstCurrency.currencySymbol}`)
        .and('contain', firstCurrency.platform.title)

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
        .and('contain', 'Swap')
        .and('contain', `${firstCurrency.amount} ${firstCurrency.currencySymbol}`)
    })

    if (firstCurrency.currencySymbol === Object.keys(cryptoPayoutCurrencyInfo)[0]) {
      it(`[Mark as Invalid] Create ${firstCurrency.currencySymbol} to ${secondCurrency.currencySymbol} exchange order`, () => {
        cy.loginViaAPI(email, password)

        cy.visit('/account/trader/trade#swap')

        cy.wait('@getOrderDetails')

        cy.breadcrumbContains('/Account/Trader/Buy & Sell')

        cy.selectTraderCountry(traderCountry)

        cy.get($.TRADER.BTN.EXCHANGE)
          .should('have.class', 'active')

        cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
          .click()

        cy.assertNumberOfExplainMessages(2)

        cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, firstCurrency)

        cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, secondCurrency)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValueWithPulseCheck(firstCurrency.amount)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsTotalAmount(firstCurrency.amount, firstCurrency.currencySymbol)

        cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, secondCurrency.currencySymbol)

        cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
          .click()

        cy.urlContains('/invoice')

        cy.validateInvoice({ currency: firstCurrency.currencySymbol })

        cy.get('.invoice-header')// FIXME: fix these steps after new invoice launch
          .should('contain', `${firstCurrency.amount} ${firstCurrency.currencySymbol}`)
          .and('contain', firstCurrency.platform.title)

        cy.get('.ant-input-prefix')
          .first()
          .should('contain', firstCurrency.currencySymbol)

        cy.get('[data-test="invoice-amount-input"]')
          .should('have.value', firstCurrency.amount)

        cy.get('[data-test="button-mark-as-invalid"]')
          .click()

        cy.get('#payment-default h2')
          .should('contain', 'This order is invalid')

        cy.get('.invoice-header')
          .should('contain', `${firstCurrency.amount} ${firstCurrency.currencySymbol}`)
          .and('contain', firstCurrency.platform.title)

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
          .and('contain', 'Swap')
          .and('contain', `${firstCurrency.amount} ${firstCurrency.currencySymbol}`)
      })
    }
  }

  exchangeTest(BTC, LTC)
  exchangeTest(LTC, USDT)
  exchangeTest(USDT, BTC)
})
